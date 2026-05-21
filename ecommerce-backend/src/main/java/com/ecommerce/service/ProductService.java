package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductWithCategoryDTO;
import com.ecommerce.dto.SearchResultDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.model.SubCategory;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          SubCategoryRepository subCategoryRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.productMapper = productMapper;
    }

    public ProductDTO createProduct(Product product, Long subCategoryId, MultipartFile imageFile)
            throws IOException {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));
        product.setSubCategory(subCategory);

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
        }
        return productMapper.convertToDTO(productRepository.save(product));
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SearchResultDTO> universalSearch(String query) {
        List<SearchResultDTO> results = new ArrayList<>();

        List<Product> products = productRepository.searchByNameOrSubCategory(query);
        for (Product product : products) {
            String imageData = null;
            if (product.getImageData() != null) {
                imageData = Base64.getEncoder().encodeToString(product.getImageData());
            }
            results.add(new SearchResultDTO(
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    product.getDescription(),
                    imageData
            ));
        }

        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(query);
        for (Category category : categories) {
            results.add(new SearchResultDTO(
                    category.getId(),
                    category.getName(),
                    category.getIcon()
            ));
        }

        List<SubCategory> subCategories = subCategoryRepository.findByNameContainingIgnoreCase(query);
        for (SubCategory subCategory : subCategories) {
            results.add(new SearchResultDTO(
                    subCategory.getId(),
                    subCategory.getName(),
                    subCategory.getCategory().getId()
            ));
        }
        return results;
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

    public List<ProductWithCategoryDTO> getAllProductsWithCategory() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(p -> {
            String subCategoryName = p.getSubCategory() != null ? p.getSubCategory().getName() : null;
            String categoryName = p.getSubCategory() != null && p.getSubCategory().getCategory() != null
                    ? p.getSubCategory().getCategory().getName()
                    : null;

            return new ProductWithCategoryDTO(
                    p.getId(),
                    p.getName(),
                    p.getDescription(),
                    p.getDiscountPercent() > 0
                            ? p.getPrice() - (p.getPrice() * p.getDiscountPercent() / 100)
                            : p.getPrice(),
                    p.isActive(),
                    p.getCreatedAt(),
                    p.getImageData(),
                    subCategoryName,
                    categoryName,
                    p.getStockQuantity(),
                    p.getDiscountPercent(),
                    p.getPrice(),
                    p.getSubCategory() != null && p.getSubCategory().getCategory() != null
                            ? p.getSubCategory().getCategory().getId() : null,
                    p.getSubCategory() != null ? p.getSubCategory().getId() : null
            );
        }).collect(Collectors.toList());
    }


    public ProductDTO updateProduct(Long id, Product updated, Long subCategoryId, MultipartFile imageFile) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setActive(updated.isActive());
        product.setStockQuantity(updated.getStockQuantity());
        product.setDiscountPercent(updated.getDiscountPercent());

        if (subCategoryId != null) {
            SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new RuntimeException("SubCategory not found"));
            product.setSubCategory(subCategory);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
        }

        return productMapper.convertToDTO(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
