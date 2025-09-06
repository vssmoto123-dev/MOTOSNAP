package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Role;
import com.motosnap.workshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Authentication queries
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndActive(String email, Boolean active);
    
    // Role-based queries
    List<User> findByRole(Role role);
    List<User> findByRoleAndActive(Role role, Boolean active);
    
    // Admin user management
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = true ORDER BY u.createdAt DESC")
    List<User> findActiveUsersByRole(@Param("role") Role role);
    
    // Check if email exists (for registration)
    boolean existsByEmail(String email);
    
    // Find mechanics for assignment
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = true ORDER BY u.name")
    List<User> findAvailableMechanics(@Param("role") Role role);
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND u.active = true")
    List<User> searchActiveUsers(@Param("search") String search);
    
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
    
    long countByRole(Role role);
}