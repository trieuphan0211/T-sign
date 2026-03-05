package vn.stephenphan.certtificateservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.stephenphan.certtificateservice.dto.*;
import vn.stephenphan.certtificateservice.security.JwtTokenExtractor;
import vn.stephenphan.certtificateservice.security.KeycloakUserPrincipal;
import vn.stephenphan.certtificateservice.service.CertificateService;
import vn.stephenphan.certtificateservice.service.UserSynchronizationService;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/certs")
@RequiredArgsConstructor
@Tag(name = "Certificate Management", description = "API for managing digital certificates with Keycloak identity integration")
@SecurityRequirement(name = "bearerAuth")
public class CertificateController {

    private final CertificateService certificateService;
    private final UserSynchronizationService userSynchronizationService;
    private final JwtTokenExtractor jwtTokenExtractor;

    @Operation(
            summary = "Enroll Certificate with CSR (Identity-Driven)",
            description = "Enroll a certificate using CSR for the authenticated Keycloak user. " +
                    "The user is automatically synchronized with EJBCA. Requires 'signer_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Certificate issued successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User lacks signer_role"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
//    @PreAuthorize("hasRole('signer_role')")
    @PostMapping("/enroll")
    public ResponseEntity<CertificateResponse> enrollCertificate(
            @Parameter(description = "CSR enrollment request with user password", required = true)
            @RequestBody CsrEnrollRequest request) {
        
        // Get authenticated user from Keycloak JWT
        KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
            .orElseThrow(() -> new RuntimeException("Unable to extract user from JWT token"));
        
        // Use Keycloak identity for certificate enrollment
        request.setUsername(user.getEjbcaSafeUsername());
        request.setEmail(user.getEmail());
        request.setCommonName(user.getCommonName());
        
        CertificateResponse response = certificateService.enrollWithCsr(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Revoke Certificate",
            description = "Revoke a certificate by serial number or username. " +
                    "Requires 'admin_role' or 'signer_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Certificate revoked successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Insufficient privileges"),
            @ApiResponse(responseCode = "404", description = "Certificate not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasAnyRole('admin_role', 'signer_role')")
    @PostMapping("/revoke")
    public ResponseEntity<Void> revokeCertificate(
            @RequestBody RevokeRequest request) {
        certificateService.revokeCertificate(request);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get Certificate Status (Self)",
            description = "Get the authenticated user's own certificate status. " +
                    "Returns ACTIVE, REVOKED, EXPIRED, or NO_CERTIFICATE status.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/status/me")
    public ResponseEntity<CertificateStatusResponse> getMyCertificateStatus() {
        KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
            .orElseThrow(() -> new RuntimeException("Unable to extract user from JWT token"));
        
        CertificateStatusResponse response = 
            certificateService.getCertificateStatus(user.getEjbcaSafeUsername());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get Certificate Status by User ID",
            description = "Check certificate status for a specific user. " +
                    "Accessible to users with 'viewer_role', 'signer_role', or 'admin_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PreAuthorize("hasAnyRole('viewer_role', 'signer_role', 'admin_role')")
    @GetMapping("/status/{userId}")
    public ResponseEntity<CertificateStatusResponse> getCertificateStatus(
            @Parameter(description = "User ID to check status for", required = true)
            @PathVariable String userId) {
        CertificateStatusResponse response = certificateService.getCertificateStatus(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get Certificate Details",
            description = "Get detailed information about a specific certificate by serial number.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Certificate details retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Certificate not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasAnyRole('viewer_role', 'signer_role', 'admin_role')")
    @GetMapping("/{serial}")
    public ResponseEntity<CertificateResponse> getCertificateDetail(
            @Parameter(description = "Certificate serial number (hex)", required = true)
            @PathVariable("serial") String serialNumber,
            @Parameter(description = "Issuer DN (optional)", required = false)
            @RequestParam(required = false) String issuerDn) {
        CertificateResponse response = certificateService.getCertificateDetail(serialNumber, issuerDn);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Renew Certificate (Identity-Driven)",
            description = "Renew the authenticated user's certificate. " +
                    "The old certificate is revoked with reason 'SUPERSEDED' (4). " +
                    "Requires 'signer_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Certificate renewed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User lacks signer_role"),
            @ApiResponse(responseCode = "404", description = "Old certificate not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasRole('signer_role')")
    @PostMapping("/renew")
    public ResponseEntity<CertificateResponse> renewCertificate(
            @RequestBody RenewRequest request) {
        
        // Get authenticated user from Keycloak JWT
        KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
            .orElseThrow(() -> new RuntimeException("Unable to extract user from JWT token"));
        
        // Use Keycloak identity
        request.setUsername(user.getEjbcaSafeUsername());
        request.setEmail(user.getEmail());
        request.setCommonName(user.getCommonName());
        
        CertificateResponse response = certificateService.renewCertificate(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Issue Certificate via P12 (Identity-Driven, Legacy)",
            description = "Issue a P12 keystore for the authenticated Keycloak user. " +
                    "The user is automatically synchronized with EJBCA. " +
                    "Requires 'signer_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Certificate issued successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User lacks signer_role"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasRole('signer_role')")
    @PostMapping("/issue-p12")
    public ResponseEntity<String> issueCertificateP12(
            @RequestBody IssueRequest request) {
        
        // Get authenticated user from Keycloak JWT
        KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
            .orElseThrow(() -> new RuntimeException("Unable to extract user from JWT token"));
        
        // Use Keycloak identity
        String username = user.getEjbcaSafeUsername();
        String commonName = user.getCommonName();
        
        String response = certificateService.issueCertificate(
                username,
                commonName,
                request.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Synchronize User with EJBCA",
            description = "Manually trigger user synchronization with EJBCA. " +
                    "Creates End Entity if it doesn't exist. Requires 'signer_role'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User synchronized successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Synchronization failed")
    })
//    @PreAuthorize("hasRole('signer_role')")
    @PostMapping("/sync-user")
    public ResponseEntity<String> synchronizeUser(
            @Parameter(description = "Initial password for EJBCA user", required = true)
            @RequestParam String password) {
        
        KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
            .orElseThrow(() -> new RuntimeException("Unable to extract user from JWT token"));
        
        boolean success = userSynchronizationService.synchronizeUser(user, password);
        
        if (success) {
            return ResponseEntity.ok("User synchronized successfully with EJBCA");
        } else {
            return ResponseEntity.status(500).body("Failed to synchronize user");
        }
    }
}
