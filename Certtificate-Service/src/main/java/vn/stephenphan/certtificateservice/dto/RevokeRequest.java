package vn.stephenphan.certtificateservice.dto;

import lombok.Data;

@Data
public class RevokeRequest {

    // Certificate serial number (hex)
    private String serialNumber;

    // Issuer DN
    private String issuerDn;

    // Revocation reason (0-10, see RevocationReason enum)
    private Integer reason;

    // Username (alternative to serial number + issuer DN)
    private String username;
}
