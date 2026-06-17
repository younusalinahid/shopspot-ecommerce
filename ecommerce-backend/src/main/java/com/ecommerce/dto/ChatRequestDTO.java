package com.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequestDTO {
    private List<MessageDTO> messages;

    @Data
    public static class MessageDTO {
        private String role;
        private String content;
    }
}