package vn.stephenphan.signingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.stephenphan.signingservice.entity.CsrRequest;
import vn.stephenphan.signingservice.entity.HSMKeys;
import vn.stephenphan.signingservice.service.ISigningService;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/internal/key")
@Tag(name = "Key Management", description = "API about manager key and connect to Soft HSM")
public class InternalKeyManagementController {

    private final ISigningService signingService;

    @Operation(
            summary = "Generate Key",
            description = "Connect to Soft HSM to generate Private key and Public key and response CSR (Ceriticate Signing Request)"
    )
    @PostMapping("/generate")
    public ResponseEntity<CsrRequest> generateKey(@RequestBody Map<String,String> data){
        HSMKeys hsmKeys = signingService.generateKeyPair(data.get("alias"));
        CsrRequest csrRequest = signingService.generateCsr(hsmKeys, data.get("subjectDn"));
        return ResponseEntity.ok(csrRequest);
    }

    @Operation(
            summary = "Delete Key",
            description = "Delete key in Soft HSM when revoke certificate"
    )
    @DeleteMapping("/{keyAlias}")
    public  ResponseEntity<String> deleteKey(@PathVariable String keyAlias){
        return ResponseEntity.ok(null);
    }

}
