package vn.stephenphan.documentservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "document_versions")
@Data
public class DocumentVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id")
    private Document document;
    private Integer versionNumber;
    private String storagePath;
    private String hashValue;
    @Enumerated(EnumType.STRING)
    private DocumentStatus status;
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

}
