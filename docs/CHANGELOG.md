# CHANGELOG.md

## [Unreleased]

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
