package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String message;
    /** Products the assistant linked in its answer, shown as cards under the message. */
    private List<ProductDTO> products;
}
