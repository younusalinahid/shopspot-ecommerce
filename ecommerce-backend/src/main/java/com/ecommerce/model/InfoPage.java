package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** An information page linked from the footer (Privacy Policy, Shipping, Returns, ...). */
@Entity
@Table(name = "info_pages")
@Data
@NoArgsConstructor
public class InfoPage {

    @Id
    @Column(length = 60)
    private String slug;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    /** Footer column the link appears in: SHOPPING or SERVICES. */
    @Column(length = 20)
    private String section;

    private Integer sortOrder;

    private boolean visible = true;

    private LocalDateTime updatedAt;
}
