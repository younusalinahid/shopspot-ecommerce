package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Store-wide content shown in the footer and contact areas. Always a single row with id = 1. */
@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
public class SiteSettings {

    @Id
    private Long id = 1L;

    private String storeName;
    @Column(length = 500)
    private String tagline;
    private String contactAddress;
    private String contactEmail;
    private String contactPhone;

    @Column(length = 500) private String facebookUrl;
    @Column(length = 500) private String instagramUrl;
    @Column(length = 500) private String twitterUrl;
    @Column(length = 500) private String whatsappUrl;
    @Column(length = 500) private String telegramUrl;
    @Column(length = 500) private String youtubeUrl;
    @Column(length = 500) private String tiktokUrl;

    private String copyrightText;
}
