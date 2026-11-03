package com.ecommerce.service;

import com.ecommerce.dto.CouponDTO;
import com.ecommerce.dto.CouponPreviewDTO;
import com.ecommerce.model.Coupon;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.ecommerce.model.type.CouponType;
import com.ecommerce.repository.CouponRepository;
import com.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Coupon rules. A coupon counts as used when an order is committed (COD confirmed or card paid),
 * not when checkout starts, so abandoned card checkouts do not use it up. Cancelling gives the use back.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private static final Pattern CODE_FORMAT = Pattern.compile("[A-Z0-9_-]{3,30}");
    private static final int MAX_AMOUNT = 10_000_000;

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;

    // ─────────────────────────────────────────────────────────────
    // Checkout
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CouponPreviewDTO preview(String code, Integer subtotal, User user) {
        int amount = subtotal != null ? subtotal : 0;
        Coupon coupon = requireApplicable(code, amount, user != null ? user.getEmail() : null, null);
        return new CouponPreviewDTO(coupon.getCode(), coupon.getDescription(), coupon.discountFor(amount));
    }

    /** Returns the coupon if this customer can use it on this subtotal; otherwise throws a message for the shopper. */
    @Transactional(readOnly = true)
    public Coupon requireApplicable(String rawCode, int subtotal, String email, String phone) {
        Coupon coupon = couponRepository.findByCode(normalize(rawCode))
                .orElseThrow(() -> new RuntimeException("This coupon code is not valid"));
        Instant now = Instant.now();

        if (!coupon.isActive() || (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt()))) {
            throw new RuntimeException("This coupon code is not valid");
        }
        if (coupon.getExpiresAt() != null && !now.isBefore(coupon.getExpiresAt())) {
            throw new RuntimeException("This coupon has expired");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new RuntimeException("This coupon has reached its usage limit");
        }
        if (subtotal < coupon.getMinOrderAmount()) {
            throw new RuntimeException("This coupon needs a minimum order of ৳" + coupon.getMinOrderAmount());
        }
        if (coupon.getMaxUsesPerCustomer() != null
                && usesByCustomer(coupon.getCode(), email, phone) >= coupon.getMaxUsesPerCustomer()) {
            throw new RuntimeException("You have already used this coupon");
        }
        return coupon;
    }

    /** Same customer = same account/guest email or same delivery phone, so a new email is not a new customer. */
    private long usesByCustomer(String code, String email, String phone) {
        String normalizedEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        String normalizedPhone = phone != null ? phone.trim() : "";
        if (normalizedEmail.isEmpty() && normalizedPhone.isEmpty()) return 0;
        return orderRepository.countCouponUsesByCustomer(code, normalizedEmail, normalizedPhone);
    }

    /** COD: checked again here, because the coupon may have run out since checkout started. */
    public void redeemOrThrow(Order order) {
        if (!needsRedeeming(order)) return;
        Coupon coupon = requireApplicable(order.getCouponCode(), Math.toIntExact(SalesMetrics.itemsSubtotal(order)),
                customerEmail(order), customerPhone(order));
        if (couponRepository.incrementIfAvailable(coupon.getId()) == 0) {
            throw new RuntimeException("This coupon has reached its usage limit");
        }
        order.setCouponRedeemed(true);
    }

    /** Card: the customer has already paid this total, so the use is recorded even if the limit was passed meanwhile. */
    public void redeemPaid(Order order) {
        if (!needsRedeeming(order)) return;
        couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
            couponRepository.increment(coupon.getId());
            order.setCouponRedeemed(true);
        });
    }

    public void release(Order order) {
        if (!Boolean.TRUE.equals(order.getCouponRedeemed())) return;
        couponRepository.findByCode(order.getCouponCode())
                .ifPresent(coupon -> couponRepository.decrement(coupon.getId()));
        order.setCouponRedeemed(false);
    }

    private boolean needsRedeeming(Order order) {
        return order.getCouponCode() != null && !Boolean.TRUE.equals(order.getCouponRedeemed());
    }

    private String customerEmail(Order order) {
        return order.getUser() != null ? order.getUser().getEmail() : order.getGuestEmail();
    }

    private String customerPhone(Order order) {
        return order.getShippingAddress() != null ? order.getShippingAddress().getPhone() : null;
    }

    // ─────────────────────────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CouponDTO> getAll() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).toList();
    }

    public CouponDTO create(CouponDTO request) {
        return toDTO(couponRepository.save(apply(new Coupon(), request)));
    }

    public CouponDTO update(Long id, CouponDTO request) {
        return toDTO(couponRepository.save(apply(find(id), request)));
    }

    public void delete(Long id) {
        Coupon coupon = find(id);
        if (coupon.getUsedCount() > 0) {
            throw new RuntimeException("This coupon has been used on orders. Turn it off instead of deleting it.");
        }
        couponRepository.delete(coupon);
    }

    private Coupon find(Long id) {
        return couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    private Coupon apply(Coupon coupon, CouponDTO request) {
        String code = normalize(request.getCode());
        if (!CODE_FORMAT.matcher(code).matches()) {
            throw new RuntimeException("Code must be 3-30 letters, numbers, - or _");
        }
        if (!code.equals(coupon.getCode())) {
            if (coupon.getUsedCount() > 0) {
                throw new RuntimeException("The code of a coupon that has been used cannot be changed");
            }
            if (couponRepository.existsByCode(code)) {
                throw new RuntimeException("A coupon with this code already exists");
            }
        }

        CouponType type = request.getType();
        if (type == null) throw new RuntimeException("Choose a discount type");
        int value = request.getDiscountValue() != null ? request.getDiscountValue() : 0;
        if (value <= 0 || value > (type == CouponType.PERCENT ? 100 : MAX_AMOUNT)) {
            throw new RuntimeException(type == CouponType.PERCENT
                    ? "Percentage must be between 1 and 100"
                    : "Discount amount must be more than 0");
        }
        int minOrder = request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0;
        if (minOrder < 0 || minOrder > MAX_AMOUNT) throw new RuntimeException("Minimum order amount is invalid");
        requirePositive(request.getMaxDiscount(), "Maximum discount");
        requirePositive(request.getMaxUses(), "Total usage limit");
        requirePositive(request.getMaxUsesPerCustomer(), "Per-customer limit");
        if (request.getStartsAt() != null && request.getExpiresAt() != null
                && !request.getExpiresAt().isAfter(request.getStartsAt())) {
            throw new RuntimeException("The end date must be after the start date");
        }

        coupon.setCode(code);
        coupon.setDescription(request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription().trim() : null);
        coupon.setType(type);
        coupon.setDiscountValue(value);
        coupon.setMinOrderAmount(minOrder);
        coupon.setMaxDiscount(type == CouponType.PERCENT ? request.getMaxDiscount() : null);
        coupon.setStartsAt(request.getStartsAt());
        coupon.setExpiresAt(request.getExpiresAt());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setMaxUsesPerCustomer(request.getMaxUsesPerCustomer());
        coupon.setActive(request.getActive() == null || request.getActive());
        return coupon;
    }

    private void requirePositive(Integer value, String label) {
        if (value != null && value <= 0) throw new RuntimeException(label + " must be more than 0, or left empty");
    }

    private static String normalize(String code) {
        return code != null ? code.trim().toUpperCase(Locale.ROOT) : "";
    }

    private CouponDTO toDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setType(coupon.getType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setMaxDiscount(coupon.getMaxDiscount());
        dto.setStartsAt(coupon.getStartsAt());
        dto.setExpiresAt(coupon.getExpiresAt());
        dto.setMaxUses(coupon.getMaxUses());
        dto.setMaxUsesPerCustomer(coupon.getMaxUsesPerCustomer());
        dto.setUsedCount(coupon.getUsedCount());
        dto.setActive(coupon.isActive());
        dto.setCreatedAt(coupon.getCreatedAt());
        return dto;
    }
}
