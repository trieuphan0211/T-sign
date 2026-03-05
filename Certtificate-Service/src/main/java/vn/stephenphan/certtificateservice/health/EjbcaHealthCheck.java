package vn.stephenphan.certtificateservice.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import vn.stephenphan.certtificateservice.service.EjbcaSoapService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check for EJBCA connectivity (both SOAP and REST)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class EjbcaHealthCheck {

    private final EjbcaSoapService ejbcaSoapService;

    @Value("${ejbca.url}")
    private String ejbcaRestUrl;

    @Value("${ejbca.soap-url}")
    private String ejbcaSoapUrl;

    @Value("${spring.application.name}")
    private String applicationName;

    /**
     * Get overall application health including EJBCA connectivity
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("application", applicationName);
        response.put("timestamp", LocalDateTime.now().toString());
        
        // Check EJBCA REST
        Map<String, Object> restHealth = checkRestHealth();
        
        // Check EJBCA SOAP
        Map<String, Object> soapHealth = checkSoapHealth();
        
        // Combine results
        Map<String, Object> ejbcaHealth = new HashMap<>();
        ejbcaHealth.put("rest", restHealth);
        ejbcaHealth.put("soap", soapHealth);
        ejbcaHealth.put("restUrl", ejbcaRestUrl);
        ejbcaHealth.put("soapUrl", ejbcaSoapUrl);
        
        boolean restUp = (boolean) restHealth.getOrDefault("healthy", false);
        boolean soapUp = (boolean) soapHealth.getOrDefault("healthy", false);
        
        if (restUp && soapUp) {
            ejbcaHealth.put("status", "UP");
            response.put("status", "UP");
        } else if (restUp || soapUp) {
            ejbcaHealth.put("status", "PARTIALLY_UP");
            response.put("status", "PARTIALLY_UP");
        } else {
            ejbcaHealth.put("status", "DOWN");
            response.put("status", "DOWN");
        }
        
        response.put("ejbca", ejbcaHealth);
        
        int statusCode = (restUp || soapUp) ? 200 : 503;
        return ResponseEntity.status(statusCode).body(response);
    }

    /**
     * Quick health check for load balancers
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    /**
     * Check EJBCA REST API health
     */
    private Map<String, Object> checkRestHealth() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.debug("Checking EJBCA REST API health at: {}", ejbcaRestUrl);
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(
                    ejbcaRestUrl + "/v1/ca", String.class);
            
            boolean isHealthy = response.getStatusCode().is2xxSuccessful();
            result.put("healthy", isHealthy);
            result.put("status", isHealthy ? "UP" : "DOWN");
            result.put("httpStatus", response.getStatusCode().value());
            
            log.debug("EJBCA REST API health check result: {}", isHealthy ? "UP" : "DOWN");
            
        } catch (RestClientException e) {
            log.warn("EJBCA REST API health check failed: {}", e.getMessage());
            result.put("healthy", false);
            result.put("status", "DOWN");
            result.put("error", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during EJBCA REST health check: {}", e.getMessage());
            result.put("healthy", false);
            result.put("status", "DOWN");
            result.put("error", "Unexpected error: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Check EJBCA SOAP API health
     */
    private Map<String, Object> checkSoapHealth() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.debug("Checking EJBCA SOAP API health at: {}", ejbcaSoapUrl);
            
            // Try to get EJBCA version via SOAP
            String version = ejbcaSoapService.getEjbcaVersion();
            
            boolean isHealthy = version != null && !version.isEmpty();
            result.put("healthy", isHealthy);
            result.put("status", isHealthy ? "UP" : "DOWN");
            result.put("ejbcaVersion", version);
            
            log.debug("EJBCA SOAP API health check result: {} (version: {})", 
                    isHealthy ? "UP" : "DOWN", version);
                    
        } catch (Exception e) {
            log.warn("EJBCA SOAP API health check failed: {}", e.getMessage());
            result.put("healthy", false);
            result.put("status", "DOWN");
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}
