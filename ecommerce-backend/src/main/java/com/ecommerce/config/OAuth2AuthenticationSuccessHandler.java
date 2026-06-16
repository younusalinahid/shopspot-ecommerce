package com.ecommerce.config;

import com.ecommerce.model.User;
import com.ecommerce.model.type.Role;
import com.ecommerce.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public OAuth2AuthenticationSuccessHandler(
            @Lazy JwtService jwtService,
            UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name  = (String) attributes.get("name");

        if (email == null || email.isBlank()) {
            String fbId = String.valueOf(attributes.get("id"));
            email = fbId + "@facebook-user.com";
        }

        if (name == null || name.isBlank()) {
            name = email;
        }

        final String finalEmail = email;
        final String finalName  = name;

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .fullName(finalName)
                    .password("")
                    .role(Role.USER)
                    .active(true)
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user);

        if (!user.isActive()) {
            response.sendRedirect("http://localhost:3000/oauth2/callback?token=" + token + "&isRestricted=true");
        } else {
            response.sendRedirect("http://localhost:3000/oauth2/callback?token=" + token);
        }
    }
}