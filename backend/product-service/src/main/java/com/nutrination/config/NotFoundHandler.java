package com.nutrination.config;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Unknown products/categories are a 404, not a 500 (order-service relies on this to validate items). */
@RestControllerAdvice
public class NotFoundHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    ProblemDetail notFound(EntityNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }
}
