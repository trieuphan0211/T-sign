package vn.stephenphan.signingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;

import java.time.LocalDateTime;

@Entity
@Table(name = "hsm_keys")
@Data
public class HSMKeys {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String keyAlias;
    private String algorithm;
    private Integer keySize;
    @Column(columnDefinition = "TEXT")
    private String publicKeyPem;
    @Enumerated(EnumType.STRING)
    private KeyStatus status;
    private LocalDateTime createdAt;

}
