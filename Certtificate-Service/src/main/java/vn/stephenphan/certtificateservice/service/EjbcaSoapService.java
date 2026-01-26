package vn.stephenphan.certtificateservice.service;

import jakarta.xml.bind.JAXBElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;
import vn.stephenphan.ejbca.soap.gen.EditUser;
import vn.stephenphan.ejbca.soap.gen.ObjectFactory;
import vn.stephenphan.ejbca.soap.gen.UserDataVOWS;

@Service
public class EjbcaSoapService {

    @Autowired
    private WebServiceTemplate webServiceTemplate;

    public void createEndEntity(String username, String password, String cn, String email) {
        ObjectFactory factory = new ObjectFactory();

        // 1. Tạo đối tượng UserData (từ class sinh ra)
        UserDataVOWS user = new UserDataVOWS();
        user.setUsername(username);
        user.setPassword(password);
        user.setClearPwd(true);
        user.setSubjectDN("CN=" + cn+",O=Mobile-ID,C=Vietnam" );
        user.setEmail(email);

        // Các config bắt buộc khác (phải trùng với Profile trên EJBCA)
        user.setCaName("SubCA");
        user.setEndEntityProfileName("User_EE_Profile"); // Hoặc profile bạn tạo
        user.setCertificateProfileName("UserSigning_Profile");
        user.setStatus(10); // 10 = NEW (Sẵn sàng để in certificate)
        user.setTokenType("P12"); // Hoặc P12 file

        // 2. Tạo Request Wrapper
        EditUser request = new EditUser();
        request.setArg0(user);
        // 3. Gọi SOAP API
        // 3. QUAN TRỌNG: Wrap vào JAXBElement bằng ObjectFactory
        // Đây là bước fix lỗi "JAXB marshalling exception"
        JAXBElement<EditUser> requestPayload = factory.createEditUser(request);

        // 4. Gửi Request
        // EditUser không trả về dữ liệu gì đặc biệt, nếu không lỗi là thành công
        webServiceTemplate.marshalSendAndReceive(requestPayload);

        System.out.println("✅ Đã tạo user thành công: " + username);
    }
}
