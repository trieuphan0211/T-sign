package vn.stephenphan.certtificateservice.dto;

import lombok.Data;

@Data
public class IssueRequest {

    // Tên người dùng hoặc định danh duy nhất trong hệ thống CA
    private String username;

    // Mật khẩu đăng ký (nếu hệ thống CA yêu cầu)
    private String password;

    // Tên chung (Common Name - CN) cho chứng thư số
    // Ví dụ: "Nguyen Van A" hoặc "signhub.com"
    private String commonName;

    // Email người sở hữu chứng thư
    private String email;

    // Tên Certificate Profile (Cấu hình chứng thư, ví dụ: "ENDUSER")
    private String certificateProfileName;

    // Tên End Entity Profile (Cấu hình người dùng, ví dụ: "EMPTY")
    private String endEntityProfileName;

    // Certificate Authority name (CA cấp phát)
    private String caName;

    // Loại thuật toán key (RSA 2048, RSA 4096, ECC P-256...)
    private String keyAlgorithm;

    // Thời hạn (tính bằng ngày)
    private Integer validityDays;
}