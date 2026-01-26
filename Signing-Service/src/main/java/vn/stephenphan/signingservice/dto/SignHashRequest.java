package vn.stephenphan.signingservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignHashRequest {
    // Hash SHA-256 of original File (had encode Base64)
    @NotBlank
    private String dataHash;

    // OTP Code
    @NotBlank
    private String otpCode;
}

