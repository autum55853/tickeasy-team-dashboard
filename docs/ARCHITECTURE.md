# ARCHITECTURE.md

## 目錄結構

```
tickeasy-dashboard/
├── app/                              # Next.js App Router
│   ├── (dashboard)/                  # Route group（URL 無此段）
│   │   ├── layout.tsx                # Dashboard layout：跨域認證處理 + Navbar 渲染
│   │   ├── page.tsx                  # / → 轉址 /dashboard
│   │   └── dashboard/
│   │       ├── page.tsx              # /dashboard：統計卡片儀表板
│   │       ├── users/
│   │       │   ├── page.tsx          # /dashboard/users：用戶列表（Server Component）
│   │       │   └── update-role/
│   │       │       └── route.ts      # POST /dashboard/users/update-role：代理角色更新
│   │       ├── concerts/
│   │       │   ├── page.tsx          # /dashboard/concerts：演唱會列表（Server Component）
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx      # /dashboard/concerts/[id]：詳情 + 審核面板
│   │       │   └── review/
│   │       │       └── route.ts      # POST /dashboard/concerts/review：代理審核
│   │       └── orders/
│   │           └── page.tsx          # /dashboard/orders：訂單列表（Server Component）
│   ├── auth/                         # 認證相關頁面（實際上重導向前端，保留備用）
│   │   ├── login/page.tsx            # 自動導向前端登入（2 秒後跳轉）
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up-success/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── update-password/page.tsx
│   │   ├── error/page.tsx
│   │   └── confirm/route.ts          # GET：Supabase email 確認回調
│   ├── protected/                    # 舊版受保護頁面（Supabase Auth 時代，現已保留但棄用）
│   ├── layout.tsx                    # Root layout：ThemeProvider + Toaster
│   ├── page.tsx                      # / 根頁面（Supabase starter 預設，無實際使用）
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── navbar.tsx                # 導覽列：fetch 用戶資訊 + 顯示用戶名稱 + 登出
│   │   └── stats-card.tsx            # 統計卡片元件
│   ├── concerts/
│   │   ├── concert-table.tsx         # 演唱會列表（TanStack Table，含篩選）
│   │   ├── concert-filters.tsx       # 狀態篩選器
│   │   ├── concert-stats.tsx         # 演唱會狀態統計卡片
│   │   ├── concert-basic-info-card.tsx    # 基本資訊卡片
│   │   ├── concert-venue-card.tsx         # 場地資訊卡片
│   │   ├── concert-organization-card.tsx  # 主辦單位卡片
│   │   ├── concert-sessions-and-tickets-card.tsx  # 場次與票價卡片
│   │   ├── concert-review-panel.tsx  # 審核面板（整合 history + actions）
│   │   ├── concert-review-history.tsx # 審核紀錄列表
│   │   ├── concert-review-actions.tsx # 審核操作（通過/拒絕按鈕）
│   │   └── review-dialog.tsx         # 審核確認對話框
│   ├── users/
│   │   ├── user-table.tsx            # 用戶列表（TanStack Table）
│   │   └── role-switcher.tsx         # 角色下拉選單（呼叫 update-role API Route）
│   ├── orders/
│   │   ├── order-table.tsx           # 訂單列表
│   │   └── order-filters.tsx         # 訂單篩選器
│   └── ui/                           # shadcn/ui 元件（button, card, dialog, badge 等）
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 瀏覽器端 Supabase client（Client Component 用）
│   │   ├── server.ts                 # Server Component Supabase client（需 cookies()）
│   │   └── middleware.ts             # Supabase session 更新（已全數註解，不使用）
│   ├── types/
│   │   ├── user.ts                   # User, UserRole('user'|'admin'|'superuser')
│   │   ├── concert.ts                # Concert, Organization, Venue, ConInfoStatus, ReviewStatus
│   │   └── order.ts                  # Order, OrderStatus, TicketType
│   ├── auth-utils.ts                 # 跨域認證工具：handleCrossDomainAuth, getAuthToken, getCurrentUser, clearAuthData
│   └── utils.ts                      # cn()（Tailwind class merge），hasEnvVars
├── actions/                          # Next.js Server Actions（已被 API Routes 取代，勿直接使用）
│   ├── concerts.ts                   # reviewConcert()
│   └── users.ts                      # updateUserRole()
├── middleware.ts                     # 全域 middleware：保護 /dashboard，處理 URL token
├── next.config.mjs                   # Image remotePatterns（Supabase Storage + Google）
├── tailwind.config.ts
├── components.json                   # shadcn/ui CLI 設定
└── docs/
    ├── supabase.sql                  # 完整資料庫 Schema
    └── auth-system-changes.md        # 認證系統修改說明
```

## 啟動流程

```
瀏覽器 → middleware.ts → (dashboard)/layout.tsx → page.tsx
                ↓
        1. 檢查 Cookie tickeasy_token
        2. 有 token → NextResponse.next()
        3. URL 帶 ?token= → 寫入 Cookie → 302 redirect（清除 URL 參數）
        4. 無 token → 302 redirect 到前端登入頁
```

Client Component（layout.tsx）啟動後：
1. `handleCrossDomainAuth()` 讀 URL params（token + userInfo）
2. 有 → 寫 Cookie + localStorage，清除 URL params
3. 無 → 不做任何事，繼續渲染

## 認證機制（跨域 JWT 雙層）

### 正常進入流程

```
前端（frontend-amber.onrender.com）
  └─ 管理員點「後台管理」
       └─ redirect → /dashboard?token=<jwt>&userInfo=<encoded-json>
            └─ middleware.ts 讀 URL token → 寫 Cookie → redirect /dashboard（乾淨 URL）
                 └─ layout.tsx handleCrossDomainAuth() → 寫 localStorage（備用）
```

