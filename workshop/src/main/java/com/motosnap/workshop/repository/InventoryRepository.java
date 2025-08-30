package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    // Find active parts
    List<Inventory> findByActiveTrue();
    List<Inventory> findByActiveTrueOrderByPartNameAsc();
    
    // Find by part name or code
    Optional<Inventory> findByPartName(String partName);
    Optional<Inventory> findByPartCode(String partCode);
    boolean existsByPartName(String partName);
    boolean existsByPartCode(String partCode);
    
    // Low stock alerts
    @Query("SELECT i FROM Inventory i WHERE i.qty <= i.minStockLevel AND i.active = true")
    List<Inventory> findLowStockItems();
    
    @Query("SELECT i FROM Inventory i WHERE i.qty <= :threshold AND i.active = true")
    List<Inventory> findItemsWithStockBelow(@Param("threshold") Integer threshold);
    
    // Search parts
    @Query("SELECT i FROM Inventory i WHERE i.active = true AND " +
           "(LOWER(i.partName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.partCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Inventory> searchActiveParts(@Param("search") String search);
    
    List<Inventory> findByPartNameContainingIgnoreCaseOrPartCodeContainingIgnoreCase(String partName, String partCode);
    
    List<Inventory> findByCategoryIgnoreCase(String category);
    
    // Find by category or brand
    List<Inventory> findByCategoryIgnoreCaseAndActiveTrue(String category);
    List<Inventory> findByBrandIgnoreCaseAndActiveTrue(String brand);
    
    // Stock management queries
    @Query("SELECT i FROM Inventory i WHERE i.qty > 0 AND i.active = true ORDER BY i.partName")
    List<Inventory> findAvailableParts();
    
    @Query("SELECT i FROM Inventory i WHERE i.qty = 0 AND i.active = true")
    List<Inventory> findOutOfStockParts();
    
    // Get distinct categories and brands
    @Query("SELECT DISTINCT i.category FROM Inventory i WHERE i.active = true AND i.category IS NOT NULL ORDER BY i.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT i.brand FROM Inventory i WHERE i.active = true AND i.brand IS NOT NULL ORDER BY i.brand")
    List<String> findDistinctBrands();
}