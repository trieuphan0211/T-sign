package vn.stephenphan.certtificateservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.stephenphan.certtificateservice.dto.IssueRequest;
import vn.stephenphan.certtificateservice.service.CertificateService;

@RestController
@RequestMapping("/api/v1/certs")
@RequiredArgsConstructor
@Tag(name = "Certificate Management", description = "API about manager certificate")
public class CertificateController {

    private final CertificateService certificateService;

    @Operation(
            summary = "Enroll Certificate",
            description = "Receive the CSR from the Signing Service and submit it to EJBCA to obtain the digital certificate."
    )
//    @ApiResponse(responseCode = "200", description = "Thành công")
//    @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    @PostMapping("/enroll")
    public ResponseEntity<String> enrollCertificate(@RequestBody IssueRequest request) {
//        // request gồm: username, commonName, password
//        String p12Base64 = certificateService.issueCertificate(
//                request.getUsername(),
//                request.getCommonName(),
//                "tempPassword123" // Hoặc random password
//        );
//        System.out.println("The certificate has been issued to the user: " + request.getUsername());
        return ResponseEntity.ok(null);
    }

    @Operation(
            summary = "Revoke Certificate",
            description = "Revoke the digital certificate."
    )
    @PostMapping("/revoke")
    public ResponseEntity<String> revokeCertificate() {
        return ResponseEntity.ok(null);
    }

    @Operation(
            summary = "Get Certificate Status",
            description = "Get certificate status to check whether the user is allowed to sign."
    )
    @PostMapping("/status/{userId}")
    public ResponseEntity<String> getCertificateStatus(@PathParam("userId") String userId) {
        return ResponseEntity.ok(null);
    }

    @Operation(
            summary = "Get Certificate Detail",
            description = "Get certificate detail"
    )
    @GetMapping("/{serial}")
    public ResponseEntity<String> getCertificateDetail(@PathParam("serial") String serial_number) {
        return ResponseEntity.ok(null);
    }

    @Operation(
            summary = "Renew Certificate",
            description = "Issues a new certificate and revoke the expired ceritiface"
    )
    @GetMapping("/renew")
    public ResponseEntity<String> renewCertificate() {
        return ResponseEntity.ok(null);
    }
}
