package com.motosnap.workshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strong hashing with 12 rounds
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/register", "/api/auth/login", 
                                "/api/auth/refresh").permitAll()
                
                // Admin only endpoints
                .requestMatchers("/api/admin/**", "/api/users/**", 
                                "/api/inventory/**", "/api/services/**").hasRole("ADMIN")
                
                // Booking management endpoints (Admin and Mechanic)
                .requestMatchers("/api/bookings/*/status", "/api/bookings/*/assign").hasAnyRole("ADMIN", "MECHANIC")
                
                // Mechanic-only endpoints
                .requestMatchers("/api/requests/**").hasRole("MECHANIC")
                
                // Customer endpoints
                .requestMatchers("/api/me/**", "/api/bookings/create").hasRole("CUSTOMER")
                
                // Shared endpoints (authenticated users)
                .requestMatchers("/api/bookings", "/api/profile").authenticated()
                
                // Allow all other requests for now (will be restricted as we build features)
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}