package com.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String icon;

    /** Picture shown on the home-page category slider (served by /api/public/categories/{id}/image). */
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private byte[] imageData;

    @JsonIgnore
    private String imageType;

    /** Bumped on every upload so browsers fetch the new picture instead of a cached one. */
    @JsonIgnore
    private Long imageVersion;

    @OneToMany(mappedBy = "category")
    @JsonManagedReference
    private List<SubCategory> subCategories;
}
