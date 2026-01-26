package vn.stephenphan.signingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;

import java.time.LocalDateTime;

@Entity
@Table(name = "csr_requests")
@Data
public class CsrRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long keyId;
    private String subjectDn;
    @Column(columnDefinition = "TEXT")
    private String CsrContent;
    private LocalDateTime createAt;
}
