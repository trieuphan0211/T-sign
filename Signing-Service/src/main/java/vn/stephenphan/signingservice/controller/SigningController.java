package vn.stephenphan.signingservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sign")
@Tag(name = "Signing Management",description = "API about manager certificate")
public class SigningController {

    @Operation(
            summary = "Get Hash Signature",
            description = "Get hash signature"
    )
    @PostMapping("/hash")
    public ResponseEntity<String> getHashSignature(@RequestBody String hash){
        return ResponseEntity.ok(hash);
    }

    @Operation(summary = "Sign PDF",description = "Sign PDF")
    @PostMapping("/pdf")
    public ResponseEntity<String> signPdf(@RequestBody String hash){
        return ResponseEntity.ok(hash);
    }

}
