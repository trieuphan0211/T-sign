package vn.stephenphan.signingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.stephenphan.signingservice.entity.HSMKeys;

@Repository
public interface HsmKeysRepository  extends JpaRepository<HSMKeys, Long> {
}
