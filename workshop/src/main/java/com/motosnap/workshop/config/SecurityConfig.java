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
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow all OPTIONS requests globally for CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()

                // Public endpoints (specific parts endpoint for customers)
                .requestMatchers("/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/cors-debug",
                                "/api/parts/**", "/api/parts", "/api/test-deployment").permitAll()

                // Public inventory endpoints (for customers)
                .requestMatchers("/api/inventory/*/check-variation-stock-public").authenticated()

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