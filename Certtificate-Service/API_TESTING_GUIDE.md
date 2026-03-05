# Certificate Service API Testing Guide

## Prerequisites

1. **Keycloak Server** running and accessible
2. **EJBCA Server** running and accessible  
3. **Certificate Service** running on port 8082
4. **PostgreSQL Database** accessible

## Quick Start Test

### Step 1: Get JWT Token from Keycloak

```bash
# Replace with your Keycloak server details
KEYCLOAK_URL="http://localhost:8080"
REALM="tsign-realm"
CLIENT_ID="certificate-service"
CLIENT_SECRET="your-client-secret"  # If confidential client
USERNAME="testuser"
PASSWORD="testpassword"

# Get token
curl -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=${USERNAME}" \
  -d "password=${PASSWORD}"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldU...",
  "token_type": "Bearer",
  "scope": "email profile"
}
```

Save the access_token:
```bash
export JWT_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4..."
```

### Step 2: Test Public Endpoints (No Auth Required)

```bash
# Health check - EJBCA connectivity status
curl http://localhost:8082/api/v1/health

# Simple ping for load balancers
curl http://localhost:8082/api/v1/health/ping

# OpenAPI docs
curl http://localhost:8082/v3/api-docs

# Swagger UI (open in browser)
open http://localhost:8082/swagger-ui.html
```

### Step 3: Test Protected Endpoints

#### 3.1 Get Own Certificate Status

```bash
curl -X GET http://localhost:8082/api/v1/certs/status/me \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Accept: application/json"
```

**Expected Response (No Certificate):**
```json
{
  "userId": "testuser",
  "status": "NO_CERTIFICATE",
  "keyAlias": null,
  "serialNumber": null,
  "revocationReason": null,
  "revocationDate": null,
  "notAfter": null
}
```

#### 3.2 Generate CSR and Enroll Certificate

**Option A: Generate CSR with OpenSSL**

```bash
# Generate private key
openssl genrsa -out testuser.key 2048

# Generate CSR
openssl req -new -key testuser.key -out testuser.csr \
  -subj "/CN=Test User/O=Mobile-ID/C=VN/emailAddress=testuser@tsign.local"

# View CSR
cat testuser.csr
```

**Option B: Use existing CSR**

```bash
# Create CSR file
cat > testuser.csr << 'EOF'
-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVk4xEzARBgNVBAgMClNvbWUtU3RhdGUx
FDASBgNVBAcMC0hvIENoaSBNaW5oMRMwEQYDVQQKDApNb2JpbGUtSUQxEzARBgNV
BAMMCnRlc3R1c2VyMSAwHgYJKoZIhvcNAQkBFhF0ZXN0dXNlckB0c2lnbi5sb2Nh
bDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL...
-----END CERTIFICATE REQUEST-----
EOF
```

**Enroll Certificate:**

```bash
# Prepare CSR as JSON (escape newlines)
CSR_CONTENT=$(cat testuser.csr | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"password\": \"certPassword123\",
    \"csrContent\": \"${CSR_CONTENT}\"
  }"
```

**Or use the complete CSR string:**

```bash
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "certPassword123",
    "csrContent": "-----BEGIN CERTIFICATE REQUEST-----\nMIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVk4xEzARBgNVBAgMClNvbWUtU3RhdGUx\nFDASBgNVBAcMC0hvIENoaSBNaW5oMRMwEQYDVQQKDApNb2JpbGUtSUQxEzARBgNV\nBAMMCnRlc3R1c2VyMSAwHgYJKoZIhvcNAQkBFhF0ZXN0dXNlckB0c2lnbi5sb2Nh\nbDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL...\n-----END CERTIFICATE REQUEST-----"
  }'
```

**Expected Response:**
```json
{
  "serialNumber": "123456789ABCDEF",
  "certificateContent": "-----BEGIN CERTIFICATE-----\nMIIFXTCCA0WgAwIBAgIUE...\n-----END CERTIFICATE-----\n",
  "status": "ACTIVE",
  "issuerDn": "CN=SubCA,O=Mobile-ID,C=VN",
  "subjectDn": "CN=Test User,O=Mobile-ID,C=VN",
  "notBefore": "2024-01-15T10:30:00",
  "notAfter": "2025-01-15T10:30:00",
  "keyAlgorithm": "RSA",
  "userId": "testuser"
}
```

#### 3.3 Check Certificate Status Again

