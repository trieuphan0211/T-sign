package vn.stephenphan.certtificateservice.dto;

import lombok.Data;

@Data
public class RenewRequest {

    // User identifier
    private String username;

    // User password
    private String password;

    // New CSR content in PEM format (optional - if not provided, will use existing keys)
    private String csrContent;

    // Certificate Profile name
    private String certificateProfileName;

    // End Entity Profile name
    private String endEntityProfileName;

    // CA Name
    private String caName;

    // Email address
    private String email;

    // Common Name
    private String commonName;

    // Old certificate serial number to revoke
    private String oldSerialNumber;

    // Issuer DN of old certificate
    private String oldIssuerDn;
}
