package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariationDefinition {
    
    @NotBlank(message = "Variation ID is required")
    private String id;
    
    @NotBlank(message = "Variation name is required")
    private String name;
    
    @NotBlank(message = "Variation type is required")
    private String type; // "dropdown", "radio", "checkbox"
    
    @NotEmpty(message = "Variation values cannot be empty")
    private List<String> values;
    
    private boolean required = true;
    
    // Constructor for easy creation
    public VariationDefinition(String id, String name, String type, List<String> values) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.values = values;
        this.required = true;
    }
}