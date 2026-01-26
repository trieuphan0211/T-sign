#!/bin/bash
set -e

# Định nghĩa các biến
TOKEN_LABEL="SigningToken"
PIN="1234"
SO_PIN="1234"
CONFIG_FILE="/app/pkcs11.cfg"
LIB_PATH="/usr/lib/softhsm/libsofthsm2.so"

# 1. Kiểm tra xem Token đã tồn tại chưa (dựa vào Label)
# softhsm2-util --show-slots trả về danh sách, ta grep label
if softhsm2-util --show-slots | grep -q "Label:.*$TOKEN_LABEL"; then
    echo "--> Token '$TOKEN_LABEL' already exists."
else
    echo "--> Token '$TOKEN_LABEL' not found. Initializing..."
    # Init token tại slot 0 (SoftHSM sẽ tự chuyển nó sang slot mới)
    softhsm2-util --init-token --slot 0 --label "$TOKEN_LABEL" --pin "$PIN" --so-pin "$SO_PIN"
fi

# 2. Tìm Slot ID hiện tại của Token (CỰC KỲ QUAN TRỌNG)
# Lệnh này lấy Slot ID của token có label tương ứng
SLOT_ID=$(softhsm2-util --show-slots \
  | awk -v label="$TOKEN_LABEL" '
      /^Slot /                { slot=$2; init="no" }
      /Initialized:[[:space:]]+yes/ { init="yes" }
      /Label:[[:space:]]*/ {
          if ($0 ~ label && init == "yes") {
              print slot
              exit
          }
      }')

if [ -z "$SLOT_ID" ]; then
    echo "Error: Could not determine Slot ID for token '$TOKEN_LABEL'"
    exit 1
fi

echo "--> Found Token '$TOKEN_LABEL' at Slot ID: $SLOT_ID"

# 3. Tạo lại file pkcs11.cfg với Slot ID chính xác
echo "--> Updating $CONFIG_FILE with Slot ID $SLOT_ID"

cat > "$CONFIG_FILE" <<EOF
name = $TOKEN_LABEL
library = $LIB_PATH
slot = $SLOT_ID
EOF

# In ra nội dung config để debug
cat "$CONFIG_FILE"

# 4. Chạy ứng dụng Java (giữ nguyên các tham số CMD truyền vào nếu có)
echo "--> Starting Java Application..."
exec "$@"