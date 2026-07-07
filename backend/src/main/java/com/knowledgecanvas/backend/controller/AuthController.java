package com.knowledgecanvas.backend.controller;

import com.knowledgecanvas.backend.dto.LoginRequest;
import com.knowledgecanvas.backend.dto.RegisterRequest;
import com.knowledgecanvas.backend.dto.UserResponse;
import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.security.CustomUserDetails;
import com.knowledgecanvas.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody RegisterRequest request
    ) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(
                        request.getEmail(),
                        request.getPassword()
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                authService.getCurrentUser(
                        userDetails.getUsername()
                )
        );
    }
}