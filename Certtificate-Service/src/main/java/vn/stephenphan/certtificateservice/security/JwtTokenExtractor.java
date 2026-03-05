package vn.stephenphan.certtificateservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Extracts user identity information from Keycloak JWT tokens
 */
@Component
public class JwtTokenExtractor {

    /**
     * Get the current authenticated user's JWT token
     */
    public Optional<Jwt> getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            return Optional.of((Jwt) authentication.getPrincipal());
        }
        return Optional.empty();
    }

    /**
     * Extract unique identifier (sub claim) from JWT
     */
    public Optional<String> getUserId() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("sub"));
    }

    /**
     * Extract preferred username from JWT
     */
    public Optional<String> getPreferredUsername() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("preferred_username"));
    }

    /**
     * Extract email from JWT
     */
    public Optional<String> getEmail() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("email"));
    }

    /**
     * Extract full name from JWT
     */
    public Optional<String> getFullName() {
        return getCurrentJwt().map(jwt -> {
            String givenName = jwt.getClaimAsString("given_name");
            String familyName = jwt.getClaimAsString("family_name");
            if (givenName != null && familyName != null) {
                return givenName + " " + familyName;
            }
            return jwt.getClaimAsString("name");
        });
    }

    /**
     * Extract realm roles from JWT
     */
    @SuppressWarnings("unchecked")
    public List<String> getRealmRoles() {
        return getCurrentJwt()
            .map(jwt -> jwt.getClaimAsMap("realm_access"))
            .map(realmAccess -> (List<String>) realmAccess.get("roles"))
            .orElse(List.of());
    }

    /**
     * Extract client-specific roles from JWT
     */
    @SuppressWarnings("unchecked")
    public List<String> getClientRoles(String clientId) {
        return getCurrentJwt()
            .map(jwt -> jwt.getClaimAsMap("resource_access"))
            .map(resourceAccess -> (Map<String, Object>) resourceAccess.get(clientId))
            .map(clientAccess -> (List<String>) clientAccess.get("roles"))
            .orElse(List.of());
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        List<String> realmRoles = getRealmRoles();
        return realmRoles.contains(role);
    }

    /**
     * Get Keycloak User Principal containing all identity information
     */
    public Optional<KeycloakUserPrincipal> getUserPrincipal() {
        return getCurrentJwt().map(jwt -> {
            String userId = jwt.getClaimAsString("sub");
            String username = jwt.getClaimAsString("preferred_username");
            String email = jwt.getClaimAsString("email");
            String fullName = getFullName().orElse(username);
            
            return KeycloakUserPrincipal.builder()
                .userId(userId)
                .username(username)
                .email(email)
                .fullName(fullName)
                .realmRoles(getRealmRoles())
                .build();
        });
    }
}
