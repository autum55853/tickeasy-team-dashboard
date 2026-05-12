---
paths:
  - "app/**/route.ts"
  - "actions/**"
---

# API Route 設計規則

## Proxy 模式

後台 API Routes 作為代理層，不直接實作業務邏輯：

1. 從 request header 取得 `authorization`，無則回 401
2. 解析 request body 取得必要參數，缺少則回 400
3. 加上 `Content-Type` 和 `Authorization` header 轉發後端
4. 後端錯誤回 500，成功回 `{ success: true }`

## 回應格式

```typescript
// 成功
NextResponse.json({ success: true, ...data })

// 失敗（含業務錯誤）
NextResponse.json({ success: false, error: "錯誤訊息" }, { status: 4xx | 5xx })
```

## 錯誤處理

- 所有 route handler 包在 try/catch
- catch 內 `console.error("動作名稱錯誤:", error)` 再回 500
- 後端 API 失敗時回傳後端原始 error 訊息（轉發，不自訂）

## 快取

- 寫入操作成功後加 `revalidatePath("/dashboard/<feature>")` 清除 Next.js 快取
- 讀取操作（詳情頁）加 `{ cache: "no-store" }` 確保資料最新

## 使用後端 API Base URL

```typescript
const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-team-backend.onrender.com";
```

不可硬編碼後端 URL，務必用環境變數。
