package vn.stephenphan.certtificateservice.security;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Represents a Keycloak-authenticated user principal
 */
@Data
@Builder
public class KeycloakUserPrincipal {

    // Keycloak user unique identifier (sub claim)
    private String userId;
    
    // Preferred username from Keycloak
    private String username;
    
    // User email
    private String email;
    
    // User full name
    private String fullName;
    
    // Realm roles assigned to the user
    private List<String> realmRoles;
    
    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        return realmRoles != null && realmRoles.contains(role);
    }
    
    /**
     * Generate a safe username for EJBCA End Entity naming
     * Removes special characters that might cause issues in EJBCA
     */
    public String getEjbcaSafeUsername() {
        if (username == null) return null;
        return username.replaceAll("[^a-zA-Z0-9_-]", "_").toLowerCase();
    }
    
    /**
     * Generate Common Name (CN) for certificate subject DN
     */
    public String getCommonName() {
        return fullName != null ? fullName : username;
    }
}
