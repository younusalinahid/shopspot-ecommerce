package com.ecommerce.service;

import com.ecommerce.dto.WishlistDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.model.Wishlist;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<WishlistDTO> getWishlist(Long userId) {
        return wishlistRepository.findByUserIdWithProduct(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Map<String, Object> toggleWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return Map.of("wishlisted", false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
        return Map.of("wishlisted", true);
    }

    public boolean isWishlisted(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistDTO toDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setProductId(wishlist.getProduct().getId());
        dto.setProductName(wishlist.getProduct().getName());
        dto.setProductPrice(wishlist.getProduct().getPrice());
        dto.setCreatedAt(wishlist.getCreatedAt());
        if (wishlist.getProduct().getImageData() != null) {
            dto.setProductImage(Base64.getEncoder()
                    .encodeToString(wishlist.getProduct().getImageData()));
        }
        return dto;
    }
}