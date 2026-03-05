
---
name: certificate-service
description: Spring Boot PKI Certificate Management service with Keycloak OIDC integration and EJBCA. Use when working with identity-driven certificate lifecycle management, JWT authentication, Keycloak integration, EJBCA SOAP/REST API, mTLS client certificate authentication, or Spring Security OAuth2 resource server configuration.
---

# Certificate Service (Keycloak + EJBCA Integration)

Spring Boot middleware service that provides identity-driven PKI certificate management through Keycloak OIDC authentication and EJBCA Community Edition integration.

## Architecture Overview

```
┌─────────────┐     JWT Bearer Token      ┌──────────────────────┐
│   Client    │ ────────────────────────► │  Certificate Service │
│  (Keycloak  │                           │   (Spring Boot)      │
│   User)     │ ◄──────────────────────── │                      │
└─────────────┘    Certificate (PEM/P12)  └──────────────────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────────────────┐
                    │                                │                                │
                    ▼                                ▼                                ▼
            ┌──────────────┐              ┌──────────────────┐              ┌──────────────┐
            │   Keycloak   │              │  EJBCA (SOAP)    │              │ EJBCA (REST) │
            │  (OIDC/JWT)  │              │  - Create User   │              │ - Issue P12  │
            │              │              │  - PKCS#10 CSR   │              │              │
            └──────────────┘              │  - Revoke        │              └──────────────┘
                                          │  - Get Cert      │
                                          └──────────────────┘
```

## Project Structure

```
src/main/java/vn/stephenphan/certtificateservice/
├── controller/
│   └── CertificateController.java    # REST API with JWT security
├── service/
│   ├── CertificateService.java       # Business logic
│   ├── EjbcaSoapService.java         # EJBCA SOAP integration
│   └── UserSynchronizationService.java # Keycloak-EJBCA sync
├── client/
│   └── EjbcaClient.java              # Feign REST client
├── config/
│   ├── SoapConfig.java               # WebServiceTemplate + mTLS
│   ├── EjbcaFeignConfig.java         # Feign mTLS config
│   ├── OpenAPIConfig.java            # Swagger/OpenAPI + JWT auth
│   └── SecurityConfig.java           # Spring Security OAuth2
├── security/
│   ├── JwtTokenExtractor.java        # JWT claim extraction
│   └── KeycloakUserPrincipal.java    # User identity model
├── dto/
│   ├── CsrEnrollRequest.java         # CSR enrollment request
│   ├── CertificateResponse.java      # Certificate response
│   ├── RevokeRequest.java            # Revocation request
│   ├── RenewRequest.java             # Renewal request
│   ├── CertificateStatusResponse.java # Status response
│   └── RevocationReason.java         # RFC 5280 revocation reasons
├── entity/
│   ├── PublicCertificate.java        # Certificate entity
│   ├── CertificateLog.java           # Audit logs
│   └── CertStatus.java               # Status enum
├── repository/
│   ├── CertificateLogRepository.java
│   └── PublicCertificateRepository.java
└── exception/
    └── GlobalExceptionHandler.java
```

## API Endpoints (JWT Protected)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/certs/enroll` | signer_role | Enroll certificate using CSR |
| POST | `/api/v1/certs/revoke` | admin_role, signer_role | Revoke certificate |
| GET | `/api/v1/certs/status/me` | Authenticated | Get own certificate status |
| GET | `/api/v1/certs/status/{userId}` | viewer_role+ | Check user status |
| GET | `/api/v1/certs/{serial}` | viewer_role+ | Get certificate details |
| POST | `/api/v1/certs/renew` | signer_role | Renew certificate |
| POST | `/api/v1/certs/issue-p12` | signer_role | Legacy P12 issuance |
| POST | `/api/v1/certs/sync-user` | signer_role | Manual user sync with EJBCA |

### Public Endpoints

| Endpoint | Description |
|----------|-------------|
| `/swagger-ui.html` | Swagger UI |
| `/v3/api-docs` | OpenAPI JSON |
| `/api/v1/health` | EJBCA health check (REST + SOAP connectivity) |
| `/api/v1/health/ping` | Simple ping for load balancers |

## Keycloak Configuration

### application.yml

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/tsign-realm
          jwk-set-uri: http://localhost:8080/realms/tsign-realm/protocol/openid-connect/certs

keycloak:
  auth-server-url: http://localhost:8080
  realm: tsign-realm
  resource: certificate-service

