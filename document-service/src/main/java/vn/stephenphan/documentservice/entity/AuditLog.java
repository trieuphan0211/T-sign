package vn.stephenphan.documentservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;
    private UUID docId;
    @Enumerated(EnumType.STRING)
    private ActionType action; // UPLOAD, VIEW, SIGN, DOWNLOAD, DELETE
    private UUID userId;
    private String ipAddress;
    private String userAgent;
    private Timestamp timestamp = new Timestamp(System.currentTimeMillis());
}