### Token 儲存位置

| 儲存位置 | 名稱 | 用途 | 有效期 |
|----------|------|------|--------|
| Cookie（HttpOnly: false） | `tickeasy_token` | Middleware 路由保護 + API 呼叫 | 1 天 |
| localStorage | `tickeasy_user` | Navbar 顯示用戶資訊（備用） | 手動清除 |

### API 呼叫認證

Client Components 呼叫後端 API 時：
```typescript
const token = getAuthToken(); // 從 Cookie 讀取
fetch('/dashboard/xxx/route', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

API Route 將 Authorization header 原封不動轉發給後端：
```typescript
// app/(dashboard)/dashboard/users/update-role/route.ts
const authHeader = req.headers.get('authorization');
fetch(`${apiBase}/api/v1/users/${userId}/role`, {
  headers: { 'Authorization': authHeader }
});
```

### 登出流程

`clearAuthData()`（`lib/auth-utils.ts`）：
1. 清除 `localStorage.tickeasy_token` + `tickeasy_user`
2. 清除 Cookie `tickeasy_token`（max-age=0）
3. `window.location.href = 'https://frontend-amber.onrender.com/login'`

## API Routes（Proxy 模式）

後台不直接呼叫後端 API（避免 CORS），而是透過本地 API Routes 代理：

| Method | 路徑 | 代理目標 | 說明 |
|--------|------|---------|------|
| POST | `/dashboard/concerts/review` | `POST /api/v1/concerts/{id}/manual-review` | 審核演唱會 |
| POST | `/dashboard/users/update-role` | `PATCH /api/v1/users/{id}/role` | 更新用戶角色 |

請求/回應格式：

```typescript
// 審核請求 body
{ concertId: string, reviewStatus: "approved" | "rejected", reviewerNote?: string }

// 角色更新請求 body
{ userId: string, newRole: "user" | "admin" | "superuser" }

// 統一回應
{ success: boolean, error?: string }
```

## Supabase 資料讀取

Server Components 直連 Supabase 讀取資料（不經後端 API）：

```typescript
// app/(dashboard)/dashboard/users/page.tsx
const supabase = await createClient();
const { data: users } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
```

關聯查詢範例（concerts）：
```typescript
supabase.from('concert').select(`
  *,
  organization:organizationId (organizationId, orgName, userId),
  venue:venueId (venueId, venueName, venueAddress)
`);
```

## 資料庫 Schema

### users
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| userId | uuid | PK | 用戶 ID |
| email | varchar(100) | UNIQUE NOT NULL | 電子信箱 |
| name | varchar(50) | NOT NULL | 姓名 |
| nickname | varchar(20) | | 暱稱 |
| role | UserRole enum | NOT NULL DEFAULT 'user' | 角色：user/admin/superuser |
| phone | varchar(20) | | 電話 |
| birthday | date | | 生日 |
| gender | Gender enum | | male/female/other |
| isEmailVerified | boolean | NOT NULL DEFAULT false | 信箱驗證狀態 |
| createdAt | timestamp | NOT NULL DEFAULT now() | |
| updatedAt | timestamp | NOT NULL DEFAULT now() | |
| deletedAt | timestamp | | 軟刪除 |

### concert
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| concertId | uuid | PK | |
| organizationId | uuid | FK→organization | |
| venueId | uuid | FK→venues | 可選 |
| conTitle | varchar(50) | NOT NULL | 演唱會名稱 |
| conInfoStatus | ConInfoStatus enum | NOT NULL DEFAULT 'draft' | draft/reviewing/published/rejected/finished |
| reviewStatus | ReviewStatus enum | DEFAULT 'skipped' | pending/approved/rejected/skipped |
| reviewNote | text | | 審核備註 |
| visitCount | integer | DEFAULT 0 | 瀏覽次數 |
| eventStartDate | date | | 活動開始日期 |
| eventEndDate | date | | 活動結束日期 |
| imgBanner | varchar(255) | | 橫幅圖片 URL（Supabase Storage） |

### order
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| orderId | uuid | PK | |
| ticketTypeId | uuid | FK→ticketType | |
| userId | uuid | FK→users | |
| orderStatus | OrderStatus enum | | held/expired/paid/cancelled/refunded |
| isLocked | boolean | NOT NULL DEFAULT true | 訂單鎖定中 |
| lockToken | varchar(100) | NOT NULL | 鎖定 token |
| lockExpireTime | timestamp | NOT NULL | 鎖定過期時間 |
| choosePayment | varchar | | 付款方式 |

### 其他主要 Tables

| Table | 說明 |
|-------|------|
| organization | 主辦單位，FK→users |
| venues | 場地資訊 |
| concertSession | 演唱會場次，FK→concert（CASCADE DELETE） |
| ticketType | 票種，FK→concertSession（CASCADE DELETE） |
| ticket | 已購票券，FK→order + ticketType + users |
| payment | 付款紀錄，FK→order |
| locationTag | 地區標籤 |
| musicTag | 音樂類型標籤 |

完整 DDL 參見 `docs/supabase.sql`。

## 外部服務

| 服務 | URL | 說明 |
|------|-----|------|
| 後端 API | https://tickeasy-amber-backend.onrender.com | 業務邏輯 API，JWT 驗證 |
| 前端應用 | https://frontend-amber.onrender.com | 用戶端，提供登入入口 |
| Supabase | NEXT_PUBLIC_SUPABASE_URL | 資料庫直連讀取 |
| Supabase Storage | cppeqosxwdgemmgbutnd.supabase.co | 演唱會圖片儲存 |
| Google User Content | lh3.googleusercontent.com | Google OAuth 頭像 |
