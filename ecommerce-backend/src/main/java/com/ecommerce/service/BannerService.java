package com.ecommerce.service;

import com.ecommerce.model.Banner;
import com.ecommerce.repository.BannerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findAllByActiveTrueOrderByOrderIndexAsc();
    }

    public List<Banner> getAll() {
        return bannerRepository.findAll();
    }

    public Banner updateBanner(Long id, Banner updatedBanner) {
        Banner existingBanner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));

        existingBanner.setImageData(updatedBanner.getImageData());
        existingBanner.setTitle(updatedBanner.getTitle());
        existingBanner.setActive(updatedBanner.isActive());
        existingBanner.setOrderIndex(updatedBanner.getOrderIndex());
        existingBanner.setLinkUrl(updatedBanner.getLinkUrl());
        existingBanner.setRole(updatedBanner.getRole());

        return bannerRepository.save(existingBanner);
    }

    public Banner saveBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
