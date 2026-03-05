package vn.stephenphan.documentservice.service.impl;

import io.minio.*;
import io.minio.http.Method;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.dto.VersionHistoryResponse;
import vn.stephenphan.documentservice.entity.ActionType;
import vn.stephenphan.documentservice.entity.Document;
import vn.stephenphan.documentservice.entity.DocumentStatus;
import vn.stephenphan.documentservice.entity.DocumentVersion;
import vn.stephenphan.documentservice.repository.DocumentRepository;
import vn.stephenphan.documentservice.repository.DocumentVersionRepository;
import vn.stephenphan.documentservice.service.IAuditLogService;
import vn.stephenphan.documentservice.service.IDocumentService;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
public class DocumentService implements IDocumentService {
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final MinioClient minioClient;
    private final IAuditLogService auditLogService;

    @Value("${minio.bucket-name}")
    private String bucketName;

    private String buildStoragePath(String ownerId,
                                    String docId,
                                    Integer version,
                                    String originalName) {
        LocalDate now = LocalDate.now();
        // Loại bỏ ký tự đặc biệt và khoảng trắng trong tên file
        String sanitizedName = originalName.replaceAll("[^a-zA-Z0-21. -]", "_").replaceAll("\\s+", "_");

        return String.format("signhub/users/%s/%d/%02d/%02d/%s/v%d_%s",
                ownerId,
                now.getYear(),
                now.getMonthValue(),
                now.getDayOfMonth(),
                docId,
                version,
                sanitizedName);
    }

