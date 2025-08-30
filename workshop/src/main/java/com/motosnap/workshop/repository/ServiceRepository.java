package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    // Find active services
    List<Service> findByActiveTrue();
    List<Service> findByActiveTrueOrderByNameAsc();
    
    // Find by name
    Optional<Service> findByName(String name);
    boolean existsByName(String name);
    
    // Find by category
    List<Service> findByCategoryIgnoreCaseAndActiveTrue(String category);
    
    // Search services
    @Query("SELECT s FROM Service s WHERE s.active = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.category) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Service> searchActiveServices(@Param("search") String search);
    
    // Get distinct categories
    @Query("SELECT DISTINCT s.category FROM Service s WHERE s.active = true ORDER BY s.category")
    List<String> findDistinctCategories();
    
    // Popular services (most booked)
    @Query("SELECT s FROM Service s WHERE s.active = true ORDER BY SIZE(s.bookings) DESC")
    List<Service> findPopularServices();
    
    // Services by duration range
    @Query("SELECT s FROM Service s WHERE s.active = true AND s.estimatedDurationMinutes BETWEEN :minDuration AND :maxDuration")
    List<Service> findServicesByDurationRange(@Param("minDuration") Integer minDuration, @Param("maxDuration") Integer maxDuration);
}