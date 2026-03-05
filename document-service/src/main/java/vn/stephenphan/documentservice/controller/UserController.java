package vn.stephenphan.documentservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.dto.VersionHistoryResponse;
import vn.stephenphan.documentservice.service.IDocumentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/docs")
@AllArgsConstructor
public class UserController extends BaseController {

    private final IDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.uploadDocument(file, userId, ip, userAgent));
    }

    @GetMapping("/{docId}/download")
    public ResponseEntity<String> getDownloadLink(@PathVariable String docId,
                                                  HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.generateDownloadUrl(docId, userId, ip, userAgent));
    }

    @GetMapping("/{docId}/history")
    public ResponseEntity<List<VersionHistoryResponse>> getHistory(@PathVariable UUID docId,
                                                                   HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.getVersionHistory(docId, userId, ip, userAgent));
    }

    @GetMapping("/my-documents")
    public ResponseEntity<List<DocumentResponse>> getListDocument(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.getDocumentList(userId, ip, userAgent));
    }
}