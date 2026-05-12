---
paths:
  - "components/**"
  - "app/**/*.tsx"
  - "app/**/*.ts"
---

# 前端元件規則

## React / Next.js

- Server Component 預設，需要互動才加 `"use client"`
- Client Component 不可直接使用 `lib/supabase/server.ts`（只能在 Server Component 用）
- 讀取 Supabase 資料在 Server Component 完成，透過 props 傳給 Client Component
- `useEffect` 內的 fetch 必須帶上 `getAuthToken()` 取得的 Bearer token

## Tailwind CSS + shadcn/ui

- 樣式只用 Tailwind utility class，不寫 inline style
- 使用 `cn()` (`lib/utils.ts`) 合併 class（結合 `clsx` + `tailwind-merge`）
- 優先用 `components/ui/` 的 shadcn/ui 元件，再考慮自訂
- 新增 shadcn/ui 元件：`npx shadcn@latest add <name>`

## 認證相關

- Client Component 需要 token 時用 `getAuthToken()`（`lib/auth-utils.ts`），不可直接讀 `document.cookie`
- 不可把 JWT token 放進 URL、Log、或 DOM attribute
- `clearAuthData()` 是唯一正確的登出方法，勿自行清除 Cookie/localStorage

## 表格元件

- 列表頁面使用 TanStack Table（`@tanstack/react-table`）
- 排序和篩選邏輯放在 Client Component，資料由 Server Component 傳入

## 錯誤處理與通知

- API 呼叫成功/失敗用 `sonner` toast（`import { toast } from "sonner"`）
- 成功：`toast.success("訊息")`
- 失敗：`toast.error(result.error || "預設錯誤訊息")`
