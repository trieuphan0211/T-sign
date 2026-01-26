package vn.stephenphan.certtificateservice.config;

import feign.Client;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.DefaultClientTlsStrategy;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.TlsSocketStrategy;
import org.apache.hc.core5.ssl.SSLContexts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.net.ssl.SSLContext;
import java.security.KeyStore;

@Configuration
public class EjbcaFeignConfig {
    @Value("${ejbca.keystore-path}")
    private String keyStorePath;

    @Value("${ejbca.keystore-password}")
    private String keyStorePassword;

    @Bean
    public Client feignClient() throws Exception{
        // 1. Load Keystore (SuperAdmin P12)
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new ClassPathResource(keyStorePath).getInputStream(),keyStorePassword.toCharArray());
        // 2. Build SSL Context (Trust all - chỉ dùng cho DEV, Prod cần Truststore xịn)
        SSLContext sslContext = SSLContexts.custom()
                .loadKeyMaterial(keyStore, keyStorePassword.toCharArray())
                .loadTrustMaterial(null,(chain,authType)-> true)
                .build();

        // 3. Create the TLS Strategy
        TlsSocketStrategy tlsStrategy = new DefaultClientTlsStrategy(sslContext, NoopHostnameVerifier.INSTANCE);
        // 4. Build the Connection Manager with the TLS Strategy
        HttpClientConnectionManager connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setTlsSocketStrategy(tlsStrategy)
                .build();
        CloseableHttpClient client = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .build();
        return new feign.hc5.ApacheHttp5Client(client);
    }

}
