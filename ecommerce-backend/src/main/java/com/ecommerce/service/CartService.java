package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

import static com.ecommerce.mapper.CartMapper.convertToDTO;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartDTO getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        return convertToDTO(cart);
    }

    public CartDTO addToCart(Long userId, AddToCartRequestDTO request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new RuntimeException("Product is not available");
        }

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(product.getPrice());
            cart.getItems().add(cartItem);
        }

        cart.setUpdatedAt(Instant.now());

        // Save
        cartItemRepository.save(cartItem);
        Cart savedCart = cartRepository.save(cart);

        return convertToDTO(savedCart);
    }

    // Update cart item quantity
    public CartDTO updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequestDTO request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this user");
        }

        if (request.getQuantity() <= 0) {
            // Remove item if quantity is 0 or negative
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            // Update quantity
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }

        // Update cart timestamp
        cart.setUpdatedAt(Instant.now());
        Cart savedCart = cartRepository.save(cart);

        return convertToDTO(savedCart);
    }

    // Remove item from cart
    public void removeCartItem(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this user");
        }

        // Remove item
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        // Update cart timestamp
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
    }

    // Clear entire cart
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        // Delete all cart items
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        // Update cart timestamp
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
    }
}