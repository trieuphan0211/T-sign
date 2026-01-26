package vn.stephenphan.signingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.security.KeyStore;
import java.security.Provider;
import java.security.Security;

@Configuration
public class HsmConfig {

    @Value("${hsm.config.path}")
    private String pkcs11ConfigPath;

    @Bean
    public KeyStore keyStore() {
        try {
            System.out.println("--> Loading PKCS#11 Config from: " + pkcs11ConfigPath);

            Provider provider = Security.getProvider("SunPKCS11");

            // Nếu chưa có provider trong Security list, khởi tạo thủ công
            if (provider == null) {
                System.out.println("--> SunPKCS11 provider not found. Instantiating via reflection (Java 9+ style)...");
                try {
                    // 1. Tìm class SunPKCS11
                    Class<?> clazz = Class.forName("sun.security.pkcs11.SunPKCS11");

                    // 2. Lấy constructor KHÔNG tham số (thay đổi quan trọng so với code cũ)
                    Constructor<?> constructor = clazz.getConstructor();
                    Provider rawProvider = (Provider) constructor.newInstance();

                    // 3. Cấu hình provider bằng phương thức configure()
                    // Lưu ý: configure() trả về một Provider mới hoặc chính nó đã được cấu hình
                    provider = rawProvider.configure(pkcs11ConfigPath);

                } catch (Exception ex) {
                    // Fallback cho một số phiên bản Java cũ hơn hoặc đặc biệt (ít khi xảy ra trên Java 17 chuẩn)
                    System.out.println("--> Failed to init via no-arg constructor, trying String constructor...");
                    Class<?> clazz = Class.forName("sun.security.pkcs11.SunPKCS11");
                    Constructor<?> constructor = clazz.getConstructor(String.class);
                    provider = (Provider) constructor.newInstance(pkcs11ConfigPath);
                }

                // Đăng ký provider vào hệ thống
                Security.addProvider(provider);
            } else {
                // Nếu đã có provider (hiếm khi xảy ra nếu chưa config), configure lại nó
                provider = provider.configure(pkcs11ConfigPath);
            }

            System.out.println("--> Load complete Provider: " + provider.getName());

            // 4. Khởi tạo KeyStore
            KeyStore keyStore = KeyStore.getInstance("PKCS11", provider);

            // 5. Login HSM
            // TODO: Move PIN to application.properties
            String pin = "1234";
            keyStore.load(null, pin.toCharArray());

            System.out.println("--> Đã login HSM thành công. Số lượng key: " + keyStore.size());
            return keyStore;

        } catch (Exception e) {
            System.err.println("Error initializing HSM KeyStore: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Could not initialize HSM KeyStore", e);
        }
    }
}