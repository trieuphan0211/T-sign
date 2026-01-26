package vn.stephenphan.certtificateservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.stephenphan.certtificateservice.client.EjbcaClient;
import vn.stephenphan.certtificateservice.entity.CertStatus;
import vn.stephenphan.certtificateservice.entity.CertificateLog;
import vn.stephenphan.certtificateservice.repository.CertificateLogRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final EjbcaSoapService soapService; // Dùng SOAP để tạo User (fix lỗi Community)
    private final EjbcaClient ejbcaClient;
    private final CertificateLogRepository certificateLogRepository;

    public String issueCertificate(String username, String commonName, String password) {
        CertificateLog certificateLog = new CertificateLog();
        certificateLog.setUsername(username);
        certificateLog.setIssuedAt(LocalDateTime.now());

        try{
            // Bước 1: Tạo End Entity trong EJBCA
            soapService.createEndEntity(username, password,commonName, username + "@tsign.local");

            // Bước 2: Request PKCS12 Keystore
            Map<String, Object> keystoreRequest = new HashMap<>();
            keystoreRequest.put("username", username);
            keystoreRequest.put("password", password);
            keystoreRequest.put("key_alg", "RSA");
            keystoreRequest.put("key_spec", "2048");
            System.out.println("Payload sent to EJBCA: " + keystoreRequest);
            String response = ejbcaClient.generateKeystore(keystoreRequest);
            // Response trả về Base64 của file .p12
//            String b64Keystore =response.get("123");

            // Lưu log thành công
            certificateLog.setStatus(CertStatus.SUCCESS);

            // (Thực tế nên decode P12 để lấy Serial Number lưu vào DB)
            certificateLogRepository.save(certificateLog);


            return response;
        }catch (Exception e) {
            certificateLog.setStatus(CertStatus.FAILED);
            certificateLog.setErrorMessage(e.getMessage());
            certificateLogRepository.save(certificateLog);
            throw new RuntimeException("Lỗi cấp phát chứng thư: " + e.getMessage());
        }
    }
}
