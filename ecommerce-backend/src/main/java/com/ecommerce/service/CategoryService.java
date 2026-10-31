package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.CategoryWithProductsDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
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

    public static String imageUrlOf(Category category) {
        if (category.getImageData() == null || category.getImageData().length == 0) return null;
        long v = category.getImageVersion() != null ? category.getImageVersion() : 0L;
        return "/api/public/categories/" + category.getId() + "/image?v=" + v;
    }

    public Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public CategoryDTO updateCategoryImage(Long id, org.springframework.web.multipart.MultipartFile file)
            throws java.io.IOException {
        Category category = getCategoryEntity(id);
        byte[] bytes = com.ecommerce.util.ImageValidator.readImage(file, 3L * 1024 * 1024);
        category.setImageData(bytes);
        category.setImageType(com.ecommerce.util.ImageValidator.contentType(bytes));
        category.setImageVersion(System.currentTimeMillis());
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    public CategoryDTO removeCategoryImage(Long id) {
        Category category = getCategoryEntity(id);
        category.setImageData(null);
        category.setImageType(null);
        category.setImageVersion(System.currentTimeMillis());
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            throw new RuntimeException("Delete or move its " + category.getSubCategories().size()
                    + " subcategories first");
        }
        categoryRepository.delete(category);
    }

    private CategoryDTO convertToCategoryDTO(Category category) {
        List<SubCategoryDTO> subDtos = category.getSubCategories()
                .stream()
                .map(sub -> new SubCategoryDTO(sub.getId(), sub.getName()))
                .collect(Collectors.toList());
        CategoryDTO dto = new CategoryDTO(category.getId(), category.getName(), category.getIcon(), subDtos);
        dto.setImageUrl(imageUrlOf(category));
        return dto;
    }

    public List<CategoryWithProductsDTO> getCategoriesWithProducts(int productsPerCategory) {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(category -> {
                    List<ProductDTO> products = category.getSubCategories().stream()
                            .flatMap(subCategory -> subCategory.getProducts().stream())
                            .filter(product -> product.isActive())
                            .limit(productsPerCategory)
                            .map(productMapper::convertToDTO)
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
                .map(productMapper::convertToDTO)
                .collect(Collectors.toList());
    }
}