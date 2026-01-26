package vn.stephenphan.certtificateservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.stephenphan.certtificateservice.config.EjbcaFeignConfig;

import java.util.Map;

@FeignClient(name = "ejbca-client", url = "${ejbca.url}", configuration = EjbcaFeignConfig.class)
public interface EjbcaClient {
    // API tạo End Entity (User trong EJBCA)
    @PostMapping("/v1/endentity/create")
    void createEndEntity(@RequestBody Map<String, Object> request);

    // API sinh Keystore (P12)
    @PostMapping("/v1/certificate/enrollkeystore")
    String generateKeystore(@RequestBody Map<String, Object> request);
}
