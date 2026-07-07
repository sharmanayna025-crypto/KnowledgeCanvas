package com.knowledgecanvas.backend.service;

import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.repository.UserRepository;
import com.knowledgecanvas.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public User register(User user) {

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }


    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );


        if(passwordEncoder.matches(password, user.getPassword())) {

            return jwtService.generateToken(email);

        }

        throw new RuntimeException("Invalid password");
    }
}