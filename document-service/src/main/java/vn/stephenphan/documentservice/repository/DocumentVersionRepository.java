package vn.stephenphan.documentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.stephenphan.documentservice.entity.DocumentVersion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {
    Optional<DocumentVersion> findFirstByDocument_IdOrderByVersionNumberDesc(UUID uuid);

    List<DocumentVersion> findAllByDocument_IdOrderByVersionNumberDesc(UUID docId);
}
