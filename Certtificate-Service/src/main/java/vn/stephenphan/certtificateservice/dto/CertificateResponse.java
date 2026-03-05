package vn.stephenphan.certtificateservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CertificateResponse {

    // Certificate serial number
    private String serialNumber;

    // Certificate content in PEM format
    private String certificateContent;

    // Certificate status
    private String status;

    // Issuer DN
    private String issuerDn;

    // Subject DN
    private String subjectDn;

    // Not before date
    private LocalDateTime notBefore;

    // Not after date
    private LocalDateTime notAfter;

    // Key algorithm
    private String keyAlgorithm;

    // User ID associated with the certificate
    private String userId;
}
