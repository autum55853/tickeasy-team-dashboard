# CHANGELOG.md

## [Unreleased]

## [0.4.2] - 2026-05-26

### Fixed
- `lib/auth-utils.ts`：修正跨域登出 timing bug — `iframe.onload` 在前台 React SPA boot 前觸發，導致 BroadcastChannel 訊息尚未發出就清除 iframe；改以 `postMessage` handshake 取代，前台廣播完成後才通知 Dashboard 執行清除與跳轉，4 秒 timeout 保留作 fallback

## [0.4.1] - 2026-05-26

### Added
- 場地管理：新增場地功能（`VenueCreateDialog` + `POST /dashboard/venues`）
- 場地管理：刪除場地功能（AlertDialog 確認 + `DELETE /dashboard/venues/[venueId]`）
- `components/ui/alert-dialog.tsx`：AlertDialog 元件（@radix-ui/react-alert-dialog）
- `components/venues/venue-create-dialog.tsx`：場地新增 Dialog

### Changed
- `venue-table.tsx`：加入「新增場地」按鈕、刪除按鈕、刪除確認 AlertDialog
- API Route 由 `POST /dashboard/venues/update` 改為 `PATCH /dashboard/venues/[venueId]`（RESTful）
- 測試更新至新 API Route 路徑，補充 DELETE 和 POST 測試案例

## [0.4.0] - 2026-05-26

### Added
- 場地管理功能（`/dashboard/venues`）：列表瀏覽、搜尋篩選、編輯 Dialog
- `components/venues/venue-table.tsx`：場地列表（含名稱/地址搜尋）
- `components/venues/venue-edit-dialog.tsx`：場地編輯 Dialog（9 個欄位）
- API Route proxy：`POST /dashboard/venues/update` → `PATCH /api/v1/venues/{venueId}`

### Changed
- Navbar 加入「場地管理」導覽項目

## [0.3.0] - 2026-05-12

### Changed
- 新增 Google 圖片來源跨域設定（`next.config.mjs`）
- Navbar 支援 superuser 角色顯示 badge

## [0.2.0] - 2025-06-17

### Added
- 跨域認證系統：從前端接收 JWT token，設定 Cookie 保護 `/dashboard`
- `lib/auth-utils.ts`：`handleCrossDomainAuth`、`getAuthToken`、`clearAuthData`、`getCurrentUser`
- 演唱會審核功能：`ConcertReviewPanel`、`ConcertReviewHistory`、`ConcertReviewActions`
- 演唱會詳情頁（`/dashboard/concerts/[id]`）
- API Route proxy：`/dashboard/concerts/review`、`/dashboard/users/update-role`

### Changed
- `middleware.ts` 改為自訂 JWT Cookie 認證，停用 Supabase Auth session
- Dashboard layout 加入跨域認證處理邏輯
- 後台登入頁面改為自動重導向前端
- Navbar 登出改導向前端登入頁

## [0.1.0] - 初始版本

### Added
- Next.js 14 App Router 基礎架構
- Supabase 整合（SSR）
- 儀表板統計頁面
- 用戶管理（列表 + 角色修改）
- 演唱會管理（列表 + 篩選）
- 訂單管理（列表 + 統計）
- Tailwind CSS + shadcn/ui 元件庫
- TanStack Table 表格元件
- 暗/亮主題切換
