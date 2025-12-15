package com.edtech.web.controller;

import com.edtech.web.security.JwtTokenProvider;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtTokenProvider tokenProvider;

    public AuthController(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        // Mock Authentication for Demo
        // In production, this would use AuthenticationManager and load from DB
        if ("admin".equals(request.getUsername())) {
            String token = tokenProvider.generateToken(1L, "admin", "ADMIN", 1L);
            return Map.of("token", token, "role", "ADMIN", "username", "admin");
        } else if ("student".equals(request.getUsername())) {
            String token = tokenProvider.generateToken(2L, "student", "STUDENT", 1L);
            return Map.of("token", token, "role", "STUDENT", "username", "student");
        }
        throw new RuntimeException("Invalid credentials");
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterRequest request) {
        // Mock Registration
        return Map.of("message", "User registered successfully");
    }

    public static class LoginRequest {
        public String username;
        public String password;
        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }

    public static class RegisterRequest {
        public String username;
        public String password;
        public String email;
        public String role; // STUDENT, TEACHER
        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }
}
