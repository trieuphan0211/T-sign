package vn.stephenphan.certtificateservice;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignClient;

import java.util.TimeZone;

@SpringBootApplication
@EnableFeignClients
public class CerttificateServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CerttificateServiceApplication.class, args);
    }

}
