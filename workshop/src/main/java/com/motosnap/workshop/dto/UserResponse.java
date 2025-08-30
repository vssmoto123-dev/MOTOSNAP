package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String email;
    private String name;
    private String phone;
    private Role role;
    private LocalDateTime createdAt;
    private boolean active;
    
    // Constructor for easy conversion from User entity
    public UserResponse(Long id, String email, String name, String phone, Role role, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
        this.active = true; // Default to active
    }
}