package vn.stephenphan.certtificateservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CertificateStatusResponse {

    // User ID
    private String userId;

    // Certificate status (ACTIVE, REVOKED, EXPIRED)
    private String status;

    // Key alias for signing operations
    private String keyAlias;

    // Certificate serial number
    private String serialNumber;

    // Revocation reason (if revoked)
    private String revocationReason;

    // Revocation date (if revoked)
    private LocalDateTime revocationDate;

    // Certificate not after date
    private LocalDateTime notAfter;
}
