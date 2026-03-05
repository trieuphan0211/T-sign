package vn.stephenphan.documentservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.stephenphan.documentservice.entity.AuditLog;

import java.awt.print.Pageable;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog,Long> {
    Page<AuditLog> findAllByDocIdOrderByTimestampDesc(UUID docId, Pageable pageable);
}
