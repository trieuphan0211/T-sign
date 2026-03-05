package vn.stephenphan.documentservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String fileName;
    private String storagePath;
    private Long fileSize;
    private String mineType;
    private String checksumSha256;
    private UUID ownerId;
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL)
    private List<DocumentVersion> versions;
}
