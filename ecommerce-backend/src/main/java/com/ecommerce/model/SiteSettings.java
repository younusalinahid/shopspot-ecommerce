package com.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
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

    /** Logo shown in the navbar; served by /api/public/site-content/logo. */
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private byte[] logoData;

    @JsonIgnore
    private String logoType;

    @JsonIgnore
    private Long logoVersion;

    /** Relative logo URL (with a version for cache busting), or null when no logo was uploaded. */
    @Transient
    @JsonProperty(value = "logoUrl", access = JsonProperty.Access.READ_ONLY)
    public String getLogoUrl() {
        if (logoData == null || logoData.length == 0) return null;
        return "/api/public/site-content/logo?v=" + (logoVersion != null ? logoVersion : 0L);
    }
}
