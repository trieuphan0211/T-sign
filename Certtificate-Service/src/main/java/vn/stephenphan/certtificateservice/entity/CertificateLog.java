package vn.stephenphan.certtificateservice.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificate_logs")
@Data
public class CertificateLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String serialNumber;
    private String profileName;

    @Enumerated(EnumType.STRING)
    private CertStatus status; // ENUM: SUCCESS, FAILED

    private LocalDateTime issuedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
