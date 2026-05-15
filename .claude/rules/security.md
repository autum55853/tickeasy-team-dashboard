---
# 全域規則（無 paths 限制）
---

# 安全性規則

## Token 處理

- JWT token 只存在 Cookie（`tickeasy_token`）和 localStorage（`tickeasy_user`）
- 不可把 token 印在 console.log、HTML attribute、URL query（除初次跨域傳遞外）
- Cookie 設定 `SameSite=Lax`，不可設定 `SameSite=None` 除非有 HTTPS + 充分理由
- API Route 收到 token 直接轉發後端，**不可在前端解析或驗證 JWT**（後端驗證）

## XSS 防護

- 不可使用 `dangerouslySetInnerHTML`，除非內容已通過 sanitization
- 用戶上傳的內容不可直接 render 為 HTML
- localStorage 讀取的資料在 render 前應做基本 type check

## CSRF

- API Routes 目前依賴 Bearer token（而非 Cookie）驗證，天然防 CSRF
- 若未來改用 Cookie-based auth，需加入 CSRF token

## 輸入驗證

- API Route 收到的 `userId`、`concertId` 應驗證為合理格式（非空、非 SQL injection）
- 雖後端會驗證，前端不應傳送明顯惡意資料

## 敏感資訊

- `.env.local` 不可 commit
- Supabase anon key 是公開 key（可安全放 `NEXT_PUBLIC_`），但 Supabase service role key 若有使用則嚴禁放前端
- 後端 API 的業務邏輯 / DB 直接存取錯誤訊息不可直接暴露給使用者

## 相依套件

- 新增套件前確認近期仍有維護（npm 最後更新日期），無已知 CVE
- 不使用有安全疑慮的 polyfill 或 CDN 載入的第三方腳本
