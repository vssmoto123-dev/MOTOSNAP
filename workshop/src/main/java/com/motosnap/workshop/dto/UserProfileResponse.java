package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.Role;
import com.motosnap.workshop.entity.Vehicle;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private Role role;
    private LocalDateTime createdAt;
    private List<Vehicle> vehicles;
}