```bash
curl -X GET http://localhost:8082/api/v1/certs/status/me \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response:**
```json
{
  "userId": "testuser",
  "status": "ACTIVE",
  "keyAlias": "testuser_key",
  "serialNumber": "123456789ABCDEF",
  "revocationReason": null,
  "revocationDate": null,
  "notAfter": "2025-01-15T10:30:00"
}
```

#### 3.4 Get Certificate Details

```bash
# Replace with your certificate serial number
SERIAL="123456789ABCDEF"

curl -X GET "http://localhost:8082/api/v1/certs/${SERIAL}?issuerDn=CN%3DSubCA%2CO%3DMobile-ID%2CC%3DVN" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### 3.5 Renew Certificate

```bash
curl -X POST http://localhost:8082/api/v1/certs/renew \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newCertPassword456",
    "csrContent": "-----BEGIN CERTIFICATE REQUEST-----\n...new CSR...\n-----END CERTIFICATE REQUEST-----",
    "oldSerialNumber": "123456789ABCDEF",
    "oldIssuerDn": "CN=SubCA,O=Mobile-ID,C=VN"
  }'
```

#### 3.6 Revoke Certificate (Requires admin_role or signer_role)

```bash
curl -X POST http://localhost:8082/api/v1/certs/revoke \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "123456789ABCDEF",
    "issuerDn": "CN=SubCA,O=Mobile-ID,C=VN",
    "reason": 4
  }'
```

**Revocation Reasons:**
- `0` - UNSPECIFIED
- `1` - KEY_COMPROMISE
- `2` - CA_COMPROMISE
- `3` - AFFILIATION_CHANGED
- `4` - SUPERSEDED (for renewal)
- `5` - CESSATION_OF_OPERATION
- `6` - CERTIFICATE_HOLD

#### 3.7 Manual User Synchronization

```bash
curl -X POST "http://localhost:8082/api/v1/certs/sync-user?password=syncPassword123" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response:**
```
User synchronized successfully with EJBCA
```

#### 3.8 Issue P12 Keystore (Legacy)

```bash
curl -X POST http://localhost:8082/api/v1/certs/issue-p12 \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "p12Password123"
  }'
```

**Expected Response:**
```
MIIKTAIBAzCCCgQGCSqGSIb3DQEHAaCCCfUEggnxMIIJ7T...
```

Decode and save:
```bash
curl -X POST http://localhost:8082/api/v1/certs/issue-p12 \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"password": "p12Password123"}' \
  | base64 -d > testuser.p12

# Verify
openssl pkcs12 -in testuser.p12 -info -noout
```

---

## Testing with Swagger UI

### Step 1: Obtain JWT Token

Use the curl command above or Keycloak console to get a token.

### Step 2: Authorize in Swagger

1. Open http://localhost:8082/swagger-ui.html
2. Click **"Authorize"** button (top right)
3. In the "bearerAuth" section, enter:
   ```
   Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4...
   ```
4. Click **"Authorize"** then **"Close"**

### Step 3: Test Endpoints

1. Expand an endpoint (e.g., `POST /api/v1/certs/enroll`)
2. Click **"Try it out"**
3. Fill in the request body
4. Click **"Execute"**

---

## Testing Different Roles

### Test Viewer Role

```bash
# Get token for viewer user
export VIEWER_TOKEN="viewer.jwt.token.here"

# Should work - viewing status
curl -X GET http://localhost:8082/api/v1/certs/status/me \
  -H "Authorization: Bearer ${VIEWER_TOKEN}"

# Should fail - enrolling certificate (requires signer_role)
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${VIEWER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"password": "test", "csrContent": "test"}'
# Expected: 403 Forbidden
```

### Test Signer Role

```bash
export SIGNER_TOKEN="signer.jwt.token.here"

# Should work
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${SIGNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"password": "test", "csrContent": "test"}'
```

### Test Admin Role

```bash
export ADMIN_TOKEN="admin.jwt.token.here"

# Should work - revoke certificate
curl -X POST http://localhost:8082/api/v1/certs/revoke \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "ABC", "reason": 0}'
```

---

## Testing Error Scenarios

### Invalid JWT Token

```bash
curl -X GET http://localhost:8082/api/v1/certs/status/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected:** 401 Unauthorized

### Missing Token

```bash
curl -X GET http://localhost:8082/api/v1/certs/status/me
```

**Expected:** 401 Unauthorized

### Insufficient Permissions

```bash
# User without signer_role trying to enroll
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${VIEWER_TOKEN}" \
  -d '{}'
```

**Expected:** 403 Forbidden

### Invalid CSR

```bash
curl -X POST http://localhost:8082/api/v1/certs/enroll \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "test",
    "csrContent": "invalid csr content"
  }'
```

**Expected:** 500 Internal Server Error with error message

