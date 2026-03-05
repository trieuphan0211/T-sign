package vn.stephenphan.certtificateservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.stephenphan.certtificateservice.entity.PublicCertificate;

import java.util.Optional;

@Repository
public interface PublicCertificateRepository extends JpaRepository<PublicCertificate, Long> {

    Optional<PublicCertificate> findBySerialNumber(String serialNumber);

    Optional<PublicCertificate> findByUserId(String userId);

    Optional<PublicCertificate> findByKeyAlias(String keyAlias);
}
