package vn.stephenphan.certtificateservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.stephenphan.certtificateservice.client.EjbcaClient;
import vn.stephenphan.certtificateservice.dto.*;
import vn.stephenphan.certtificateservice.entity.CertStatus;
import vn.stephenphan.certtificateservice.entity.CertificateLog;
import vn.stephenphan.certtificateservice.entity.PublicCertificate;
import vn.stephenphan.certtificateservice.repository.CertificateLogRepository;
import vn.stephenphan.ejbca.soap.gen.Certificate;
import vn.stephenphan.ejbca.soap.gen.RevokeStatus;

import java.io.ByteArrayInputStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.xml.datatype.XMLGregorianCalendar;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final EjbcaSoapService soapService;
    private final EjbcaClient ejbcaClient;
    private final CertificateLogRepository certificateLogRepository;

    // Default EJBCA configuration
    private static final String DEFAULT_CA_NAME = "Internal Issuing CA";
    private static final String DEFAULT_EE_PROFILE = "TSign_User_Form";
    private static final String DEFAULT_CERT_PROFILE = "TSign_User_Profile";

    /**
     * Issue certificate using PKCS#12 keystore generation (original method)
     */
    @Transactional
    public String issueCertificate(String username, String commonName, String password) {
        CertificateLog certificateLog = new CertificateLog();
        certificateLog.setUsername(username);
        certificateLog.setIssuedAt(LocalDateTime.now());

        try {
            // Step 1: Create End Entity in EJBCA
            soapService.createEndEntity(username, password, commonName, 
                    username + "@tsign.local", DEFAULT_CA_NAME, DEFAULT_EE_PROFILE, DEFAULT_CERT_PROFILE);

            // Step 2: Request PKCS12 Keystore
            Map<String, Object> keystoreRequest = new HashMap<>();
            keystoreRequest.put("username", username);
            keystoreRequest.put("password", password);
            keystoreRequest.put("key_alg", "RSA");
            keystoreRequest.put("key_spec", "2048");
            System.out.println("Payload sent to EJBCA: " + keystoreRequest);
            String response = ejbcaClient.generateKeystore(keystoreRequest);

            // Log success
            certificateLog.setStatus(CertStatus.SUCCESS);
            certificateLogRepository.save(certificateLog);

            return response;
        } catch (Exception e) {
            certificateLog.setStatus(CertStatus.FAILED);
            certificateLog.setErrorMessage(e.getMessage());
            certificateLogRepository.save(certificateLog);
            throw new RuntimeException("Certificate issuance error: " + e.getMessage(), e);
        }
    }

    /**
     * Enroll certificate using CSR (PKCS#10)
     */
    @Transactional
    public CertificateResponse enrollWithCsr(CsrEnrollRequest request) {
        CertificateLog certificateLog = new CertificateLog();
        certificateLog.setUsername(request.getUsername());
        certificateLog.setIssuedAt(LocalDateTime.now());

        try {
            // Set defaults if not provided
            String caName = Optional.ofNullable(request.getCaName()).orElse(DEFAULT_CA_NAME);
            String eeProfile = Optional.ofNullable(request.getEndEntityProfileName()).orElse(DEFAULT_EE_PROFILE);
            String certProfile = Optional.ofNullable(request.getCertificateProfileName()).orElse(DEFAULT_CERT_PROFILE);

            // Step 1: Create End Entity
            soapService.createEndEntity(
                    request.getUsername(),
                    request.getPassword(),
                    request.getCommonName(),
                    request.getEmail(),
                    caName,
                    eeProfile,
                    certProfile
            );

            // Step 2: Submit CSR and get certificate
            vn.stephenphan.ejbca.soap.gen.CertificateResponse certResponse = 
                    soapService.pkcs10Request(
                            request.getUsername(),
                            request.getPassword(),
                            request.getCsrContent(),
                            certProfile,
                            eeProfile
                    );

            // Parse the certificate to extract details
            X509Certificate x509Cert = parseCertificate(certResponse.getData());
            String serialNumber = x509Cert.getSerialNumber().toString(16).toUpperCase();

            // Log success
            certificateLog.setSerialNumber(serialNumber);
            certificateLog.setStatus(CertStatus.SUCCESS);
            certificateLogRepository.save(certificateLog);

            // Build response
            return CertificateResponse.builder()
                    .serialNumber(serialNumber)
                    .certificateContent(pemEncode(certResponse.getData()))
                    .status("ACTIVE")
                    .issuerDn(x509Cert.getIssuerX500Principal().getName())
                    .subjectDn(x509Cert.getSubjectX500Principal().getName())
                    .notBefore(LocalDateTime.ofInstant(x509Cert.getNotBefore().toInstant(), ZoneId.systemDefault()))
                    .notAfter(LocalDateTime.ofInstant(x509Cert.getNotAfter().toInstant(), ZoneId.systemDefault()))
                    .keyAlgorithm(x509Cert.getPublicKey().getAlgorithm())
                    .userId(request.getUsername())
                    .build();

        } catch (Exception e) {
            certificateLog.setStatus(CertStatus.FAILED);
            certificateLog.setErrorMessage(e.getMessage());
            certificateLogRepository.save(certificateLog);
            throw new RuntimeException("CSR enrollment error: " + e.getMessage(), e);
        }
    }

    /**
     * Revoke a certificate
     */
    @Transactional
    public void revokeCertificate(RevokeRequest request) {
        try {
            int reason = Optional.ofNullable(request.getReason()).orElse(0);

            if (request.getIssuerDn() != null && request.getSerialNumber() != null) {
                // Revoke by issuer DN and serial number
                soapService.revokeCert(request.getIssuerDn(), request.getSerialNumber(), reason);
            } else if (request.getUsername() != null) {
                // Revoke by username - find the latest certificate
                Certificate cert = soapService.getLatestCertificate(request.getUsername());
                if (cert == null) {
                    throw new RuntimeException("No certificate found for user: " + request.getUsername());
                }
                X509Certificate x509Cert = parseCertificate(cert.getCertificateData());
                String serialNumber = x509Cert.getSerialNumber().toString(16).toUpperCase();
                String issuerDn = x509Cert.getIssuerX500Principal().getName();
                soapService.revokeCert(issuerDn, serialNumber, reason);
            } else {
                throw new IllegalArgumentException("Either (issuerDn + serialNumber) or username must be provided");
            }
        } catch (Exception e) {
            throw new RuntimeException("Certificate revocation error: " + e.getMessage(), e);
        }
    }

    /**
     * Get certificate status for a user
     */
    public CertificateStatusResponse getCertificateStatus(String userId) {
        try {
            // Find user's certificates
            List<Certificate> certs = soapService.findCerts(userId, false);
            
            if (certs == null || certs.isEmpty()) {
                return CertificateStatusResponse.builder()
                        .userId(userId)
                        .status("NO_CERTIFICATE")
                        .build();
            }

            // Get the latest certificate
            Certificate latestCert = certs.get(0);
            X509Certificate x509Cert = parseCertificate(latestCert.getCertificateData());
            String serialNumber = x509Cert.getSerialNumber().toString(16).toUpperCase();
            String issuerDn = x509Cert.getIssuerX500Principal().getName();

            // Check revocation status
            RevokeStatus revokeStatus = soapService.checkRevocationStatus(issuerDn, serialNumber);
            
            LocalDateTime notAfter = LocalDateTime.ofInstant(
                    x509Cert.getNotAfter().toInstant(), ZoneId.systemDefault());
            boolean isExpired = notAfter.isBefore(LocalDateTime.now());

            String status;
            if (revokeStatus != null && revokeStatus.getReason() >= 0) {
                status = "REVOKED";
            } else if (isExpired) {
                status = "EXPIRED";
            } else {
                status = "ACTIVE";
            }

            return CertificateStatusResponse.builder()
                    .userId(userId)
                    .status(status)
                    .keyAlias(userId + "_key") // Default key alias pattern
                    .serialNumber(serialNumber)
                    .revocationReason(revokeStatus != null ? 
                            RevocationReason.fromCode(revokeStatus.getReason()).getName() : null)
                    .revocationDate(revokeStatus != null && revokeStatus.getRevocationDate() != null ?
                            convertToLocalDateTime(revokeStatus.getRevocationDate()) : null)
                    .notAfter(notAfter)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error getting certificate status: " + e.getMessage(), e);
        }
    }

    /**
     * Get certificate details by serial number
     */
    public CertificateResponse getCertificateDetail(String serialNumber, String issuerDn) {
        try {
            Certificate cert;
            if (issuerDn != null) {
                cert = soapService.getCertificate(issuerDn, serialNumber);
            } else {
                // Try to find by searching - this is a workaround
                // In production, you should have a proper database mapping
                throw new IllegalArgumentException("issuerDn is required to get certificate details");
            }

            if (cert == null) {
                throw new RuntimeException("Certificate not found");
            }

            X509Certificate x509Cert = parseCertificate(cert.getCertificateData());
            
            // Check revocation status
            String certIssuerDn = x509Cert.getIssuerX500Principal().getName();
            RevokeStatus revokeStatus = soapService.checkRevocationStatus(certIssuerDn, serialNumber);
            
            String status = (revokeStatus != null && revokeStatus.getReason() >= 0) ? "REVOKED" : "ACTIVE";

            return CertificateResponse.builder()
                    .serialNumber(serialNumber)
                    .certificateContent(pemEncode(cert.getCertificateData()))
                    .status(status)
                    .issuerDn(certIssuerDn)
                    .subjectDn(x509Cert.getSubjectX500Principal().getName())
                    .notBefore(LocalDateTime.ofInstant(x509Cert.getNotBefore().toInstant(), ZoneId.systemDefault()))
                    .notAfter(LocalDateTime.ofInstant(x509Cert.getNotAfter().toInstant(), ZoneId.systemDefault()))
                    .keyAlgorithm(x509Cert.getPublicKey().getAlgorithm())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error getting certificate details: " + e.getMessage(), e);
        }
    }

    /**
     * Renew a certificate
     */
    @Transactional
    public CertificateResponse renewCertificate(RenewRequest request) {
        try {
            // Step 1: Revoke the old certificate if serial number provided
            if (request.getOldSerialNumber() != null && request.getOldIssuerDn() != null) {
                RevokeRequest revokeReq = new RevokeRequest();
                revokeReq.setSerialNumber(request.getOldSerialNumber());
                revokeReq.setIssuerDn(request.getOldIssuerDn());
                revokeReq.setReason(RevocationReason.SUPERSEDED.getCode());
                revokeCertificate(revokeReq);
            }

            // Step 2: Issue new certificate
            CsrEnrollRequest enrollRequest = new CsrEnrollRequest();
            enrollRequest.setUsername(request.getUsername());
            enrollRequest.setPassword(request.getPassword());
            enrollRequest.setCsrContent(request.getCsrContent());
            enrollRequest.setCertificateProfileName(request.getCertificateProfileName());
            enrollRequest.setEndEntityProfileName(request.getEndEntityProfileName());
            enrollRequest.setCaName(request.getCaName());
            enrollRequest.setEmail(request.getEmail());
            enrollRequest.setCommonName(request.getCommonName());

            return enrollWithCsr(enrollRequest);

        } catch (Exception e) {
            throw new RuntimeException("Certificate renewal error: " + e.getMessage(), e);
        }
    }

    /**
     * Parse certificate from DER bytes
     */
    private X509Certificate parseCertificate(byte[] certData) throws Exception {
        CertificateFactory factory = CertificateFactory.getInstance("X.509");
        return (X509Certificate) factory.generateCertificate(new ByteArrayInputStream(certData));
    }

    /**
     * Encode certificate to PEM format
     */
    /**
     * Convert XMLGregorianCalendar to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(XMLGregorianCalendar xmlCalendar) {
        if (xmlCalendar == null) {
            return null;
        }
        return LocalDateTime.ofInstant(
                xmlCalendar.toGregorianCalendar().toInstant(), 
                ZoneId.systemDefault());
    }

    private String pemEncode(byte[] certData) {
        String base64 = java.util.Base64.getEncoder().encodeToString(certData);
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN CERTIFICATE-----\n");
        // Split base64 into 64-character lines
        for (int i = 0; i < base64.length(); i += 64) {
            pem.append(base64, i, Math.min(i + 64, base64.length())).append("\n");
        }
        pem.append("-----END CERTIFICATE-----\n");
        return pem.toString();
    }
}
