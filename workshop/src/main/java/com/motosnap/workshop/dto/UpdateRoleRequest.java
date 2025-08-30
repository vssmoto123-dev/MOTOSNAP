package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {
    
    @NotNull(message = "New role is required")
    private Role newRole;
}