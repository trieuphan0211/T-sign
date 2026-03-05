package vn.stephenphan.documentservice.dto;

import lombok.Builder;
import lombok.Data;
import vn.stephenphan.documentservice.entity.DocumentStatus;

import java.sql.Timestamp;

@Data
@Builder
public class VersionHistoryResponse {
    private Integer versionNumber;
    private String hashValue;
    private DocumentStatus status;
    private Timestamp createdAt;
    private String downloadUrl; // Link tải riêng cho từng phiên bản
}
