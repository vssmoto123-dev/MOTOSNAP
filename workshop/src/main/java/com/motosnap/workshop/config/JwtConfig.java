package com.motosnap.workshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;

@Component
public class JwtConfig {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration.access:900000}") // 15 minutes default
    private long accessTokenExpiration;
    
    @Value("${jwt.expiration.refresh:604800000}") // 7 days default
    private long refreshTokenExpiration;
    
    @PostConstruct
    public void validateConfiguration() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret cannot be null or empty");
        }
        
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes (256 bits) for HS256");
        }
        
        if ("fallback-secret-for-dev-only-must-be-at-least-32-chars".equals(secret)) {
            System.out.println("WARNING: Using default JWT secret. Set JWT_SECRET environment variable for production!");
        }
    }
    
    public String getSecret() {
        return secret;
    }
    
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
    
    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }
}