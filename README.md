# Tickeasy Dashboard - 演唱會售票後台管理系統

<div align="center">
  <img src="public/logo.png" alt="Tickeasy Logo" width="200" />
  
  ### 🎵 專業的演唱會售票管理平台
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2.1-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📖 專案簡介

Tickeasy Dashboard 是一個功能完整的演唱會售票網站後台管理系統，專為演唱會主辦單位和平台管理者設計。系統提供演唱會審核、用戶管理、訂單追蹤等核心功能，採用現代化的技術棧構建，提供直觀易用的管理界面。

### 🌟 核心特色

- **🔒 跨域認證整合**：與前端網站共用認證系統，單一登入即可使用
- **📊 即時數據統計**：提供完整的數據分析和可視化儀表板
- **🎯 角色權限管理**：精細的角色權限控制系統
- **🌙 深色模式支援**：內建明暗主題切換功能
- **📱 響應式設計**：完美支援各種裝置尺寸

## ✨ 功能模組

### 🎵 演唱會管理模組
- **演唱會列表**
  - 多條件篩選
- **演唱會詳情**
  - 基本資訊管理
  - 主辦單位資訊
  - 場地與座位配置
- **審核流程**
  - 四階段審核狀態：草稿、審核中、已發布、已拒絕
  - 審核歷史記錄追蹤
  - 審核備註功能

### 👥 用戶管理模組
- **用戶列表**
  - 查看所有註冊用戶
  - 搜尋與篩選功能
- **角色管理**
  - 三種角色類型：一般用戶、管理員、超級管理員

### 📋 訂單管理模組
- **訂單狀態管理**
  - 五種狀態：保留中、已過期、已付款、已取消、已退款
- **訂單詳情**
  - 購買人完整資訊
  - 票券明細與座位資訊
  - 發票資訊管理
  - 付款方式追蹤

## 🛠 技術架構

### 前端技術
| 技術 | 版本 | 說明 |
|------|------|------|
| **Next.js** | 14.2.1 | React 全棧框架，支援 App Router |
| **React** | 18.2.0 | 用戶界面庫 |
| **TypeScript** | 5.x | 類型安全的 JavaScript |
| **Tailwind CSS** | 3.4.1 | 實用優先的 CSS 框架 |
| **shadcn/ui** | latest | 高品質 React 組件庫 |

### UI/UX 套件
| 套件 | 用途 |
|------|------|
| **Lucide React** | 美觀的圖標庫 |
| **next-themes** | 深色模式支援 |
| **sonner** | Toast 通知組件 |
| **@tanstack/react-table** | 強大的表格組件 |
| **date-fns** | 日期處理工具 |

### 後端整合
| 技術 | 說明 |
|------|------|
| **Supabase** | BaaS 平台，提供認證、資料庫、即時功能 |
| **PostgreSQL** | 關聯式資料庫（透過 Supabase） |
| **Custom API** | 自訂後端 API 服務 |
| **JWT** | JSON Web Token 認證機制 |

### 開發工具
| 工具 | 用途 |
|------|------|
| **ESLint** | 程式碼品質檢查 |
| **TypeScript** | 靜態類型檢查 |
| **Turbopack** | 快速開發伺服器 |

## 🚀 快速開始

### 系統需求
- **Node.js** 18.0 或以上版本
- **npm** / **yarn** / **pnpm** 任一套件管理器
- **Git** 版本控制工具

### 安裝步驟

#### 1. 複製專案
```bash
git clone https://github.com/your-username/tickeasy_team_dashboard.git
cd tickeasy_team_dashboard
```

#### 2. 安裝相依套件
```bash
npm install
# 或使用 yarn
yarn install
# 或使用 pnpm
pnpm install
```

#### 3. 環境變數設定
複製環境變數範本：
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，填入必要的環境變數：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API 配置
NEXT_PUBLIC_API_URL=https://tickeasy-amber-backend.onrender.com

