package com.ecommerce.model;

import com.ecommerce.model.type.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imageData;
    private String title;
    private boolean active;
    private int orderIndex;
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    private Role role;
}