pki:
  roles:
    signer: signer_role
    admin: admin_role
    viewer: viewer_role
```

### Required Keycloak Roles

- **signer_role**: Can enroll, renew certificates, and use Soft HSM for signing
- **admin_role**: Can revoke certificates and manage users
- **viewer_role**: Can view certificate details and status

### JWT Token Structure

The service expects Keycloak JWT tokens with:
- `sub`: User unique identifier
- `preferred_username`: Username for EJBCA End Entity
- `email`: User email
- `given_name` / `family_name`: Full name for certificate CN
- `realm_access.roles`: Keycloak realm roles

## Identity-Driven Certificate Enrollment Flow

```
1. User authenticates with Keycloak
   └─► Receives JWT Access Token

2. Client sends CSR to /api/v1/certs/enroll
   └─► Includes JWT Bearer token in Authorization header

3. Spring Security validates JWT
   └─► Extracts roles, checks signer_role

4. JwtTokenExtractor extracts identity
   └─► username, email, fullName from JWT claims

5. UserSynchronizationService.syncUser()
   ├─► Check if user exists in EJBCA
   ├─► If not, create End Entity via SOAP
   └─► Map Keycloak ID to EJBCA username

6. CertificateService.enrollWithCsr()
   ├─► Submit PKCS#10 CSR to EJBCA via SOAP
   ├─► Parse X.509 certificate response
   └─► Return PEM-encoded certificate
```

## Core Components

### 1. JWT Token Extractor (`JwtTokenExtractor`)

Extracts user identity from Keycloak JWT:

```java
// Get current authenticated user
KeycloakUserPrincipal user = jwtTokenExtractor.getUserPrincipal()
    .orElseThrow(() -> new RuntimeException("No user in context"));

// Access user properties
String username = user.getUsername();           // Keycloak preferred_username
String ejbcaUsername = user.getEjbcaSafeUsername(); // Sanitized for EJBCA
String email = user.getEmail();
String commonName = user.getCommonName();       // Full name for cert CN
List<String> roles = user.getRealmRoles();
```

### 2. User Synchronization (`UserSynchronizationService`)

Check-and-create workflow:

```java
// Synchronize Keycloak user with EJBCA
public boolean synchronizeUser(KeycloakUserPrincipal user, String password) {
    String ejbcaUsername = user.getEjbcaSafeUsername();
    
    // Check if user exists in EJBCA
    if (userExistsInEjbca(ejbcaUsername)) {
        return true;
    }
    
    // Create new End Entity in EJBCA
    createEjbcaEndEntity(user, password);
    return true;
}
```

### 3. Security Configuration (`SecurityConfig`)

Role-based access control:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/certs/enroll").hasRole("signer_role")
    .requestMatchers("/api/v1/certs/revoke").hasAnyRole("admin_role", "signer_role")
    .requestMatchers("/api/v1/certs/**").hasAnyRole("viewer_role", "signer_role", "admin_role")
);
```

## EJBCA Integration

### Dual API Usage

| Operation | API | Method |
|-----------|-----|--------|
| Create End Entity | SOAP | `EditUser` |
| PKCS#10 CSR | SOAP | `pkcs10Request` |
| Revoke Certificate | SOAP | `revokeCert` |
| Check Revocation | SOAP | `checkRevokationStatus` |
| Get Certificate | SOAP | `getCertificate` |
| Find Certificates | SOAP | `findCerts` |
| Issue P12 | REST | `/v1/certificate/enrollkeystore` |

### EJBCA Configuration

```yaml
ejbca:
  # REST API URL (port 8444)
  url: https://your-ejbca-server:8444/ejbca/ejbca-rest-api
  # SOAP API URL (port 8443)  
  soap-url: https://your-ejbca-server:8443/ejbca/ejbcaws/ejbcaws
  keystore-path: SuperAdmin.p12
  keystore-password: your-password
```

**Default EJBCA Ports:**
- 8442: HTTP (non-secure)
- 8443: HTTPS SOAP Web Services
- 8444: HTTPS REST API

### mTLS Configuration

Both SOAP (`SoapConfig`) and REST (`EjbcaFeignConfig`) use:
- SuperAdmin P12 keystore for client authentication
- Trust-all strategy for development (use proper truststore in production)

## Testing with JWT

### Using Swagger UI

1. Obtain JWT token from Keycloak:
```bash
curl -X POST http://localhost:8080/realms/tsign-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=certificate-service" \
  -d "username=testuser" \
  -d "password=testpass"
```

