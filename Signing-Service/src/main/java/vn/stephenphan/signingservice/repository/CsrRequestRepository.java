package vn.stephenphan.signingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.stephenphan.signingservice.entity.CsrRequest;

@Repository
public interface CsrRequestRepository extends JpaRepository<CsrRequest,Long> {
}
