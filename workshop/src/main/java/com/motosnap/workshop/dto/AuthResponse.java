package com.motosnap.workshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserInfo user;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String name;
        private String role;
    }
    
    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }
}