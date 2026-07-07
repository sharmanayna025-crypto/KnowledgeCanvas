package com.knowledgecanvas.backend.service;

import com.knowledgecanvas.backend.dto.UserResponse;
import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.repository.UserRepository;
import com.knowledgecanvas.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public User register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        System.out.println("===== REGISTER DEBUG =====");
        System.out.println("Raw password: " + user.getPassword());

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        System.out.println("Encoded password: " + user.getPassword());

        return userRepository.save(user);
    }

    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("========== LOGIN DEBUG ==========");
        System.out.println("Email entered: " + email);
        System.out.println("Raw password entered: [" + password + "]");
        System.out.println("Stored email: " + user.getEmail());
        System.out.println("Stored hash: " + user.getPassword());

        boolean matches = passwordEncoder.matches(
                password,
                user.getPassword()
        );

        System.out.println("Password matches: " + matches);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        password
                )
        );

        System.out.println("Authentication successful!");

        return jwtService.generateToken(email);
    }

    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}