---

## Automated Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

# Configuration
KEYCLOAK_URL="http://localhost:8080"
REALM="tsign-realm"
CLIENT_ID="certificate-service"
API_URL="http://localhost:8082"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "=== Certificate Service API Test Suite ==="

# 1. Get Token
echo -e "\n[1/7] Getting JWT token from Keycloak..."
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "username=testuser" \
  -d "password=testpass")

JWT_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}✗ Failed to get token${NC}"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Got token${NC}"

# 2. Test public endpoint
echo -e "\n[2/7] Testing public endpoint..."
HEALTH=$(curl -s http://${API_URL}/api/v1/health)
if [[ $HEALTH == *"UP"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

# 3. Test status (no cert yet)
echo -e "\n[3/7] Testing certificate status (no cert)..."
STATUS=$(curl -s -X GET ${API_URL}/api/v1/certs/status/me \
  -H "Authorization: Bearer ${JWT_TOKEN}")

if [[ $STATUS == *"NO_CERTIFICATE"* ]]; then
    echo -e "${GREEN}✓ Status check passed${NC}"
    echo "Response: $STATUS"
else
    echo -e "${RED}✗ Status check failed${NC}"
fi

# 4. Generate CSR
echo -e "\n[4/7] Generating test CSR..."
openssl genrsa -out /tmp/test.key 2048 2>/dev/null
openssl req -new -key /tmp/test.key -out /tmp/test.csr \
  -subj "/CN=Test User/O=Test/C=VN" 2>/dev/null
CSR=$(cat /tmp/test.csr | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
echo -e "${GREEN}✓ CSR generated${NC}"

# 5. Enroll certificate
echo -e "\n[5/7] Testing certificate enrollment..."
ENROLL=$(curl -s -X POST ${API_URL}/api/v1/certs/enroll \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"testpass123\", \"csrContent\": \"${CSR}\"}")

if [[ $ENROLL == *"serialNumber"* ]]; then
    echo -e "${GREEN}✓ Enrollment successful${NC}"
    SERIAL=$(echo $ENROLL | grep -o '"serialNumber":"[^"]*' | grep -o '[^"]*$')
    echo "Serial: $SERIAL"
else
    echo -e "${RED}✗ Enrollment failed${NC}"
    echo "Response: $ENROLL"
fi

# 6. Check status again
echo -e "\n[6/7] Testing certificate status (with cert)..."
STATUS2=$(curl -s -X GET ${API_URL}/api/v1/certs/status/me \
  -H "Authorization: Bearer ${JWT_TOKEN}")

if [[ $STATUS2 == *"ACTIVE"* ]]; then
    echo -e "${GREEN}✓ Status shows ACTIVE${NC}"
else
    echo -e "${RED}✗ Status check failed${NC}"
fi

# 7. Test unauthorized access
echo -e "\n[7/7] Testing unauthorized access..."
UNAUTH=$(curl -s -w "%{http_code}" -X GET ${API_URL}/api/v1/certs/status/me)
if [[ $UNAUTH == *"401"* ]]; then
    echo -e "${GREEN}✓ Unauthorized access blocked${NC}"
else
    echo -e "${RED}✗ Security test failed${NC}"
fi

echo -e "\n=== Test Suite Complete ==="

# Cleanup
rm -f /tmp/test.key /tmp/test.csr
```

Make executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Debugging Tips

### Enable Debug Logging

Add to `application.yml`:
```yaml
logging:
  level:
    org.springframework.security: DEBUG
    org.springframework.ws.client.MessageTracing: DEBUG
```

### Decode JWT Token

```bash
# Split token and decode middle section (payload)
echo $JWT_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq .
```

### Check Token Expiry

```bash
# Extract exp claim and convert to date
echo $JWT_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq .exp | xargs -I {} date -d @{} 
```

### Verify EJBCA Connection

```bash
# Test EJBCA REST API directly
curl -k https://localhost/ejbca/ejbca-rest-api/v1/ca \
  --cert SuperAdmin.p12:password \
  --cert-type P12
```

---

## Common Issues

### "Invalid token" Error
- Check Keycloak issuer-uri matches exactly
- Verify token hasn't expired
- Ensure Keycloak realm is correct

### "403 Forbidden" Error
- User doesn't have required role
- Check realm_access.roles in JWT
- Verify role mapping in SecurityConfig

### "User not found" Error
- EJBCA user synchronization failed
- Check EJBCA profiles exist
- Verify SuperAdmin credentials

### "Connection refused" to EJBCA
- Check EJBCA is running
- Verify mTLS certificates
- Check firewall/network connectivity
