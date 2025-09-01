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
    
    // Find active and non-deleted parts (default queries)
    @Query("SELECT i FROM Inventory i WHERE i.deleted = false")
    List<Inventory> findAllNonDeleted();
    
    @Query("SELECT i FROM Inventory i WHERE i.deleted = false ORDER BY i.partName ASC")
    List<Inventory> findAllNonDeletedOrderByName();
    
    @Query("SELECT i FROM Inventory i WHERE i.id = :id AND i.deleted = false")
    Optional<Inventory> findByIdAndNotDeleted(@Param("id") Long id);
    
    // Find active parts
    List<Inventory> findByActiveTrue();
    List<Inventory> findByActiveTrueOrderByPartNameAsc();
    
    // Find active and non-deleted parts
    @Query("SELECT i FROM Inventory i WHERE i.active = true AND i.deleted = false")
    List<Inventory> findByActiveTrueAndNotDeleted();
    
    @Query("SELECT i FROM Inventory i WHERE i.active = true AND i.deleted = false ORDER BY i.partName ASC")
    List<Inventory> findByActiveTrueAndNotDeletedOrderByName();
    
    // Find by part name or code
    Optional<Inventory> findByPartName(String partName);
    Optional<Inventory> findByPartCode(String partCode);
    boolean existsByPartName(String partName);
    boolean existsByPartCode(String partCode);
    
    // Low stock alerts
    @Query("SELECT i FROM Inventory i WHERE i.qty <= i.minStockLevel AND i.active = true AND i.deleted = false")
    List<Inventory> findLowStockItems();
    
    @Query("SELECT i FROM Inventory i WHERE i.qty <= :threshold AND i.active = true AND i.deleted = false")
    List<Inventory> findItemsWithStockBelow(@Param("threshold") Integer threshold);
    
    // Search parts
    @Query("SELECT i FROM Inventory i WHERE i.active = true AND i.deleted = false AND " +
           "(LOWER(i.partName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.partCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Inventory> searchActiveParts(@Param("search") String search);
    
    @Query("SELECT i FROM Inventory i WHERE i.deleted = false AND " +
           "(LOWER(i.partName) LIKE LOWER(CONCAT('%', :partName, '%')) " +
           "OR LOWER(i.partCode) LIKE LOWER(CONCAT('%', :partCode, '%')))")
    List<Inventory> findByPartNameContainingIgnoreCaseOrPartCodeContainingIgnoreCaseAndNotDeleted(
            @Param("partName") String partName, @Param("partCode") String partCode);
    
    List<Inventory> findByPartNameContainingIgnoreCaseOrPartCodeContainingIgnoreCase(String partName, String partCode);
    
    @Query("SELECT i FROM Inventory i WHERE LOWER(i.category) = LOWER(:category) AND i.deleted = false")
    List<Inventory> findByCategoryIgnoreCaseAndNotDeleted(@Param("category") String category);
    
    List<Inventory> findByCategoryIgnoreCase(String category);
    
    // Find by category or brand
    List<Inventory> findByCategoryIgnoreCaseAndActiveTrue(String category);
    List<Inventory> findByBrandIgnoreCaseAndActiveTrue(String brand);
    
    // Stock management queries
    @Query("SELECT i FROM Inventory i WHERE i.qty > 0 AND i.active = true AND i.deleted = false ORDER BY i.partName")
    List<Inventory> findAvailableParts();
    
    @Query("SELECT i FROM Inventory i WHERE i.qty = 0 AND i.active = true AND i.deleted = false")
    List<Inventory> findOutOfStockParts();
    
    // Get distinct categories and brands
    @Query("SELECT DISTINCT i.category FROM Inventory i WHERE i.active = true AND i.deleted = false AND i.category IS NOT NULL ORDER BY i.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT i.brand FROM Inventory i WHERE i.active = true AND i.deleted = false AND i.brand IS NOT NULL ORDER BY i.brand")
    List<String> findDistinctBrands();
    
    // Soft delete management
    @Query("SELECT i FROM Inventory i WHERE i.deleted = true")
    List<Inventory> findDeletedItems();
    
    // Dependency checking queries for safe deletion
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.part.id = :inventoryId")
    long countOrderItemsForInventory(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.inventory.id = :inventoryId")
    long countCartItemsForInventory(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT COUNT(r) FROM Request r WHERE r.part.id = :inventoryId")
    long countRequestsForInventory(@Param("inventoryId") Long inventoryId);
}