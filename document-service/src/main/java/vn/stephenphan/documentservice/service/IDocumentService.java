package vn.stephenphan.documentservice.service;

import org.springframework.web.multipart.MultipartFile;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.dto.VersionHistoryResponse;
import vn.stephenphan.documentservice.entity.DocumentStatus;
import vn.stephenphan.documentservice.entity.DocumentVersion;

import java.util.List;
import java.util.UUID;

public interface IDocumentService {


    DocumentResponse uploadDocument(MultipartFile file, String ownerId,String ip, String userAgent);

    List<DocumentResponse> getDocumentList(String ownerId,String ip, String userAgent);

    String generateDownloadUrl(String docId, String ownerId,String ip, String userAgent);

    String getLatestHash(UUID docId, String ownerId,String ip, String userAgent);

    DocumentResponse updateNewVersionDocument(UUID docId, MultipartFile file, DocumentStatus status, String ownerId, String ip, String userAgent);

    List<VersionHistoryResponse> getVersionHistory(UUID docId, String ownerId, String ip, String userAgent);

    Boolean verifyLatestHash(UUID docId, String hashToVerify, String ownerId, String ip, String userAgent);
}
