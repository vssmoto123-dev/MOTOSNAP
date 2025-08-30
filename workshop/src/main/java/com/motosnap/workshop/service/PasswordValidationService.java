package com.motosnap.workshop.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;
import java.util.Arrays;
import java.util.List;

@Service
public class PasswordValidationService {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");
    
    // Common weak passwords to reject
    private static final List<String> WEAK_PASSWORDS = Arrays.asList(
        "password", "12345678", "qwerty", "admin123", "password123", 
        "welcome123", "letmein", "changeme"
    );
    
    public void validatePassword(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Password must be at least " + MIN_LENGTH + " characters long");
        }
        
        if (!UPPERCASE.matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        
        if (!LOWERCASE.matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        
        if (!DIGIT.matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
        
        if (!SPECIAL_CHAR.matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
        
        if (WEAK_PASSWORDS.contains(password.toLowerCase())) {
            throw new IllegalArgumentException("Password is too common, please choose a stronger password");
        }
    }
}