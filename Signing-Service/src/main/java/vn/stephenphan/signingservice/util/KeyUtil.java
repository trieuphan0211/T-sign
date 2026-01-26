package vn.stephenphan.signingservice.util;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;


public class KeyUtil {
    public static PublicKey getPublicKeyFromPem(String pem) throws Exception {
        // Nếu chuỗi PEM có header/footer (-----BEGIN...), hãy remove nó đi chỉ lấy phần Base64
        String cleanPem = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", ""); // Xóa xuống dòng/khoảng trắng

        byte[] encoded = Base64.getDecoder().decode(cleanPem);

        // RSA Key Spec
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(keySpec);
    }
}
