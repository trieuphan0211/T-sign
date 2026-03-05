package vn.stephenphan.documentservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import vn.stephenphan.documentservice.dto.AuditLogResponse;
import vn.stephenphan.documentservice.entity.ActionType;
import vn.stephenphan.documentservice.entity.AuditLog;
import vn.stephenphan.documentservice.repository.AuditLogRepository;
import vn.stephenphan.documentservice.service.IAuditLogService;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService implements IAuditLogService {
    private final AuditLogRepository auditLogRepository;

    @Override
    @Async
    public void log(UUID docId, ActionType action, UUID userId, String ip, String userAgent) {
        AuditLog log = new AuditLog();
        log.setDocId(docId);
        log.setAction(action);
        log.setUserId(userId);
        log.setIpAddress(ip);
        log.setUserAgent(userAgent);
        log.setTimestamp(new Timestamp(System.currentTimeMillis()));

        auditLogRepository.save(log);
    }

    @Override
    public List<AuditLogResponse> getList() {
        return List.of();
    }
}
