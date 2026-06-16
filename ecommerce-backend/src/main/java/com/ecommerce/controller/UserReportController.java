package com.ecommerce.controller;

import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/report")
@RequiredArgsConstructor
public class UserReportController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<Void> sendReport(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String email = body.get("email");
        String name = body.get("name");

        if (message == null || message.isBlank() || email == null || name == null) {
            return ResponseEntity.badRequest().build();
        }

        emailService.sendAccountReportEmail(email, name, message);

        return ResponseEntity.ok().build();
    }
}