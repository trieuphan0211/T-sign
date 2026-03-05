package vn.stephenphan.documentservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.entity.DocumentStatus;
import vn.stephenphan.documentservice.service.IDocumentService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/internal/docs")
@AllArgsConstructor
public class InternalController extends BaseController {
    private final IDocumentService documentService;

    @GetMapping("/{docId}/hash")
    public ResponseEntity<String> getLatestHash(@PathVariable UUID docId, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.getLatestHash(docId, userId, ip, userAgent));
    }

    @PutMapping("/{docId}/signed-version")
    public ResponseEntity<DocumentResponse> updateSignedVersion(@PathVariable UUID docId,
                                                                @RequestParam("file") MultipartFile file,
                                                                @RequestParam(value = "status", required = false) DocumentStatus status,
                                                                HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.updateNewVersionDocument(docId, file, status, userId, ip, userAgent));
    }

    @PostMapping("/{docId}/verify-hash")
    public ResponseEntity<Boolean> verifyHash(@PathVariable UUID docId,
                                              @RequestBody Map<String, String> body,
                                              HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String userId = getUserId();
        return ResponseEntity.ok(documentService.verifyLatestHash(docId, body.get("hash"), userId, ip, userAgent));
    }
}
