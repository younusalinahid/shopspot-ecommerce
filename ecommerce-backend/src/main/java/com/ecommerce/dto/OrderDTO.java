package com.ecommerce.dto;

import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private OrderStatus status;
    private Integer totalAmount;
    private String stripeClientSecret;
    private ShippingAddressDTO shippingAddress;
    private List<OrderItemDTO> items;
    private Instant createdAt;
    private PaymentMethod paymentMethod;
    private Boolean codCollected;
}