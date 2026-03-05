package vn.stephenphan.certtificateservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.stephenphan.certtificateservice.security.KeycloakUserPrincipal;
import vn.stephenphan.certtificateservice.client.EjbcaClient;
import vn.stephenphan.ejbca.soap.gen.UserDataVOWS;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for synchronizing Keycloak users with EJBCA End Entities
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserSynchronizationService {

    private final EjbcaSoapService ejbcaSoapService;
    private final EjbcaClient ejbcaClient;

    @Value("${pki.default.ca-name:SubCA}")
    private String defaultCaName;

    @Value("${pki.default.ee-profile:User_EE_Profile}")
    private String defaultEeProfile;

    @Value("${pki.default.cert-profile:UserSigning_Profile}")
    private String defaultCertProfile;

    /**
     * Synchronize Keycloak user with EJBCA End Entity
     * Implements "check-and-create" workflow
     * 
     * @param user Keycloak user principal
     * @param password Initial password for EJBCA user
     * @return true if user exists or was created successfully
     */
    public boolean synchronizeUser(KeycloakUserPrincipal user, String password) {
        String ejbcaUsername = user.getEjbcaSafeUsername();
        
        log.info("Starting user synchronization for Keycloak user: {} -> EJBCA user: {}", 
                user.getUsername(), ejbcaUsername);
        
        try {
            // Check if user already exists in EJBCA
            if (userExistsInEjbca(ejbcaUsername)) {
                log.info("User {} already exists in EJBCA", ejbcaUsername);
                return true;


            }
            
            // Create new End Entity in EJBCA
            log.info("Creating new End Entity in EJBCA for user: {}", ejbcaUsername);
            createEjbcaEndEntity(user, password);
            
            return true;
        } catch (Exception e) {
            log.error("Failed to synchronize user {} with EJBCA: {}", ejbcaUsername, e.getMessage());
            return false;
        }
    }

    /**
     * Check if user exists in EJBCA
     */
    public boolean userExistsInEjbca(String username) {
        try {
            List<vn.stephenphan.ejbca.soap.gen.Certificate> certs = 
                ejbcaSoapService.findCerts(username, false);
            return certs != null && !certs.isEmpty();
        } catch (Exception e) {
            // If we can't find certs, user likely doesn't exist
            return false;
        }
    }

    /**
     * Create EJBCA End Entity from Keycloak user
     */
    private void createEjbcaEndEntity(KeycloakUserPrincipal user, String password) {
        String ejbcaUsername = user.getEjbcaSafeUsername();
        String email = user.getEmail() != null ? user.getEmail() : ejbcaUsername + "@tsign.local";
        String commonName = user.getCommonName();

        ejbcaSoapService.createEndEntity(
            ejbcaUsername,
            password,
            commonName,
            email,
            defaultCaName,
            defaultEeProfile,
            defaultCertProfile
        );
        
        log.info("Successfully created EJBCA End Entity for user: {}", ejbcaUsername);
    }

    /**
     * Get or create user certificate
     * Returns Base64 encoded P12 keystore
     */
    public Optional<String> getOrCreateUserCertificate(KeycloakUserPrincipal user, String password) {
        String ejbcaUsername = user.getEjbcaSafeUsername();
        
        try {
            // First, ensure user exists in EJBCA
            if (!synchronizeUser(user, password)) {
                log.error("Failed to synchronize user {}", ejbcaUsername);
                return Optional.empty();
            }
            
            // Check if user already has a valid certificate
            List<vn.stephenphan.ejbca.soap.gen.Certificate> certs = 
                ejbcaSoapService.findCerts(ejbcaUsername, true);
            
            if (certs != null && !certs.isEmpty()) {
                log.info("User {} already has a valid certificate", ejbcaUsername);
                // Return existing certificate data
                return Optional.of(java.util.Base64.getEncoder().encodeToString(
                    certs.get(0).getCertificateData()));
            }
            
            // Generate new certificate (P12 keystore)
            log.info("Generating new certificate for user: {}", ejbcaUsername);
            Map<String, Object> keystoreRequest = new HashMap<>();
            keystoreRequest.put("username", ejbcaUsername);
            keystoreRequest.put("password", password);
            keystoreRequest.put("key_alg", "RSA");
            keystoreRequest.put("key_spec", "2048");
            
            String response = ejbcaClient.generateKeystore(keystoreRequest);
            return Optional.ofNullable(response);
            
        } catch (Exception e) {
            log.error("Failed to get or create certificate for user {}: {}", ejbcaUsername, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get user certificate using CSR (PKCS#10)
     * This is the preferred method for identity-driven certificate provisioning
     */
    public Optional<vn.stephenphan.ejbca.soap.gen.CertificateResponse> enrollWithCsr(
            KeycloakUserPrincipal user, 
            String password, 
            String csrPem) {
        
        String ejbcaUsername = user.getEjbcaSafeUsername();
        
        try {
            // Ensure user exists in EJBCA
            if (!synchronizeUser(user, password)) {
                log.error("Failed to synchronize user {}", ejbcaUsername);
                return Optional.empty();
            }
            
            // Submit CSR to EJBCA
            log.info("Submitting CSR for user: {}", ejbcaUsername);
            vn.stephenphan.ejbca.soap.gen.CertificateResponse response = 
                ejbcaSoapService.pkcs10Request(
                    ejbcaUsername,
                    password,
                    csrPem,
                    defaultCertProfile,
                    defaultEeProfile
                );
            
            return Optional.ofNullable(response);
            
        } catch (Exception e) {
            log.error("Failed to enroll certificate with CSR for user {}: {}", ejbcaUsername, e.getMessage());
            return Optional.empty();
        }
    }
}
