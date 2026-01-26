FROM eclipse-temurin:17-jre-jammy

# 1. Cài đặt SoftHSM2
RUN apt-get update && \
    apt-get install -y softhsm2 opensc && \
    rm -rf /var/lib/apt/lists/*

# 2. Tạo thư mục tokens
RUN mkdir -p /var/lib/softhsm/tokens

WORKDIR /app

# 3. Copy JAR file
COPY build/libs/Signing-Service-0.0.1-SNAPSHOT.jar Signing-Service.jar
 # 4. Copy file cấu hình PKCS11 (nếu bạn để ngoài JAR, xem bước 2 bên dưới)
COPY src/main/resources/pkcs11-docker.cfg /app/pkcs11.cfg
# 4. Copy Entrypoint Script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Lưu ý: Không cần COPY pkcs11.cfg nữa vì script sẽ tự tạo file này.
# Và KHÔNG RUN init-token ở đây để tránh lệch Slot ID lúc build.

# 5. Set Entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["java", "-jar", "Signing-Service.jar"]