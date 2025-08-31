package com.motosnap.workshop.controller;

import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartsController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllParts() {
        List<Inventory> parts = inventoryService.getAllInventoryItems();
        return ResponseEntity.ok(parts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getPartById(@PathVariable Long id) {
        return inventoryService.getInventoryItemById(id)
                .map(part -> ResponseEntity.ok(part))
                .orElse(ResponseEntity.notFound().build());
    }
}