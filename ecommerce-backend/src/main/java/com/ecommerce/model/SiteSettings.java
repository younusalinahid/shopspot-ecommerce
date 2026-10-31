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

    // ---- Delivery charge (Admin -> Delivery; used by checkout, cart and the order total) ----
    /** Delivery charge outside Dhaka in Taka. null = default (120). */
    private Integer deliveryFee;
    /** Delivery charge inside Dhaka in Taka. null = default (60). */
    private Integer deliveryFeeDhaka;
    /** Delivery is free when the subtotal is above this. null = default (2000); 0 = never free. */
    private Integer freeDeliveryMin;

    public int effectiveDeliveryFee() {
        return deliveryFee != null ? deliveryFee : 120;
    }

    public int effectiveDeliveryFeeDhaka() {
        return deliveryFeeDhaka != null ? deliveryFeeDhaka : 60;
    }

    public int effectiveFreeDeliveryMin() {
        return freeDeliveryMin != null ? freeDeliveryMin : 2000;
    }

    /** Delivery charge for an order with this subtotal, inside or outside Dhaka. */
    public int deliveryChargeFor(int subtotal, boolean insideDhaka) {
        int min = effectiveFreeDeliveryMin();
        if (min > 0 && subtotal > min) return 0;
        return insideDhaka ? effectiveDeliveryFeeDhaka() : effectiveDeliveryFee();
    }

    /** True when the city or district of the address is Dhaka (English or Bangla). */
    public static boolean isDhaka(String city, String district) {
        for (String v : new String[]{city, district}) {
            if (v == null) continue;
            String t = v.trim().toLowerCase(java.util.Locale.ROOT);
            if (t.contains("dhaka") || t.contains("\u09A2\u09BE\u0995\u09BE")) return true;
        }
        return false;
    }

    // ---- Header look and the announcement bar above it ----
    /** Store name colour in the header (light mode), e.g. #064e3b. */
    @Column(length = 7) private String brandColor;
    /** Background of the box behind the logo, e.g. #064e3b. */
    @Column(length = 7) private String logoBgColor;
    /** Background of the announcement bar. */
    @Column(length = 7) private String topBarColor;
    private Boolean showTopBar;
    @Column(length = 200) private String announcementText;
    @Column(length = 40) private String announcementLinkText;
    @Column(length = 500) private String announcementLinkUrl;

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
