package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.CategoryWithProductsDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public CategoryService(CategoryRepository categoryRepository,  ProductMapper productMapper) {
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
    }

    public List<CategoryDTO> getAllCategoriesWithSubDTO() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToCategoryDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryWithSubDTOById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToCategoryDTO(category);
    }

    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(updatedCategory.getName());
        category.setIcon(updatedCategory.getIcon());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToCategoryDTO(Category category) {
        List<SubCategoryDTO> subDtos = category.getSubCategories()
                .stream()
                .map(sub -> new SubCategoryDTO(sub.getId(), sub.getName()))
                .collect(Collectors.toList());
        return new CategoryDTO(category.getId(), category.getName(), category.getIcon(), subDtos);
    }

    public List<CategoryWithProductsDTO> getCategoriesWithProducts(int productsPerCategory) {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(category -> {
                    List<ProductDTO> products = category.getSubCategories().stream()
                            .flatMap(subCategory -> subCategory.getProducts().stream())
                            .filter(product -> product.isActive())
                            .limit(productsPerCategory)
                            .map(productMapper::toDTO)
                            .collect(Collectors.toList());

                    if (!products.isEmpty()) {
                        return new CategoryWithProductsDTO(
                                category.getId(),
                                category.getName(),
                                category.getIcon(),
                                products
                        );
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        return category.getSubCategories().stream()
                .flatMap(subCategory -> subCategory.getProducts().stream())
                .filter(Product::isActive)
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }
}