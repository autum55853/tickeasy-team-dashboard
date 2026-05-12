# DEVELOPMENT.md

## 命名規則

| 類型 | 規則 | 範例 |
|------|------|------|
| React Component 檔案 | kebab-case | `concert-table.tsx` |
| React Component 函式 | PascalCase | `function ConcertTable()` |
| 一般函式/變數 | camelCase | `getAuthToken()`, `userId` |
| TypeScript 型別/介面 | PascalCase | `interface Concert`, `type UserRole` |
| Next.js 特殊檔案 | 規定命名 | `page.tsx`, `layout.tsx`, `route.ts` |
| CSS class | Tailwind utility（無自訂） | `flex items-center gap-4` |
| 資料庫欄位 | camelCase（Supabase）| `conInfoStatus`, `createdAt` |
| 環境變數 | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

## 模組系統

使用 TypeScript + ES modules。路徑別名：
- `@/` → 根目錄（`tsconfig.json` paths）

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types/concert";
import { getAuthToken } from "@/lib/auth-utils";
```

## 環境變數

| 變數 | 用途 | 必要 | 預設值 |
|------|------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | 是 | 無 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | 是 | 無 |
| `NEXT_PUBLIC_API_URL` | 後端 API base URL | 是 | `https://tickeasy-team-backend.onrender.com` |
| `VERCEL_URL` | Vercel 部署 URL（自動注入） | 否 | `http://localhost:3000` |

**注意**：`NEXT_PUBLIC_` 前綴的變數會暴露給瀏覽器端。目前 API URL 和 Supabase 設定均為公開 key，符合設計。JWT secret 不在前端。

## 新增 Dashboard 頁面步驟

1. 在 `app/(dashboard)/dashboard/<feature>/page.tsx` 建立 Server Component
2. 使用 `createClient()` 從 Supabase 讀取資料
3. 建立對應的 `components/<feature>/` 目錄放置 Client Components
4. 若有寫入操作，建立 `app/(dashboard)/dashboard/<feature>/<action>/route.ts` 作為 proxy
5. 在 `components/dashboard/navbar.tsx` 的 `navItems` 陣列加入導覽項目

## 新增 API Route（Proxy）步驟

```typescript
// app/(dashboard)/dashboard/<feature>/<action>/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
  }

  const body = await req.json();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-team-backend.onrender.com";

  const apiRes = await fetch(`${apiBase}/api/v1/...`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": authHeader },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    return NextResponse.json({ success: false, error: "外部 API 調用失敗" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

## 新增 TypeScript 型別步驟

在 `lib/types/` 新增或擴充對應 `.ts` 檔案，並 export type/interface。

## Client Component vs Server Component

| 場景 | 用哪個 |
|------|--------|
| 讀取 Supabase 資料（頁面） | Server Component（`createClient()` from `lib/supabase/server.ts`） |
| 使用 useState/useEffect/onClick | Client Component（加 `"use client"`） |
| 呼叫後端 API（需要 token） | Client Component（用 `getAuthToken()` 讀 Cookie） |
| 顯示靜態 UI | Server Component（效能較好） |

## 計畫歸檔流程

1. 計畫檔案命名：`docs/plans/YYYY-MM-DD-<feature-name>.md`
2. 計畫文件結構：User Story → Spec → Tasks
3. 功能完成後移至 `docs/plans/archive/`
4. 更新 `docs/FEATURES.md` 和 `docs/CHANGELOG.md`

## 新增 shadcn/ui 元件

```bash
npx shadcn@latest add <component-name>
# 元件自動加入 components/ui/
```

## 常見陷阱

- **Supabase client 誤用**：Server Component 內不可用 `lib/supabase/client.ts`（瀏覽器版），必須用 `lib/supabase/server.ts`
- **Token 讀取位置**：`getAuthToken()` 讀 Cookie，只能在瀏覽器端呼叫（`typeof window !== 'undefined'` 或 Client Component）
- **前端 URL 硬編碼**：`https://frontend-fz4o.onrender.com/login` 出現在 `lib/auth-utils.ts`（clearAuthData）、`middleware.ts`、`app/auth/login/page.tsx`，環境切換需全部更新
- **revalidatePath**：API Route 呼叫成功後若需更新快取，加上 `revalidatePath("/dashboard/xxx")`
