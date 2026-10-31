package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.model.*;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;
import com.ecommerce.model.type.ShippingAddress;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    /** Free shipping above this subtotal (must match the frontend cart/checkout pages). */
    private static final int MAX_ITEM_QUANTITY = 100;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final AddressService addressService;
    private final AddressRepository addressRepository;
    private final EmailService emailService;
    private final SiteContentService siteContentService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /** One order line before it is persisted. */
    private record OrderLine(Product product, int quantity, String size, String color) {
    }

    // ─────────────────────────────────────────────────────────────
    // Logged-in user checkout
    // ─────────────────────────────────────────────────────────────

    public OrderDTO createOrder(Long userId, CheckoutRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        ShippingAddress shippingAddress;
        if (request.getAddressId() != null) {
            Address saved = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            shippingAddress = ShippingAddress.builder()
                    .fullName(saved.getFullName())
                    .phone(saved.getPhone())
                    .addressLine(saved.getAddressLine())
                    .city(saved.getCity())
                    .district(saved.getDistrict() != null ? saved.getDistrict() : saved.getArea())
                    .postalCode(saved.getPostalCode())
                    .build();
        } else {
            validateAddress(request.getFullName(), request.getPhone(),
                    request.getAddressLine(), request.getCity());

            shippingAddress = ShippingAddress.builder()
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .addressLine(request.getAddressLine())
                    .city(request.getCity())
                    .district(request.getDistrict())
                    .postalCode(request.getPostalCode())
                    .build();

            if (Boolean.TRUE.equals(request.getSaveAddress()) && !alreadySaved(userId, request)) {
                AddressRequestDTO addrReq = new AddressRequestDTO();
                addrReq.setFullName(request.getFullName());
                addrReq.setPhone(request.getPhone());
                addrReq.setAddressLine(request.getAddressLine());
                addrReq.setArea(request.getArea() != null ? request.getArea() : request.getCity());
                addrReq.setCity(request.getCity());
                addrReq.setDistrict(request.getDistrict());
                addrReq.setPostalCode(request.getPostalCode());
                addrReq.setIsDefault(false);
                addressService.addAddress(userId, addrReq);
            }
        }

        List<OrderLine> lines = cart.getCartItems().stream()
                .map(ci -> new OrderLine(ci.getProduct(),
                        ci.getQuantity() != null ? ci.getQuantity() : 0,
                        ci.getSize(), ci.getColor()))
                .collect(Collectors.toList());

        Order order = buildOrder(user, null, shippingAddress, lines,
                parsePaymentMethod(request.getPaymentMethod()));

        return toDTO(orderRepository.save(order));
    }

    public OrderDTO confirmCODOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");

        Order saved = markAsCOD(order);
        cartService.clearCart(userId);
        sendConfirmationEmail(saved);
        return toDTO(saved);
    }

    public OrderDTO confirmPayment(Long userId, PaymentConfirmDTO request) {
        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");

        boolean newlyPaid = markAsPaid(order, request.getPaymentIntentId());
        if (newlyPaid) {
            cartService.clearCart(userId);
            sendConfirmationEmail(order);
        }
        return toDTO(order);
    }

    // ─────────────────────────────────────────────────────────────
    // Guest checkout (no login required)
    // ─────────────────────────────────────────────────────────────

    public OrderDTO createGuestOrder(GuestCheckoutRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (email.isEmpty() || !email.contains("@")) {
            throw new RuntimeException("A valid email is required");
        }
        validateAddress(request.getFullName(), request.getPhone(),
                request.getAddressLine(), request.getCity());

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        List<OrderLine> lines = new ArrayList<>();
        for (GuestCheckoutRequestDTO.Item item : request.getItems()) {
            if (item.getProductId() == null) {
                throw new RuntimeException("Invalid product in cart");
            }
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Some products in your cart are no longer available"));
            lines.add(new OrderLine(product,
                    item.getQuantity() != null ? item.getQuantity() : 0,
                    product.resolveSize(item.getSize()), item.getColor()));
        }

        ShippingAddress shippingAddress = ShippingAddress.builder()
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .addressLine(request.getAddressLine().trim())
                .city(request.getCity().trim())
                .district(request.getDistrict() != null && !request.getDistrict().isBlank()
                        ? request.getDistrict() : request.getArea())
                .postalCode(request.getPostalCode())
                .build();

        Order order = buildOrder(null, email, shippingAddress, lines,
                parsePaymentMethod(request.getPaymentMethod()));
        order.setGuestToken(generateGuestToken());

        Order saved = orderRepository.save(order);
        OrderDTO dto = toDTO(saved);
        dto.setGuestToken(saved.getGuestToken());
        return dto;
    }

    public OrderDTO confirmGuestCODOrder(Long orderId, String guestToken) {
        Order order = findGuestOrder(orderId, guestToken);
        Order saved = markAsCOD(order);
        sendConfirmationEmail(saved);
        return toDTO(saved);
    }

    public OrderDTO confirmGuestPayment(Long orderId, String paymentIntentId, String guestToken) {
        Order order = findGuestOrder(orderId, guestToken);
        if (markAsPaid(order, paymentIntentId)) {
            sendConfirmationEmail(order);
        }
        return toDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getGuestOrder(Long orderId, String guestToken) {
        return toDTO(findGuestOrder(orderId, guestToken));
    }

    private Order findGuestOrder(Long orderId, String guestToken) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getGuestToken() == null || guestToken == null
                || !MessageDigest.isEqual(
                order.getGuestToken().getBytes(StandardCharsets.UTF_8),
                guestToken.getBytes(StandardCharsets.UTF_8))) {
            throw new RuntimeException("Order not found");
        }
        return order;
    }

    // ─────────────────────────────────────────────────────────────
    // Shared order logic
    // ─────────────────────────────────────────────────────────────

    private Order buildOrder(User user, String guestEmail, ShippingAddress shippingAddress,
                             List<OrderLine> lines, PaymentMethod paymentMethod) {
        int subtotal = 0;
        for (OrderLine line : lines) {
            if (line.product() == null || !line.product().isActive()) {
                throw new RuntimeException("Some products in your cart are no longer available");
            }
            if (line.quantity() <= 0 || line.quantity() > MAX_ITEM_QUANTITY) {
                throw new RuntimeException("Invalid quantity in cart");
            }
            ensureEnoughStock(line.product(), line.quantity());
            subtotal += line.product().calculateSellingPrice() * line.quantity();
        }

        if (subtotal <= 0) {
            throw new RuntimeException("Invalid order amount");
        }

        // Delivery charge comes from Admin -> Delivery (inside / outside Dhaka)
        boolean insideDhaka = shippingAddress != null
                && SiteSettings.isDhaka(shippingAddress.getCity(), shippingAddress.getDistrict());
        int shippingFee = siteContentService.getSettings().deliveryChargeFor(subtotal, insideDhaka);
        int totalAmount = subtotal + shippingFee;

        Order order = Order.builder()
                .user(user)
                .guestEmail(guestEmail)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .paymentMethod(paymentMethod)
                .codCollected(false)
                .build();

        List<OrderItem> orderItems = lines.stream()
                .map(line -> OrderItem.builder()
                        .order(order)
                        .product(line.product())
                        .quantity(line.quantity())
                        .priceAtPurchase(line.product().calculateSellingPrice())
                        .size(line.size())
                        .color(line.color())
                        .build())
                .collect(Collectors.toList());
        order.setItems(orderItems);

        if (paymentMethod == PaymentMethod.CARD) {
            createPaymentIntent(order);
        }
        return order;
    }

    private void createPaymentIntent(Order order) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new RuntimeException("Card payment is not available right now. Please choose Cash on Delivery.");
        }
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) order.getTotalAmount() * 100)
                    .setCurrency("usd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            order.setStripePaymentIntentId(intent.getId());
            order.setStripeClientSecret(intent.getClientSecret());
        } catch (Exception e) {
            log.error("Stripe error", e);
            throw new RuntimeException("Payment initialization failed");
        }
    }

    private Order markAsCOD(Order order) {
        if (order.getStatus() != OrderStatus.PENDING)
            throw new RuntimeException("Order already processed");

        // Check again at confirmation time: stock may have changed since checkout
        for (OrderItem item : order.getItems()) {
            ensureEnoughStock(item.getProduct(), item.getQuantity());
        }

        order.setPaymentMethod(PaymentMethod.COD);
        order.setStripePaymentIntentId(null);
        order.setStripeClientSecret(null);
        order.setStatus(OrderStatus.CONFIRMED);
        deductStock(order);
        return orderRepository.save(order);
    }

    /**
     * Verifies the Stripe payment and marks the order as PAID.
     *
     * @return true if the order was marked paid by this call, false if it was already paid
     */
    private boolean markAsPaid(Order order, String paymentIntentId) {
        if (order.getStatus() == OrderStatus.PAID)
            return false;

        if (order.getStatus() != OrderStatus.PENDING)
            throw new RuntimeException("Order already processed");

        // The payment intent must belong to this order; otherwise a single succeeded
        // payment could be replayed to mark other orders as paid.
        if (order.getStripePaymentIntentId() == null
                || !order.getStripePaymentIntentId().equals(paymentIntentId))
            throw new RuntimeException("Payment does not match this order");

        PaymentIntent intent;
        try {
            intent = PaymentIntent.retrieve(order.getStripePaymentIntentId());
        } catch (Exception e) {
            log.error("Payment confirm error", e);
            throw new RuntimeException("Payment confirmation failed");
        }

        long expectedAmount = (long) order.getTotalAmount() * 100;
        if (!"succeeded".equals(intent.getStatus())
                || intent.getAmount() == null
                || intent.getAmount() != expectedAmount) {
            throw new RuntimeException("Payment has not been completed");
        }

        order.setStatus(OrderStatus.PAID);
        // The customer has already paid, so the order is kept even if stock ran short meanwhile
        deductStock(order);
        orderRepository.save(order);
        return true;
    }

    private void ensureEnoughStock(Product product, int quantity) {
        int stock = product.getStockQuantity();
        if (stock <= 0) {
            throw new RuntimeException(product.getName() + " is out of stock");
        }
        if (quantity > stock) {
            throw new RuntimeException("Only " + stock + " left in stock for " + product.getName());
        }
    }

    /** Subtracts the ordered quantities from product stock once per order. */
    /** Skips saving the same address twice when the box stays ticked on every checkout. */
    private boolean alreadySaved(Long userId, CheckoutRequestDTO request) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream().anyMatch(a ->
                same(a.getPhone(), request.getPhone())
                        && same(a.getAddressLine(), request.getAddressLine())
                        && same(a.getCity(), request.getCity()));
    }

    private static boolean same(String a, String b) {
        return a != null && b != null && a.trim().equalsIgnoreCase(b.trim());
    }

    private void deductStock(Order order) {
        if (Boolean.TRUE.equals(order.getStockDeducted())) return;
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product == null) continue;
            product.setStockQuantity(Math.max(0, product.getStockQuantity() - item.getQuantity()));
            productRepository.save(product);
        }
        order.setStockDeducted(true);
    }

    /** Puts the quantities back when an order whose stock was taken is cancelled. */
    private void restoreStock(Order order) {
        if (!Boolean.TRUE.equals(order.getStockDeducted())) return;
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product == null) continue;
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        order.setStockDeducted(false);
    }

    private void sendConfirmationEmail(Order order) {
        String email;
        String name;
        if (order.getUser() != null) {
            email = order.getUser().getEmail();
            name = order.getUser().getFullName();
        } else {
            email = order.getGuestEmail();
            name = order.getShippingAddress() != null ? order.getShippingAddress().getFullName() : null;
        }
        if (email == null || email.isBlank()) return;

        try {
            emailService.sendOrderConfirmationEmail(email, name != null ? name : "Customer", toDTO(order));
            log.info("Order confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    private void validateAddress(String fullName, String phone, String addressLine, String city) {
        if (fullName == null || fullName.isBlank()) throw new RuntimeException("Full name is required");
        if (phone == null || phone.isBlank()) throw new RuntimeException("Phone number is required");
        if (addressLine == null || addressLine.isBlank()) throw new RuntimeException("Street address is required");
        if (city == null || city.isBlank()) throw new RuntimeException("City is required");
    }

    private PaymentMethod parsePaymentMethod(String value) {
        if (value == null) return PaymentMethod.CARD;
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethod.CARD;
        }
    }

    private String generateGuestToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // ─────────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdWithItems(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return toDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllWithItems()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByPaymentMethod(PaymentMethod paymentMethod) {
        return orderRepository.findByPaymentMethodWithItems(paymentMethod)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Admin status flow. PENDING = unpaid card checkout, so it can only be cancelled. */
    private static final java.util.Map<OrderStatus, java.util.Set<OrderStatus>> ALLOWED_TRANSITIONS = java.util.Map.of(
            OrderStatus.PENDING, java.util.EnumSet.of(OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, java.util.EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PAID, java.util.EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, java.util.EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, java.util.EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, java.util.EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, java.util.EnumSet.noneOf(OrderStatus.class)
    );

    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() == status) {
            return toDTO(order);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), java.util.Set.of()).contains(status)) {
            throw new RuntimeException("Cannot change order status from " + order.getStatus() + " to " + status);
        }
        if (status == OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(status);
        return toDTO(orderRepository.save(order));
    }

    /**
     * Admin marks COD money as collected (after delivery)
     */
    public OrderDTO markCODCollected(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getPaymentMethod() != PaymentMethod.COD)
            throw new RuntimeException("Not a COD order");
        if (order.getStatus() != OrderStatus.SHIPPED && order.getStatus() != OrderStatus.DELIVERED)
            throw new RuntimeException("Cash can only be collected when the order is shipped or delivered");

        // Cash is collected at the door, so the order is delivered; the status must not go back to PAID
        order.setCodCollected(true);
        order.setStatus(OrderStatus.DELIVERED);
        return toDTO(orderRepository.save(order));
    }

    public OrderDTO cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");

        // Customers may cancel until the shop starts packing: an unfinished checkout,
        // or a confirmed cash-on-delivery order. Paid card orders need a refund, so the shop handles those.
        boolean cancellable = order.getStatus() == OrderStatus.PENDING
                || (order.getStatus() == OrderStatus.CONFIRMED && order.getPaymentMethod() == PaymentMethod.COD);
        if (!cancellable)
            throw new RuntimeException("This order can no longer be cancelled. Please contact us for help.");

        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        return toDTO(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderDTO getAdminOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }

    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingFee(order.getShippingFee());
        dto.setStripeClientSecret(order.getStripeClientSecret());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCodCollected(order.getCodCollected());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setGuestOrder(order.getUser() == null);
        dto.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : order.getGuestEmail());

        if (order.getShippingAddress() != null) {
            ShippingAddressDTO addressDTO = new ShippingAddressDTO();
            addressDTO.setFullName(order.getShippingAddress().getFullName());
            addressDTO.setPhone(order.getShippingAddress().getPhone());
            addressDTO.setAddressLine(order.getShippingAddress().getAddressLine());
            addressDTO.setCity(order.getShippingAddress().getCity());
            addressDTO.setDistrict(order.getShippingAddress().getDistrict());
            addressDTO.setPostalCode(order.getShippingAddress().getPostalCode());
            dto.setShippingAddress(addressDTO);
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPriceAtPurchase(item.getPriceAtPurchase());
                itemDTO.setSize(item.getSize());
                itemDTO.setColor(item.getColor());

                if (item.getProduct() != null) {
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setProductImage(com.ecommerce.util.ImageUrls.product(
                            item.getProduct().getId(), item.getProduct().getImageData()));
                }
                return itemDTO;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
