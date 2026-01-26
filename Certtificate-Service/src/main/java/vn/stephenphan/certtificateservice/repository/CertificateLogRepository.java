package vn.stephenphan.certtificateservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.stephenphan.certtificateservice.entity.CertificateLog;

import java.util.List;

@Repository
public interface CertificateLogRepository extends JpaRepository<CertificateLog, Long> {

    // Ví dụ: Tìm log theo serial number
    List<CertificateLog> findBySerialNumber(String serialNumber);

    // Ví dụ: Tìm log theo người dùng
    List<CertificateLog> findByUsername(String username);
}
