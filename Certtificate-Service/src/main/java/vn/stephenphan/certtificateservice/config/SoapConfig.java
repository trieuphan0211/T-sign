package vn.stephenphan.certtificateservice.config;

import lombok.extern.log4j.Log4j2;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.DefaultClientTlsStrategy;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.client5.http.ssl.TlsSocketStrategy;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.SSLContexts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.transport.http.ClientHttpRequestMessageSender;
import org.springframework.ws.transport.http.HttpComponents5MessageSender;

import javax.net.ssl.SSLContext;
import java.io.InputStream;
import java.security.KeyStore;

@Configuration
@Log4j2
public class SoapConfig {
    @Value("${ejbca.keystore-path}")
    private String keyStorePath;

    @Value("${ejbca.keystore-password}")
    private String keyStorePassword;
    
    @Value("${ejbca.soap-url:https://localhost/ejbca/ejbcaws/ejbcaws}")
    private String ejbcaSoapUrl;
    @Bean
    public Jaxb2Marshaller marshaller() {
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        // Package này phải trùng với generatePackage trong pom.xml
        marshaller.setContextPath("vn.stephenphan.ejbca.soap.gen");
        return marshaller;
    }
    @Bean
    public WebServiceTemplate webServiceTemplate(Jaxb2Marshaller marshaller) throws Exception {
        WebServiceTemplate template = new WebServiceTemplate();
        template.setMarshaller(marshaller);
        template.setUnmarshaller(marshaller);
        template.setDefaultUri(ejbcaSoapUrl); // URL EJBCA SOAP API

        // Cấu hình SSL (Client Certificate)
        template.setMessageSender(httpComponentsMessageSender());

        return template;
    }
    private ClientHttpRequestMessageSender httpComponentsMessageSender() throws Exception {
        // 1. Load Keystore (SuperAdmin P12)
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new ClassPathResource(keyStorePath).getInputStream(),keyStorePassword.toCharArray());
        log.info("KeyStore loaded: {}", keyStore);
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

        // 3. KHỞI TẠO ĐÚNG CÁCH
        // Truyền trực tiếp 'client' vào constructor
        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory(client);

        return new ClientHttpRequestMessageSender(requestFactory);
    }
}
