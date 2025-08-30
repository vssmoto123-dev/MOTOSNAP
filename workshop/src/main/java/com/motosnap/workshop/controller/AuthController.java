package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.AuthResponse;
import com.motosnap.workshop.dto.LoginRequest;
import com.motosnap.workshop.dto.RegisterRequest;
import com.motosnap.workshop.entity.Role;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.repository.UserRepository;
import com.motosnap.workshop.service.JwtService;
import com.motosnap.workshop.service.PasswordValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidationService passwordValidationService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository, 
                         PasswordEncoder passwordEncoder,
                         PasswordValidationService passwordValidationService,
                         JwtService jwtService,
                         AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordValidationService = passwordValidationService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Email is required\"}");
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Password is required\"}");
            }
            
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Name is required\"}");
            }
            
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("{\"error\":\"Email already registered\"}");
            }

            // Validate password strength
            passwordValidationService.validatePassword(request.getPassword());

            // Set default role if not provided
            Role userRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

            // Create new user
            User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getName().trim(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                userRole
            );

            User savedUser = userRepository.save(user);

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(savedUser);
            String refreshToken = jwtService.generateRefreshToken(savedUser);

            // Create response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name()
            );

            AuthResponse response = new AuthResponse(
                accessToken,
                refreshToken,
                900000L, // 15 minutes
                userInfo
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"Registration failed\"}");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Email is required\"}");
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Password is required\"}");
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail().toLowerCase().trim(),
                    request.getPassword()
                )
            );

            // Get user details
            User user = userRepository.findByEmailAndActive(
                request.getEmail().toLowerCase().trim(), true
            ).orElseThrow(() -> new RuntimeException("User not found"));

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Create response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name()
            );

            AuthResponse response = new AuthResponse(
                accessToken,
                refreshToken,
                900000L, // 15 minutes
                userInfo
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Invalid email or password\"}");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("{\"error\":\"Invalid token format\"}");
            }

            String refreshToken = authHeader.substring(7);

            // Validate it's a refresh token
            if (!jwtService.isRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest().body("{\"error\":\"Invalid token type\"}");
            }

            // Extract username and validate token
            String email = jwtService.extractUsername(refreshToken);
            if (jwtService.isTokenExpired(refreshToken)) {
                return ResponseEntity.badRequest().body("{\"error\":\"Refresh token expired\"}");
            }

            // Get user
            User user = userRepository.findByEmailAndActive(email, true)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(user);

            // Create response with new access token and same refresh token
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name()
            );

            AuthResponse response = new AuthResponse(
                newAccessToken,
                refreshToken, // Keep the same refresh token
                900000L, // 15 minutes
                userInfo
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Invalid or expired refresh token\"}");
        }
    }
}