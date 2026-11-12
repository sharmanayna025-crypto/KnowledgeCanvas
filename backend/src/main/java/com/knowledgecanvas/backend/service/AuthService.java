package com.knowledgecanvas.backend.service;

import com.knowledgecanvas.backend.dto.AuthResponse;
import com.knowledgecanvas.backend.dto.RegisterRequest;
import com.knowledgecanvas.backend.dto.UserResponse;
import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.exception.EmailAlreadyExistsException;
import com.knowledgecanvas.backend.repository.UserRepository;
import com.knowledgecanvas.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    public UserResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new EmailAlreadyExistsException(
                    "An account with this email already exists"
            );
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Never return the entity: it carries the password hash.
        return toResponse(userRepository.save(user));
    }

    public AuthResponse login(String email, String password) {

        String typedEmail = email.trim();

        // Throws BadCredentialsException for an unknown email or wrong
        // password; GlobalExceptionHandler turns that into a 401.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(typedEmail, password)
        );

        User user = userRepository.findByEmailIgnoreCase(typedEmail)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        return new AuthResponse(
                jwtService.generateToken(user.getEmail()),
                toResponse(user)
        );
    }

    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        return toResponse(user);
    }
}
