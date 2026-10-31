package com.ecommerce.dto;

import com.ecommerce.model.InfoPage;
import com.ecommerce.model.SiteSettings;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteContentDTO {
    private SiteSettings settings;
    private List<InfoPage> pages;
}