# 前端網址（用於跨域認證）
NEXT_PUBLIC_FRONTEND_URL=https://frontend-amber.onrender.com
```

#### 4. 啟動開發伺服器
```bash
npm run dev
# 或使用 yarn
yarn dev
# 或使用 pnpm
pnpm dev
```

#### 5. 開啟應用程式
在瀏覽器中訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
tickeasy_team_dashboard/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (dashboard)/             # Dashboard 路由群組
│   │   └── 📁 dashboard/           # Dashboard 頁面
│   │       ├── 📁 concerts/        # 演唱會管理
│   │       │   ├── page.tsx        # 演唱會列表
│   │       │   └── [id]/          # 演唱會詳情
│   │       ├── 📁 orders/          # 訂單管理
│   │       │   ├── page.tsx        # 訂單列表
│   │       │   └── [id]/          # 訂單詳情
│   │       ├── 📁 users/           # 用戶管理
│   │       │   ├── page.tsx        # 用戶列表
│   │       │   └── [id]/          # 用戶詳情
│   │       └── page.tsx            # Dashboard 首頁
│   ├── 📁 auth/                    # 認證相關頁面
│   │   ├── login/                  # 登入頁面（已隱藏）
│   │   └── register/               # 註冊頁面（已隱藏）
│   ├── layout.tsx                  # 根佈局
│   ├── page.tsx                    # 首頁（重定向至 Dashboard）
│   └── globals.css                 # 全域樣式
├── 📁 components/                  # React 組件
│   ├── 📁 ui/                      # shadcn/ui 基礎組件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── 📁 concerts/                # 演唱會相關組件
│   │   ├── concert-list.tsx
│   │   ├── concert-detail.tsx
│   │   └── review-dialog.tsx
│   ├── 📁 orders/                  # 訂單相關組件
│   │   ├── order-list.tsx
│   │   └── order-detail.tsx
│   ├── 📁 users/                   # 用戶相關組件
│   │   ├── user-list.tsx
│   │   └── user-form.tsx
│   └── 📁 dashboard/               # Dashboard 組件
│       ├── navbar.tsx              # 導航欄
│       ├── sidebar.tsx             # 側邊欄
│       └── stats-cards.tsx         # 統計卡片
├── 📁 lib/                         # 工具函式庫
│   ├── 📁 types/                   # TypeScript 類型定義
│   │   ├── concert.ts              # 演唱會類型
│   │   ├── order.ts                # 訂單類型
│   │   └── user.ts                 # 用戶類型
│   ├── 📁 supabase/                # Supabase 配置
│   │   ├── client.ts               # 客戶端配置
│   │   └── server.ts               # 伺服器端配置
│   ├── auth-utils.ts               # 認證工具函式
│   └── utils.ts                    # 通用工具函式
├── 📁 actions/                     # Server Actions
│   ├── concerts.ts                 # 演唱會相關 Actions
│   └── users.ts                    # 用戶相關 Actions
├── 📁 docs/                        # 專案文檔
│   ├── auth-system-changes.md      # 認證系統變更說明
│   └── supabase.sql               # 資料庫結構
├── 📁 public/                      # 靜態資源
│   ├── logo.png
│   └── ...
├── middleware.ts                   # Next.js 中間件（認證處理）
├── components.json                 # shadcn/ui 配置
├── tailwind.config.ts             # Tailwind CSS 配置
├── tsconfig.json                  # TypeScript 配置
└── package.json                   # 專案配置
```

## 🔐 認證系統

### 跨域認證機制

本系統實施了與前端網站共用的認證機制：

1. **統一登入入口**
   - 所有登入都必須通過前端網站進行
   - 後台登入頁面已被隱藏（但保留程式碼）

2. **Token 傳遞流程**
   ```
   前端登入 → 獲取 JWT Token → 攜帶 Token 跳轉後台 → 後台驗證並儲存
   ```

3. **中間件處理**
   - 檢查 Cookie 中的 `tickeasy_token`
   - 處理 URL 參數中的 token
   - 自動重定向未認證用戶

### 用戶角色與權限

| 角色 | 權限說明 |
|------|----------|
| **user** | 一般用戶，僅有查看權限 |
| **admin** | 管理員，可進行審核和管理操作 |
| **superuser** | 超級管理員，擁有所有權限 |

### API 認證

所有 API 請求都需要在 Header 中攜帶 Bearer Token：

```typescript
const response = await fetch(`${API_URL}/api/v1/concerts`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## 🧪 開發指南

### 程式碼規範

1. **命名規則**
   - 組件：PascalCase（如 `ConcertList.tsx`）
   - 檔案：kebab-case（如 `concert-list.tsx`）
   - 函式：camelCase（如 `getConcertById`）
   - 常數：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

2. **TypeScript 使用**
   - 所有組件都需要定義 Props 類型
   - 使用 `interface` 定義物件類型
   - 避免使用 `any` 類型

3. **組件開發**
   ```typescript
   // 範例：定義組件 Props
   interface ConcertCardProps {
     concert: Concert;
     onEdit?: (id: string) => void;
     className?: string;
   }
   
   export function ConcertCard({ concert, onEdit, className }: ConcertCardProps) {
     // 組件邏輯
   }
   ```

### 新增 shadcn/ui 組件

```bash
# 使用 CLI 新增組件
npx shadcn@latest add [component-name]

# 範例：新增 Alert 組件
npx shadcn@latest add alert
```

### Git 工作流程

1. **分支命名**
   - 功能：`feature/concert-filter`
   - 修復：`fix/order-status-bug`
   - 優化：`refactor/api-structure`

2. **提交訊息格式**
   ```
   <type>(<scope>): <subject>
   
   範例：
   feat(concerts): 新增演唱會搜尋功能
   fix(orders): 修復訂單狀態更新錯誤
   docs(readme): 更新安裝說明
   ```

### 環境部署

#### 建置專案
```bash
npm run build
```

#### 啟動生產環境
```bash
npm run start
```

#### Docker 部署（可選）
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 資料庫結構

主要資料表包括：

- **users** - 用戶資料
- **concerts** - 演唱會資訊
- **organizations** - 主辦單位
- **venues** - 場地資訊
- **orders** - 訂單記錄
- **ticket_types** - 票種設定
- **concert_sessions** - 場次資訊

---

<div align="center">
  Made with ❤️ by Tickeasy Team
  
  © 2025 Tickeasy. All rights reserved.
</div>
