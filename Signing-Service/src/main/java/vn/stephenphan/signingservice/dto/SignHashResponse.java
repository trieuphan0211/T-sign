package vn.stephenphan.signingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class SignHashResponse {
    private String signature; // Chữ ký (Base64)
    private List<String> certificateChain; // Chuỗi chứng thư số (Base64) để client ghép vào file
}
