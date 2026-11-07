package com.nutrination;

import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Where an open circuit or a timed-out call ends up, for every HTTP method. */
@RestController
public class FallbackController {
    @RequestMapping("/fallback/{service}")
    public ResponseEntity<Map<String, Object>> serviceUnavailable(@PathVariable String service) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.RETRY_AFTER, "20")
                .body(Map.of(
                        "status", 503,
                        "code", "SERVICE_UNAVAILABLE",
                        "service", service,
                        "message", "This service is temporarily unavailable. Please try again shortly."));
    }
}
