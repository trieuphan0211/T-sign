package vn.stephenphan.certtificateservice.service;

import jakarta.xml.bind.JAXBElement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;
import vn.stephenphan.ejbca.soap.gen.*;

import java.math.BigInteger;
import java.util.List;

@Slf4j
@Service
public class EjbcaSoapService {

    @Autowired
    private WebServiceTemplate webServiceTemplate;

    /**
     * Get EJBCA version - useful for health checks
     */
    public String getEjbcaVersion() {
        try {
            ObjectFactory factory = new ObjectFactory();
            GetEjbcaVersion request = new GetEjbcaVersion();
            
            JAXBElement<GetEjbcaVersion> requestPayload = factory.createGetEjbcaVersion(request);
            
            @SuppressWarnings("unchecked")
            JAXBElement<GetEjbcaVersionResponse> response = (JAXBElement<GetEjbcaVersionResponse>)
                    webServiceTemplate.marshalSendAndReceive(requestPayload);
            
            return response.getValue().getReturn();
        } catch (Exception e) {
            log.error("Failed to get EJBCA version: {}", e.getMessage());
            throw new RuntimeException("Unable to get EJBCA version", e);
        }
    }

    /**
     * Create or update an end entity in EJBCA
     */
    public void createEndEntity(String username, String password, String cn, String email,
                                 String caName, String eeProfile, String certProfile) {
        ObjectFactory factory = new ObjectFactory();

        // 1. Create UserData object
        UserDataVOWS user = new UserDataVOWS();
        user.setUsername(username);
        user.setPassword(password);
        user.setClearPwd(true);
        user.setSubjectDN("CN=" + cn + ",O=Mobile-ID,C=Vietnam");
        user.setEmail(email);

        // Config must match EJBCA profiles
        user.setCaName(caName != null ? caName : "SubCA");
        user.setEndEntityProfileName(eeProfile != null ? eeProfile : "User_EE_Profile");
        user.setCertificateProfileName(certProfile != null ? certProfile : "UserSigning_Profile");
        user.setStatus(10); // 10 = NEW (ready for certificate issuance)
        user.setTokenType("P12");

        // 2. Create Request Wrapper
        EditUser request = new EditUser();
        request.setArg0(user);

        // 3. Wrap into JAXBElement
        JAXBElement<EditUser> requestPayload = factory.createEditUser(request);

        // 4. Send Request
        log.info("Sending EditUser request to EJBCA for username: {}", username);
        webServiceTemplate.marshalSendAndReceive(requestPayload);

        log.info("✅ User created successfully: {}", username);
    }

    /**
     * Process PKCS#10 CSR and issue certificate
     */
    public CertificateResponse pkcs10Request(String username, String password, String csrPem,
                                              String certProfile, String eeProfile) {
        ObjectFactory factory = new ObjectFactory();

        // Convert PEM CSR to bytes
        String csrClean = csrPem
                .replace("-----BEGIN CERTIFICATE REQUEST-----", "")
                .replace("-----END CERTIFICATE REQUEST-----", "")
                .replaceAll("\\s", "");
        byte[] csrBytes = java.util.Base64.getDecoder().decode(csrClean);

        Pkcs10Request request = new Pkcs10Request();
        request.setArg0(username);
        request.setArg1(password);
        request.setArg2(java.util.Base64.getEncoder().encodeToString(csrBytes));
        request.setArg3(certProfile);
        request.setArg4(eeProfile);

        JAXBElement<Pkcs10Request> requestPayload = factory.createPkcs10Request(request);

        @SuppressWarnings("unchecked")
        JAXBElement<Pkcs10RequestResponse> response = (JAXBElement<Pkcs10RequestResponse>)
                webServiceTemplate.marshalSendAndReceive(requestPayload);

        return response.getValue().getReturn();
    }

    /**
     * Revoke a certificate by issuer DN and serial number
     */
    public void revokeCert(String issuerDn, String serialNumberHex, int reason) {
        ObjectFactory factory = new ObjectFactory();

        RevokeCert request = new RevokeCert();
        request.setArg0(issuerDn);
        request.setArg1(serialNumberHex);
        request.setArg2(reason);

        JAXBElement<RevokeCert> requestPayload = factory.createRevokeCert(request);
        webServiceTemplate.marshalSendAndReceive(requestPayload);

        log.info("✅ Certificate revoked: {}", serialNumberHex);
    }

    /**
     * Check revocation status of a certificate
     */
    public RevokeStatus checkRevocationStatus(String issuerDn, String serialNumberHex) {
        ObjectFactory factory = new ObjectFactory();

        CheckRevokationStatus request = new CheckRevokationStatus();
        request.setArg0(issuerDn);
        request.setArg1(serialNumberHex);

        JAXBElement<CheckRevokationStatus> requestPayload = factory.createCheckRevokationStatus(request);

        @SuppressWarnings("unchecked")
        JAXBElement<CheckRevokationStatusResponse> response = (JAXBElement<CheckRevokationStatusResponse>)
                webServiceTemplate.marshalSendAndReceive(requestPayload);

        return response.getValue().getReturn();
    }

    /**
     * Get certificate by issuer DN and serial number
     */
    public Certificate getCertificate(String issuerDn, String serialNumberHex) {
        ObjectFactory factory = new ObjectFactory();

        GetCertificate request = new GetCertificate();
        request.setArg0(issuerDn);
        request.setArg1(serialNumberHex);

        JAXBElement<GetCertificate> requestPayload = factory.createGetCertificate(request);

        @SuppressWarnings("unchecked")
        JAXBElement<GetCertificateResponse> response = (JAXBElement<GetCertificateResponse>)
                webServiceTemplate.marshalSendAndReceive(requestPayload);

        return response.getValue().getReturn();
    }

    /**
     * Find certificates by username
     */
    public List<Certificate> findCerts(String username, boolean onlyValid) {
        ObjectFactory factory = new ObjectFactory();

        FindCerts request = new FindCerts();
        request.setArg0(username);
        request.setArg1(onlyValid);

        JAXBElement<FindCerts> requestPayload = factory.createFindCerts(request);

        @SuppressWarnings("unchecked")
        JAXBElement<FindCertsResponse> response = (JAXBElement<FindCertsResponse>)
                webServiceTemplate.marshalSendAndReceive(requestPayload);

        return response.getValue().getReturn();
    }

    /**
     * Get the latest certificate for a user
     */
    public Certificate getLatestCertificate(String username) {
        List<Certificate> certs = findCerts(username, false);
        if (certs == null || certs.isEmpty()) {
            return null;
        }
        // Return the first (most recent) certificate
        return certs.get(0);
    }
}
