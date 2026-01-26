package vn.stephenphan.signingservice.service;

import vn.stephenphan.signingservice.entity.CsrRequest;
import vn.stephenphan.signingservice.entity.HSMKeys;

public interface ISigningService {

    HSMKeys generateKeyPair(String userId);
    CsrRequest generateCsr(HSMKeys hsmKey, String subjectDnString);
    String signData(String alias, byte[] dataToSign);
}
