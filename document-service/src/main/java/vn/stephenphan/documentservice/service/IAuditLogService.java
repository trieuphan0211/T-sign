package vn.stephenphan.documentservice.service;

import org.springframework.web.multipart.MultipartFile;
import vn.stephenphan.documentservice.dto.AuditLogResponse;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.dto.VersionHistoryResponse;
import vn.stephenphan.documentservice.entity.ActionType;
import vn.stephenphan.documentservice.entity.DocumentStatus;

import java.util.List;
import java.util.UUID;

public interface IAuditLogService {
    void log(UUID docId, ActionType action, UUID userId, String ip, String userAgent);
    List<AuditLogResponse> getList();
}
