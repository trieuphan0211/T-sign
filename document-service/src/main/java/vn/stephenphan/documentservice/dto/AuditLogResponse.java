package vn.stephenphan.documentservice.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import vn.stephenphan.documentservice.entity.ActionType;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AuditLogResponse {
    private UUID docId;
    private ActionType action; // UPLOAD, VIEW, SIGN, DOWNLOAD, DELETE
    private UUID userId;
    private String ipAddress;
    private String userAgent;
    private Timestamp timestamp;
}
