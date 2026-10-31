package com.ecommerce.config;

import com.ecommerce.model.Category;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.util.ImageValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Locale;

/**
 * Gives each category a default picture (from resources/category-images/<name-slug>.jpg)
 * the first time the app starts. Only categories whose image was never touched are filled,
 * so an image the admin removed or replaced is never brought back.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryImageSeeder {

    private final CategoryRepository categoryRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedCategoryImages() {
        int added = 0;
        for (Category category : categoryRepository.findAll()) {
            if (category.getImageVersion() != null || category.getName() == null) continue;
            ClassPathResource resource = new ClassPathResource("category-images/" + slug(category.getName()) + ".jpg");
            if (!resource.exists()) continue;
            try (InputStream in = resource.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                if (!ImageValidator.isImage(bytes)) continue;
                category.setImageData(bytes);
                category.setImageType(ImageValidator.contentType(bytes));
                category.setImageVersion(System.currentTimeMillis());
                categoryRepository.save(category);
                added++;
            } catch (Exception e) {
                log.warn("Could not set default image for category {}: {}", category.getName(), e.getMessage());
            }
        }
        if (added > 0) log.info("Added default images to {} categories", added);
    }

    /** "Men's wear" -> "mens-wear", "Festival & Wedding" -> "festival-wedding". */
    static String slug(String name) {
        return name.toLowerCase(Locale.ROOT)
                .replace("'", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
