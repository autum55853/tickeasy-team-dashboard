# CLAUDE.md

## 專案概述

Tickeasy Dashboard — Next.js 14 App Router 演唱會票務後台管理系統。供管理員管理用戶、審核演唱會、查看訂單。使用自訂跨域 JWT 認證（非 Supabase Auth Session），直連 Supabase 資料庫讀取資料，寫入操作透過 API Route proxy 轉發後端。

## 常用指令

```bash
npm run dev    # 開發伺服器（Turbopack，port 3000）
npm run build  # 生產建構
npm run start  # 生產模式啟動
npm run lint   # ESLint 檢查
```

## 關鍵規則

- 認證 token 存在 cookie `tickeasy_token`，不是 Supabase Session。讀取用 `getAuthToken()`（`lib/auth-utils.ts`）
- 寫入操作（審核、角色修改）必須透過 API Route proxy，不可從 Server Component 直接呼叫後端（避免 CORS）
- Supabase client 分瀏覽器版（`lib/supabase/client.ts`）和 Server Component 版（`lib/supabase/server.ts`），不可混用
- 所有對後端的 API 呼叫需加上 `Authorization: Bearer <token>` header
- 功能開發使用 `docs/plans/` 記錄計畫；完成後移至 `docs/plans/archive/`

## 詳細文件

- @docs/README.md — 項目介紹與快速開始
- @docs/ARCHITECTURE.md — 架構、目錄結構、資料流
- @docs/DEVELOPMENT.md — 開發規範、命名規則、環境變數
- @docs/FEATURES.md — 功能列表與行為描述
- @docs/TESTING.md — 測試規範與指南
- @docs/CHANGELOG.md — 更新日誌

## 必要遵守項目

- 新增 `/dashboard` 子路由前，確認 `middleware.ts` 的 matcher 不需要調整
- 前端登入 URL（`https://frontend-amber.onrender.com/login`）目前硬編碼在多處，環境切換需全部更新（未來應改 `NEXT_PUBLIC_FRONTEND_URL` 環境變數）
- `actions/` 目錄下的 Server Actions 目前已被 API Routes 取代，不可直接使用
- 用戶角色修改只允許 `superuser` 操作；API Route 本身不驗證權限（驗證在後端），前端 UI 應控制顯示
- `lib/supabase/middleware.ts` 內的 Supabase Auth session 更新邏輯已全數註解，勿還原
