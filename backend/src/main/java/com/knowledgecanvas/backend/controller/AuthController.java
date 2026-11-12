package com.knowledgecanvas.backend.controller;

import com.knowledgecanvas.backend.dto.AuthResponse;
import com.knowledgecanvas.backend.dto.LoginRequest;
import com.knowledgecanvas.backend.dto.RegisterRequest;
import com.knowledgecanvas.backend.dto.UserResponse;
import com.knowledgecanvas.backend.security.CustomUserDetails;
import com.knowledgecanvas.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
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
