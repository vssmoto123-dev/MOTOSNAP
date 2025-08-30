package com.motosnap.workshop.service;

import com.motosnap.workshop.config.JwtConfig;
import com.motosnap.workshop.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    
    private final JwtConfig jwtConfig;
    private final Key signingKey;
    
    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.signingKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes());
    }
    
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("name", user.getName());
        claims.put("type", "access");
        
        return createToken(claims, user.getEmail(), jwtConfig.getAccessTokenExpiration());
    }
    
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("userId", user.getId());
        
        return createToken(claims, user.getEmail(), jwtConfig.getRefreshTokenExpiration());
    }
    
    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                .setSigningKey(signingKey)
                .parseClaimsJws(token)
                .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("JWT token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("JWT token is unsupported", e);
        } catch (MalformedJwtException e) {
            throw new RuntimeException("JWT token is malformed", e);
        } catch (io.jsonwebtoken.security.SecurityException e) {
            throw new RuntimeException("Invalid JWT signature", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("JWT token compact of handler are invalid", e);
        }
    }
    
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
    
    public Boolean isAccessToken(String token) {
        return "access".equals(extractTokenType(token));
    }
    
    public Boolean isRefreshToken(String token) {
        return "refresh".equals(extractTokenType(token));
    }
}