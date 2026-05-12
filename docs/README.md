# Tickeasy Dashboard

Tickeasy 演唱會票務系統後台管理介面，供管理員執行用戶管理、演唱會審核、訂單查閱等操作。

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 14.2.1（App Router + Turbopack） |
| 語言 | TypeScript 5 |
| UI | Tailwind CSS 3 + shadcn/ui（Radix UI） |
| 資料庫 | Supabase（@supabase/ssr + supabase-js） |
| 表格 | TanStack Table v8 |
| 通知 | sonner |
| 圖示 | lucide-react |
| 日期 | date-fns |
| 主題 | next-themes（亮/暗模式） |

## 快速開始

```bash
# 安裝依賴
npm install

# 建立環境變數
cp .env.example .env.local
# 填入 NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、NEXT_PUBLIC_API_URL

# 啟動開發伺服器
npm run dev
# 開啟 http://localhost:3000
```

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發伺服器（Turbopack，port 3000） |
| `npm run build` | 生產建構 |
| `npm run start` | 生產模式啟動 |
| `npm run lint` | ESLint 檢查 |

## 進入後台

後台本身無獨立登入介面。需從前端（`https://frontend-fz4o.onrender.com`）以管理員身份登入後，點擊「後台管理」按鈕跳轉。跳轉時前端帶上 `?token=<jwt>&userInfo=<encoded>` 參數，後台自動接收並設定 Cookie。

## 文件索引

| 文件 | 說明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架構、目錄結構、認證機制、資料庫 Schema |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 開發規範、命名規則、環境變數、新增功能步驟 |
| [FEATURES.md](./FEATURES.md) | 功能清單與行為描述 |
| [TESTING.md](./TESTING.md) | 測試規範與指南 |
| [CHANGELOG.md](./CHANGELOG.md) | 更新日誌 |
| [supabase.sql](./supabase.sql) | 完整資料庫 Schema |
| [auth-system-changes.md](./auth-system-changes.md) | 認證系統修改說明 |

## 相關系統

| 系統 | URL |
|------|-----|
| 前端應用 | https://frontend-fz4o.onrender.com |
| 後端 API | https://tickeasy-team-backend.onrender.com |
| Supabase 控制台 | https://supabase.com/dashboard |
