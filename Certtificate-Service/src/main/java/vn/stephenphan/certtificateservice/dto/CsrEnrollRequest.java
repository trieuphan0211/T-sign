package vn.stephenphan.certtificateservice.dto;

import lombok.Data;

@Data
public class CsrEnrollRequest {

    // User identifier in the system
    private String username;

    // User password for EJBCA authentication
    private String password;

    // CSR content in PEM format
    private String csrContent;

    // Certificate Profile name (e.g., "UserSigning_Profile")
    private String certificateProfileName;

    // End Entity Profile name (e.g., "User_EE_Profile")
    private String endEntityProfileName;

    // CA Name (e.g., "SubCA")
    private String caName;

    // Email address
    private String email;

    // Common Name for the certificate
    private String commonName;
}
