#!/bin/bash
# 阻止編輯敏感檔案

FILE_PATH="$1"

PROTECTED_PATTERNS=(
  "\.env"
  "\.env\.local"
  "\.env\.production"
  "package-lock\.json"
  "\.claude/settings\.json"
  "\.claude/settings\.local\.json"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "BLOCKED: $FILE_PATH 是受保護的敏感檔案，請手動編輯並確認變更"
    exit 1
  fi
done

exit 0
