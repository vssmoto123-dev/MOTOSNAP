package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String phone;
    private Role role;
}