    @Override
    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file,
                                           String ownerId,
                                           String ip,
                                           String userAgent) {
        String storagePath = null; // Khai báo ngoài để catch có thể truy cập
        try {
            // 1. Calculate SHA-256 Hash
            byte[] content = file.getBytes();
            String hash = DigestUtils.sha256Hex(content);
            // Tạo trước Document ID để dùng cho đường dẫn lưu trữ
            UUID docId = UUID.randomUUID();

            // 2. Save file on MinIO
            storagePath = buildStoragePath(ownerId, docId.toString(), 1, Objects.requireNonNull(file.getOriginalFilename()));
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(storagePath)
                            .stream(new ByteArrayInputStream(content), content.length, -1)
                            .contentType(file.getContentType())
                            .build()
            );

//          3. Save metadata to PostgreSQL
            Document doc = new Document();
            doc.setId(docId); // Dùng ID đã tạo ở bước 1
            doc.setFileName(file.getOriginalFilename());
            doc.setStoragePath(storagePath);
            doc.setFileSize(file.getSize());
            doc.setMineType(file.getContentType());
            doc.setChecksumSha256(hash);
            doc.setOwnerId(UUID.fromString(ownerId));
            doc = documentRepository.save(doc);

//          4. Save version ORIGIN
            DocumentVersion v1 = new DocumentVersion();
            v1.setDocument(doc);
            v1.setVersionNumber(1);
            v1.setHashValue(hash);
            v1.setStoragePath(storagePath);
            v1.setStatus(DocumentStatus.ORIGINAL);
            versionRepository.save(v1);

            auditLogService.log(doc.getId(), ActionType.UPLOAD, UUID.fromString(ownerId), ip, userAgent);
            return new DocumentResponse(doc.getId().toString(), doc.getFileName(), hash, null);
        } catch (Exception e) {
            if (storagePath != null) {
                try {
                    log.warn("Database transaction failed. Cleaning up file from MinIO: {}", storagePath);
                    minioClient.removeObject(
                            RemoveObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(storagePath)
                                    .build()
                    );
                } catch (Exception minioEx) {
                    log.error("CRITICAL: Failed to cleanup file after DB error: {}", storagePath, minioEx);
                }
            }
            throw new RuntimeException("Lỗi hệ thống khi lưu trữ tài liệu: " + e.getMessage(), e);
        }
    }

    @Override
    public List<DocumentResponse> getDocumentList(String ownerId,
                                                  String ip,
                                                  String userAgent) {
        auditLogService.log(null, ActionType.VIEW_LIST, UUID.fromString(ownerId), ip, userAgent);
        return documentRepository.findAllByOwnerId(UUID.fromString(ownerId))
                .stream()
                .map(doc -> {
                    String hash = versionRepository.findFirstByDocument_IdOrderByVersionNumberDesc(doc.getId())
                            .map(DocumentVersion::getHashValue)
                            .orElseThrow(() -> new RuntimeException("Document not found"));

                    return new DocumentResponse(
                            doc.getId().toString(),
                            doc.getFileName(),
                            hash,
                            null
                    );
                }).collect(Collectors.toList());
    }

    @Override
    public String generateDownloadUrl(String docId,
                                      String ownerId,
                                      String ip,
                                      String userAgent) {
        try {
            Document doc = documentRepository.findById(UUID.fromString(docId))
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            if (!doc.getOwnerId().toString().equals(ownerId)) {
                throw new RuntimeException("Bạn không có quyền truy cập tài liệu này");
            }
            auditLogService.log(doc.getId(), ActionType.DOWNLOAD, UUID.fromString(ownerId), ip, userAgent);
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(doc.getStoragePath())
                    .expiry(15, TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getLatestHash(UUID docId,
                                String ownerId,
                                String ip,
                                String userAgent) {
        auditLogService.log(docId, ActionType.VIEW_HASH, UUID.fromString(ownerId), ip, userAgent);
        return versionRepository.findFirstByDocument_IdOrderByVersionNumberDesc(docId)
                .map(DocumentVersion::getHashValue)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }


    @Override
    @Transactional
    public DocumentResponse updateNewVersionDocument(UUID docId,
                                                     MultipartFile file,
                                                     DocumentStatus status,
                                                     String ownerId,
                                                     String ip,
                                                     String userAgent) {
        try {
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài liệu gốc"));

            DocumentVersion latestVersion = versionRepository.findFirstByDocument_IdOrderByVersionNumberDesc(docId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên bản gốc"));
            int nextVersionNumber = latestVersion.getVersionNumber() + 1;
            // 3. Tính toán Hash cho phiên bản mới
            byte[] content = file.getBytes();
            String newHash = DigestUtils.sha256Hex(content);
            // 4. Xây dựng đường dẫn và Upload MinIO
            String newStoragePath = buildStoragePath(
                    doc.getOwnerId().toString(),
                    docId.toString(),
                    nextVersionNumber,
                    Objects.requireNonNull(file.getOriginalFilename())
            );
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newStoragePath)
                            .stream(new ByteArrayInputStream(content), content.length, -1)
                            .contentType(file.getContentType())
                            .build()
            );
            // 5. Lưu bản ghi phiên bản mới vào DB
            DocumentVersion nextVersion = new DocumentVersion();
            nextVersion.setDocument(doc);
            nextVersion.setVersionNumber(nextVersionNumber);
            nextVersion.setHashValue(newHash);
            nextVersion.setStoragePath(newStoragePath);
            // Trạng thái: Nếu là lần ký cuối cùng có thể set là COMPLETED
            nextVersion.setStatus(status);
            versionRepository.save(nextVersion);
            // 6. Cập nhật đường dẫn mới nhất vào bảng Document chính
            doc.setStoragePath(newStoragePath);
            documentRepository.save(doc);
            auditLogService.log(docId, ActionType.UPDATE_VERSION, UUID.fromString(ownerId), ip, userAgent);
            return new DocumentResponse(docId.toString(), doc.getFileName(), newHash, null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @Override
    public List<VersionHistoryResponse> getVersionHistory(UUID docId,
                                                          String ownerId,
                                                          String ip,
                                                          String userAgent) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Tài liệu không tồn tại"));
        if (!doc.getOwnerId().toString().equals(ownerId)) {
            throw new RuntimeException("Bạn không có quyền truy cập tài liệu này");
        }
        // 2. Lấy danh sách phiên bản
        List<DocumentVersion> versions = versionRepository.findAllByDocument_IdOrderByVersionNumberDesc(docId);
        auditLogService.log(docId, ActionType.VIEW_VERSION, UUID.fromString(ownerId), ip, userAgent);
        // 3. Chuyển đổi sang DTO và tạo link download cho từng bản
        return versions.stream().map(v -> {
            String url = "";
            try {
                url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(v.getStoragePath())
                        .expiry(15, TimeUnit.MINUTES)
                        .build());

            } catch (Exception e) {
                log.error("Không thể tạo link download cho version {}", v.getVersionNumber());
            }
            return VersionHistoryResponse.builder()
                    .versionNumber(v.getVersionNumber())
                    .hashValue(v.getHashValue())
                    .status(v.getStatus())
                    .createdAt(v.getCreatedAt())
                    .downloadUrl(url)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public Boolean verifyLatestHash(UUID docId,
                                    String hashToVerify,
                                    String ownerId,
                                    String ip,
                                    String userAgent) {
        auditLogService.log(docId, ActionType.VIEW_LIST, UUID.fromString(ownerId), ip, userAgent);
        return versionRepository.findFirstByDocument_IdOrderByVersionNumberDesc(docId)
                .map(latestVersion -> {
                    // 2. So sánh mã Hash (không phân biệt hoa thường)
                    boolean isValid = latestVersion.getHashValue().equalsIgnoreCase(hashToVerify);
                    if (!isValid) {
                        log.warn("CẢNH BÁO: Hash không khớp cho tài liệu {}! Expected: {}, Received: {}",
                                docId, latestVersion.getHashValue(), hashToVerify);
                    }
                    return isValid;
                }).orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu phiên bản cho tài liệu này"));
    }
}
