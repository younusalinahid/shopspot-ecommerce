package com.ecommerce.service;

import com.ecommerce.dto.AddToCartRequestDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.model.*;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional(readOnly = true)
    public CartDTO getCart(Long userId) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> createNewCart(userId));

        return cartMapper.toDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(Long userId, AddToCartRequestDTO request) {
        try {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

            if (!product.isActive()) {
                throw new RuntimeException("Product is not available");
            }

            Cart cart = cartRepository.findByUserId(userId)
                    .orElseGet(() -> createNewCart(userId));

            Optional<CartItem> existingItem = cartItemRepository
                    .findByCartIdAndProductId(cart.getId(), request.getProductId());

            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                item.setQuantity(item.getQuantity() + request.getQuantity());
                cartItemRepository.save(item);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(request.getQuantity())
                        .size(request.getSize())
                        .color(request.getColor())
                        .build();
                cartItemRepository.save(newItem);
            }

            Cart updatedCart = refreshCartWithItems(cart.getId());
            updateCartTotals(updatedCart);
            Cart savedCart = cartRepository.save(updatedCart);
            return cartMapper.toDTO(savedCart);

        } catch (Exception e) {
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage());
        }
    }

    @Transactional
    public Cart refreshCartWithItems(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCartIdWithProduct(cartId);
        cart.getCartItems().clear();
        cart.getCartItems().addAll(items);

        return cart;
    }

    @Transactional
    public void updateCartTotals(Cart cart) {
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            cart.setTotalPrice(0);
            cart.setTotalItems(0);
            return;
        }

        int totalPrice = 0;
        int totalItems = 0;

        for (CartItem item : cart.getCartItems()) {
            if (item.getProduct() != null) {
                totalPrice += item.getProduct().getPrice() * item.getQuantity();
                totalItems += item.getQuantity();
            }
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalItems(totalItems);
    }

    @Transactional
    public Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Cart cart = Cart.builder()
                .user(user)
                .totalPrice(0)
                .totalItems(0)
                .build();

        cart.setCartItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    @Transactional
    public CartDTO updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        Cart cart = refreshCartWithItems(cartItem.getCart().getId());
        updateCartTotals(cart);
        Cart savedCart = cartRepository.save(cart);

        return cartMapper.toDTO(savedCart);
    }

    @Transactional
    public void removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        Long cartId = cartItem.getCart().getId();
        cartItemRepository.delete(cartItem);

        Cart cart = refreshCartWithItems(cartId);
        updateCartTotals(cart);
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        cartItemRepository.deleteAllByCartId(cart.getId());
        cart.setTotalPrice(0);
        cart.setTotalItems(0);
        cartRepository.save(cart);
    }
}