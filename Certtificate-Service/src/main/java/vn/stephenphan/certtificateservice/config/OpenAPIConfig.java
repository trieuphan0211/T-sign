package vn.stephenphan.certtificateservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Thiết lập các server (Dev, Prod)
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Local Server")
                ))
                // Thông tin chung về API
                .info(new Info()
                        .title("Certificate Service Document")
                        .version("1.0.0")
                        .description("API document for SignHub")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
