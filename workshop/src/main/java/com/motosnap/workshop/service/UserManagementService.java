package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.UpdateRoleRequest;
import com.motosnap.workshop.dto.UserResponse;
import com.motosnap.workshop.entity.Role;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserManagementService {
    
    private final UserRepository userRepository;
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToUserResponse)
            .collect(Collectors.toList());
    }
    
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
            .map(this::convertToUserResponse);
    }
    
    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id)
            .map(this::convertToUserResponse);
    }
    
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
            .map(this::convertToUserResponse)
            .collect(Collectors.toList());
    }
    
    public List<UserResponse> searchUsers(String searchTerm) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(searchTerm, searchTerm)
            .stream()
            .map(this::convertToUserResponse)
            .collect(Collectors.toList());
    }
    
    public UserResponse updateUserRole(Long id, UpdateRoleRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setRole(request.getNewRole());
        User updatedUser = userRepository.save(user);
        
        return convertToUserResponse(updatedUser);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Prevent deletion of the last admin user
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }
        
        userRepository.deleteById(id);
    }
    
    public long getUserCount() {
        return userRepository.count();
    }
    
    public long getUserCountByRole(Role role) {
        return userRepository.countByRole(role);
    }
    
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhone(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}