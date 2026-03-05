package vn.stephenphan.documentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.stephenphan.documentservice.dto.DocumentResponse;
import vn.stephenphan.documentservice.entity.Document;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findAllByOwnerId(UUID ownerId);
}
