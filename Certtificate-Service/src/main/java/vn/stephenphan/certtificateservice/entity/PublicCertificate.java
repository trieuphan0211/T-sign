package vn.stephenphan.certtificateservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "public_cerificates")
@Data
public class PublicCertificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String keyAlias;
    private String serialNumber;
    @Enumerated(EnumType.STRING)
    private CertStatus status;
    private String pemContext;
    private String notAfter;
    private LocalDateTime createAt;

}
