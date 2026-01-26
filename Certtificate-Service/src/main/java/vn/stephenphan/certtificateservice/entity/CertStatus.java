package vn.stephenphan.certtificateservice.entity;

public enum CertStatus {
    SUCCESS,    // Cấp phát thành công
    FAILED,     // Lỗi trong quá trình gọi EJBCA
    PENDING,    // (Tùy chọn) Đang chờ duyệt - dùng nếu bạn làm quy trình Approval sau này
    REVOKED,    // (Tùy chọn) Đã bị thu hồi
    EXPIRED     // (Tùy chọn) Đã hết hạn
}
