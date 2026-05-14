package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.model.*;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.ShippingAddress;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
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
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final AddressService addressService;
    private final AddressRepository addressRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

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
            Address saved = addressRepository.findByIdAndUserId(
                            request.getAddressId(), userId)
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
            shippingAddress = ShippingAddress.builder()
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .addressLine(request.getAddressLine())
                    .city(request.getCity())
                    .district(request.getDistrict())
                    .postalCode(request.getPostalCode())
                    .build();

            if (Boolean.TRUE.equals(request.getSaveAddress())) {
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

        Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.PENDING)
                .totalAmount(cart.getTotalPrice())
                .build();

        List<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .priceAtPurchase(cartItem.getProduct().getPrice())
                        .size(cartItem.getSize())
                        .color(cartItem.getColor())
                        .build())
                .collect(Collectors.toList());

        order.setItems(orderItems);

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) cart.getTotalPrice() * 100)
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

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    public OrderDTO confirmPayment(Long userId, PaymentConfirmDTO request) {
        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        try {
            PaymentIntent intent = PaymentIntent.retrieve(request.getPaymentIntentId());

            if ("succeeded".equals(intent.getStatus())) {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
                cartService.clearCart(userId);
            } else {
                throw new RuntimeException("Payment not successful");
            }
        } catch (Exception e) {
            log.error("Payment confirm error", e);
            throw new RuntimeException("Payment confirmation failed");
        }

        return toDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdWithItems(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return toDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllWithItems()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return toDTO(orderRepository.save(order));
    }

    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStripeClientSecret(order.getStripeClientSecret());
        dto.setCreatedAt(order.getCreatedAt());

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
                    if (item.getProduct().getImageData() != null) {
                        itemDTO.setProductImage(
                                Base64.getEncoder().encodeToString(item.getProduct().getImageData())
                        );
                    }
                }
                return itemDTO;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}