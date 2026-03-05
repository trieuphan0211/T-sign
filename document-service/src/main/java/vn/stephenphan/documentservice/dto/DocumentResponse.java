package vn.stephenphan.documentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentResponse {
    private String docId;
    private String fileName;
    private String hashValue;
    private String downloadUrl;
}