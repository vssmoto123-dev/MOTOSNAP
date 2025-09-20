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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001,file://,null,https://*.onrender.com,https://*.vercel.app}")
    private String allowedOrigins;

    @Value("${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,PATCH,OPTIONS}")
    private String allowedMethods;

    @Value("${CORS_ALLOWED_HEADERS:Authorization,Content-Type,X-Requested-With,Accept,Origin,Cache-Control,Pragma,Expires,If-Modified-Since,User-Agent}")
    private String allowedHeaders;

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

        // Parse allowed origins from environment variable
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // Parse allowed methods from environment variable
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));

        // Parse allowed headers from environment variable
        if ("*".equals(allowedHeaders.trim())) {
            configuration.setAllowedHeaders(Arrays.asList("*"));
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow OPTIONS preflight requests for CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints
                .requestMatchers("/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/cors-debug").permitAll()
                
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