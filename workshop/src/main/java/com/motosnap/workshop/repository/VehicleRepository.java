package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    // Find vehicles by user (customer's vehicles)
    List<Vehicle> findByUser(User user);
    List<Vehicle> findByUserOrderByCreatedAtDesc(User user);
    
    // Find by plate number
    Optional<Vehicle> findByPlateNo(String plateNo);
    boolean existsByPlateNo(String plateNo);
    
    // Search vehicles
    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.plateNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Vehicle> searchVehicles(@Param("search") String search);
    
    // Find vehicles by brand or model
    List<Vehicle> findByBrandIgnoreCase(String brand);
    List<Vehicle> findByModelIgnoreCase(String model);
    
    // Find vehicles by year range
    List<Vehicle> findByYearBetween(Integer startYear, Integer endYear);
    
    // Get vehicle statistics
    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.user.id = :userId")
    long countVehiclesByUserId(@Param("userId") Long userId);
}