2. In Swagger UI, click "Authorize" and enter:
```
Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4...
```

3. Test protected endpoints

### Using curl

```bash
# Enroll certificate with CSR
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "certPassword123",
    "csrContent": "-----BEGIN CERTIFICATE REQUEST-----\nMIIC..."
  }'

# Check own certificate status
curl -X GET http://localhost:8082/api/v1/certs/status/me \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Key Dependencies

```groovy
// Spring Security with OAuth2 Resource Server
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'

// OpenAPI with JWT support
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.4'

// SOAP/Web Services
implementation 'org.springframework.boot:spring-boot-starter-web-services'
implementation 'org.springframework:spring-oxm'

// Feign Client
implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
implementation 'org.apache.httpcomponents.client5:httpclient5'
implementation 'io.github.openfeign:feign-hc5'
```

## Common Tasks

### Adding New Role-Based Endpoint

```java
@PreAuthorize("hasRole('admin_role')")
@PostMapping("/admin-only")
public ResponseEntity<String> adminOnly() {
    // Only users with admin_role can access
}
```

### Extracting Custom JWT Claims

```java
public Optional<String> getCustomClaim(String claimName) {
    return getCurrentJwt().map(jwt -> jwt.getClaimAsString(claimName));
}
```

### Manual User Synchronization

```java
// Inject services
@Autowired private UserSynchronizationService syncService;
@Autowired private JwtTokenExtractor jwtExtractor;

// In controller method
KeycloakUserPrincipal user = jwtExtractor.getUserPrincipal().orElseThrow();
boolean synced = syncService.synchronizeUser(user, "initialPassword");
```

### EJBCA Health Check

Check EJBCA connectivity:

```bash
# Check both REST and SOAP connectivity
curl http://localhost:8082/api/v1/health

# Response:
# {
#   "application": "Certtificate-Service",
#   "timestamp": "2024-01-15T10:30:00",
#   "status": "UP",
#   "ejbca": {
#     "rest": {"healthy": true, "status": "UP", "httpStatus": 200},
#     "soap": {"healthy": true, "status": "UP", "ejbcaVersion": "EJBCA 8.2.0.1"},
#     "restUrl": "https://100.115.112.37:8444/ejbca/ejbca-rest-api",
#     "soapUrl": "https://100.115.112.37:8443/ejbca/ejbcaws/ejbcaws",
#     "status": "UP"
#   }
# }
```

## Troubleshooting

### JWT Validation Fails

Check `issuer-uri` matches Keycloak realm URL exactly.

### Role Access Denied (403)

Verify roles are extracted correctly in `SecurityConfig.extractAuthorities()`. 
Spring Security expects roles prefixed with `ROLE_`.

### EJBCA User Creation Fails

Ensure EJBCA profiles exist: `SubCA`, `User_EE_Profile`, `UserSigning_Profile`.

### Cannot Access Swagger UI

Check `SecurityConfig` permits Swagger paths:
```java
.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
```

### "Connection refused" to EJBCA

**Error:** `Connect to https://localhost:443 failed: Connection refused`

**Cause:** SOAP URL is misconfigured or EJBCA is not running at the specified address.

**Solution:**
1. Check `application.yml` EJBCA URLs:
```yaml
ejbca:
  url: https://your-ejbca-server:8444/ejbca/ejbca-rest-api  # REST API
  soap-url: https://your-ejbca-server:8443/ejbca/ejbcaws/ejbcaws  # SOAP API
```

2. Default EJBCA ports:
   - 8442: HTTP (non-secure)
   - 8443: HTTPS SOAP Web Services
   - 8444: HTTPS REST API

3. Test connectivity:
```bash
# Test SOAP endpoint
curl -k https://your-ejbca-server:8443/ejbca/ejbcaws/ejbcaws \
  --cert SuperAdmin.p12:password

# Test REST endpoint  
curl -k https://your-ejbca-server:8444/ejbca/ejbca-rest-api/v1/ca \
  --cert SuperAdmin.p12:password
```

4. Verify EJBCA is running:
```bash
# Check EJBCA service
systemctl status ejbca
# or
docker ps | grep ejbca
```

5. Check application logs for the actual URL being used:
```
INFO  o.s.w.c.s.WebApplicationContextInitializer : SOAP URL configured: https://xxx:8443/ejbca/ejbcaws/ejbcaws
```
