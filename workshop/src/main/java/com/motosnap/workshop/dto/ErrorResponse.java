package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String timestamp;

    public ErrorResponse(String error, String message, int status) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }

    public static ErrorResponse badRequest(String message) {
        return new ErrorResponse("Bad Request", message, 400);
    }

    public static ErrorResponse conflict(String message) {
        return new ErrorResponse("Conflict", message, 409);
    }

    public static ErrorResponse internalServerError(String message) {
        return new ErrorResponse("Internal Server Error", message, 500);
    }
}