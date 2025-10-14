package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.model.SubCategory;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          SubCategoryRepository subCategoryRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.productMapper = productMapper;
    }

    public ProductDTO createProduct(Product product, Long subCategoryId, MultipartFile imageFile) throws IOException {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));

        product.setSubCategory(subCategory);
        product.setCreatedAt(Instant.now());

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
        }

        Product saved = productRepository.save(product);
        return productMapper.convertToDTO(saved);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long productId) {
        Optional<Product> productOptional = productRepository.findById(productId);
        return productOptional.map(productMapper::convertToDTO).orElse(null);
    }

    public List<ProductDTO> getProductsBySubCategory(Long subCategoryId) {
        return productRepository.findBySubCategoryId(subCategoryId)
                .stream()
                .map(productMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getRecentProducts(int limit) {
        return productRepository.findTop8ByOrderByCreatedAtDesc()
                .stream()
                .map(productMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO updateProduct(Long id, Product updated, MultipartFile imageFile) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setActive(updated.isActive());

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
        }

        Product saved = productRepository.save(product);
        return productMapper.convertToDTO(saved);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
