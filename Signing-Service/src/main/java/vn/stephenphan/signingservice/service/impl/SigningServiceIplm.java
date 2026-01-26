package vn.stephenphan.signingservice.service.impl;

import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.pkcs.PKCS10CertificationRequest;
import org.bouncycastle.pkcs.PKCS10CertificationRequestBuilder;
import org.bouncycastle.pkcs.jcajce.JcaPKCS10CertificationRequestBuilder;
import org.springframework.stereotype.Service;
import vn.stephenphan.signingservice.entity.CsrRequest;
import vn.stephenphan.signingservice.entity.HSMKeys;
import vn.stephenphan.signingservice.entity.KeyStatus;
import vn.stephenphan.signingservice.repository.CsrRequestRepository;
import vn.stephenphan.signingservice.repository.HsmKeysRepository;
import vn.stephenphan.signingservice.service.ISigningService;
import vn.stephenphan.signingservice.util.KeyUtil;

import javax.security.auth.x500.X500Principal;
import java.io.IOException;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.security.cert.Certificate;

@Service
public class SigningServiceIplm implements ISigningService {

    private final KeyStore hsmKeyStore;
    private final HsmKeysRepository hsmKeysRepository;
    private final CsrRequestRepository csrRequestRepository;

    public SigningServiceIplm(KeyStore hsmKeyStore, HsmKeysRepository hsmKeysRepository, CsrRequestRepository csrRequestRepository) {
        this.hsmKeyStore = hsmKeyStore;
        this.hsmKeysRepository = hsmKeysRepository;
        this.csrRequestRepository = csrRequestRepository;
    }


    @Override
    public HSMKeys generateKeyPair(String userId) {
        String alias = "key_" + userId + "_" + System.currentTimeMillis();
        try {
            // Kiểm tra xem alias đã tồn tại chưa
            if (hsmKeyStore.containsAlias(alias)) {
                throw new RuntimeException("Key alias đã tồn tại!");
            }
            // Create KeyPairGenerator using Provider of HSM
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA", hsmKeyStore.getProvider());
            keyGen.initialize(2048);
            KeyPair keyPair = keyGen.generateKeyPair();

            // 3. --- QUAN TRỌNG: TẠO DUMMY CERTIFICATE ĐỂ LƯU KHÓA ---
            // HSM yêu cầu Private Key phải gắn với 1 Cert thì mới cho lưu qua hàm setKeyEntry
            X509Certificate dummyCert = createDummyCertificate(keyPair);
            // 4. --- LƯU VÀO HSM (PERSIST) ---
            Certificate[] chain = new Certificate[]{dummyCert};
            // Password là null vì ta đã login vào KeyStore rồi
            hsmKeyStore.setKeyEntry(alias, keyPair.getPrivate(), null, chain);
            // 3. Convert Public Key sang PEM để lưu DB
            String pubKeyPem = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            // 4. Lưu Metadata vào DB
            HSMKeys entity = new HSMKeys();
            entity.setUserId(userId);
            entity.setKeyAlias(alias);
            entity.setAlgorithm("RSA");
            entity.setKeySize(2048);
            entity.setPublicKeyPem(pubKeyPem);
            entity.setStatus(KeyStatus.CREATED);
            entity.setCreatedAt(LocalDateTime.now());
            return hsmKeysRepository.save(entity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public CsrRequest generateCsr(HSMKeys hsmKey, String subjectDnString) {
        try {

//          2. Get Private Key and Public Key from HSM
            Key keyHandle = hsmKeyStore.getKey(hsmKey.getKeyAlias(), null);

            if (!(keyHandle instanceof PrivateKey)) {
                throw new RuntimeException("Private Key not found in HSM with alias: " + hsmKey.getKeyAlias());
            }
            PrivateKey privateKey = (PrivateKey) keyHandle;
            PublicKey publicKey = KeyUtil.getPublicKeyFromPem(hsmKey.getPublicKeyPem());

//          3. Prepare CSR information
            X500Principal subject = new X500Principal(subjectDnString);

//          4. Builder create CSR
            PKCS10CertificationRequestBuilder builder = new JcaPKCS10CertificationRequestBuilder(subject, publicKey);
//          5. IMPORTANT: Create  ContentSigner using Provider of HSM
            ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256withRSA")
                    .setProvider(hsmKeyStore.getProvider()) // Trỏ vào SunPKCS11
                    .build(privateKey); // Truyền "con trỏ" Private Key vào
//          6. Sign and create CSR
            PKCS10CertificationRequest csr = builder.build(contentSigner);

//          7. Convert to PEM String
            String csrPem = Base64.getEncoder().encodeToString(csr.getEncoded());
//          8. Save log in DB
            CsrRequest csrEntity = new CsrRequest();
            csrEntity.setKeyId(hsmKey.getId());
            csrEntity.setSubjectDn(subjectDnString);
            csrEntity.setCsrContent(csrPem);
            csrEntity.setCreateAt(LocalDateTime.now());
            return csrRequestRepository.save(csrEntity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    // 2. Chức năng Ký số (Hash Signing) - QUAN TRỌNG NHẤT
    public String signData(String alias, byte[] dataToSign) {
        try {
            // Lấy Private Key từ HSM bằng Alias
            Key key = hsmKeyStore.getKey(alias, null); // Password null vì đã login lúc load KeyStore

            if (!(key instanceof PrivateKey)) {
                throw new RuntimeException("Không tìm thấy Private Key với alias: " + alias);
            }

            // Khởi tạo đối tượng Signature
            Signature signature = Signature.getInstance("SHA256withRSA", hsmKeyStore.getProvider());

            // Kích hoạt chế độ ký bằng Private Key lấy từ HSM
            signature.initSign((PrivateKey) key);

            // Đưa dữ liệu vào
            signature.update(dataToSign);

            // Thực hiện ký
            byte[] signedBytes = signature.sign();

            return Base64.getEncoder().encodeToString(signedBytes);
        } catch (SignatureException | KeyStoreException | NoSuchAlgorithmException | UnrecoverableKeyException |
                 InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }
    /**
     * Hàm hỗ trợ tạo chứng chỉ tự ký (Self-signed) tạm thời
     * Mục đích: Chỉ để thỏa mãn yêu cầu của KeyStore.setKeyEntry
     */
    private X509Certificate createDummyCertificate(KeyPair keyPair) throws Exception {
        X500Principal subject = new X500Principal("CN=Temporary Key Storage Cert");

        // Thời hạn 10 năm (để tránh bị báo hết hạn)
        Date startDate = Date.from(Instant.now());
        Date endDate = Date.from(Instant.now().plusSeconds(365 * 24 * 3600 * 10));
        BigInteger serialNumber = BigInteger.valueOf(System.currentTimeMillis());

        // Builder tạo Cert
        JcaX509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(
                subject,                // Issuer (Tự mình cấp cho mình)
                serialNumber,           // Serial
                startDate,              // Not Before
                endDate,                // Not After
                subject,                // Subject
                keyPair.getPublic()     // Public Key cần chứng thực
        );

        // Ký vào Cert này bằng chính Private Key vừa sinh (trong HSM)
        // Lưu ý: Phải setProvider là HSM để nó biết dùng Private Key trong đó ký
        ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256withRSA")
                .setProvider(hsmKeyStore.getProvider())
                .build(keyPair.getPrivate());

        // Convert sang X509Certificate object
        return new JcaX509CertificateConverter()
                .getCertificate(certBuilder.build(contentSigner));
    }
}
