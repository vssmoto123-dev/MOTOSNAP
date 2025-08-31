package com.motosnap.workshop.controller;

import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.repository.UserRepository;
import com.motosnap.workshop.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
@PreAuthorize("isAuthenticated()")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping("/user-info")
    public ResponseEntity<Map<String, Object>> getUserInfo(Authentication authentication) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            String email = authentication.getName();
            debug.put("authenticationEmail", email);
            
            Optional<User> user = userRepository.findByEmail(email);
            debug.put("userFound", user.isPresent());
            
            if (user.isPresent()) {
                User u = user.get();
                debug.put("userId", u.getId());
                debug.put("userName", u.getName());
                debug.put("userRole", u.getRole());
                debug.put("userActive", u.getActive());
            }
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            return ResponseEntity.ok(debug);
        }
    }

    @GetMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> getInventoryInfo(@PathVariable Long id) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            debug.put("inventoryId", id);
            
            Optional<Inventory> inventory = inventoryRepository.findById(id);
            debug.put("inventoryFound", inventory.isPresent());
            
            if (inventory.isPresent()) {
                Inventory inv = inventory.get();
                debug.put("partName", inv.getPartName());
                debug.put("partCode", inv.getPartCode());
                debug.put("quantity", inv.getQty());
                debug.put("unitPrice", inv.getUnitPrice());
                debug.put("active", inv.getActive());
            }
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            return ResponseEntity.ok(debug);
        }
    }

    @GetMapping("/inventory/count")
    public ResponseEntity<Map<String, Object>> getInventoryCount() {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            long count = inventoryRepository.count();
            debug.put("totalInventoryItems", count);
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            return ResponseEntity.ok(debug);
        }
    }
}