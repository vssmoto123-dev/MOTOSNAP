package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.PricingRule;
import com.motosnap.workshop.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    
    // Find pricing rules by service
    List<PricingRule> findByService(Service service);
    List<PricingRule> findByServiceOrderByVehicleCategoryAsc(Service service);
    
    // Find pricing rule by service and vehicle category
    Optional<PricingRule> findByServiceAndVehicleCategory(Service service, String vehicleCategory);
    
    // Find pricing rules by vehicle category
    List<PricingRule> findByVehicleCategoryIgnoreCase(String vehicleCategory);
    
    // Get all distinct vehicle categories
    @Query("SELECT DISTINCT pr.vehicleCategory FROM PricingRule pr ORDER BY pr.vehicleCategory")
    List<String> findDistinctVehicleCategories();
    
    // Find pricing rules within price range
    List<PricingRule> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Check if pricing rule exists
    boolean existsByServiceAndVehicleCategory(Service service, String vehicleCategory);
    
    // Get pricing for specific service and category
    @Query("SELECT pr.price FROM PricingRule pr WHERE pr.service.id = :serviceId AND pr.vehicleCategory = :category")
    Optional<BigDecimal> findPriceByServiceIdAndCategory(@Param("serviceId") Long serviceId, @Param("category") String category);
}