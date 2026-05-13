# 測試規範建立計畫

## User Story

作為開發人員，我希望專案有完整的測試基礎設施，
使我能在修改核心邏輯（認證、API Proxy、審核流程）時快速驗證正確性，
並在 CI 環境自動化把關品質。

## 背景 / 動機

- 專案原本僅有 `npm run lint`（ESLint），無任何測試
- 核心認證邏輯（`auth-utils.ts`、`middleware.ts`）影響所有頁面，一旦錯誤影響面大
- API Routes 是唯一的寫入路徑，401/400/500 邊界條件需要保障
- 審核流程（ConcertReviewPanel）有複雜的條件渲染邏輯

## 技術選型

| 層次 | 框架 | 理由 |
|------|------|------|
| 單元 / 整合 | Vitest + @testing-library/react | Next.js 相容性佳、速度快、API 與 Jest 相容 |
| E2E | Playwright | 支援多瀏覽器、可模擬 Cookie 注入，解決跨域認證問題 |

## Spec

### Phase 1：安裝與設定

**安裝依賴**
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
npm install -D @playwright/test
```

**新增設定檔**
- `vitest.config.ts`：jsdom 環境、coverage 門檻 80%、`@` 路徑別名
- `playwright.config.ts`：testDir `./tests/e2e`、webServer port 3000
- `tests/setup.ts`：`@testing-library/jest-dom` 初始化

**更新 `package.json` scripts**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

### Phase 2：單元測試

**P1 — `lib/auth-utils.ts`**（`tests/unit/auth-utils.test.ts`）

| 測試案例 | 驗證項目 |
|----------|----------|
| URL 有 token + userInfo | 寫入 cookie、localStorage、清除 URL params |
| URL 無參數 | 不寫入，回 false |
| URL 只有 token 無 userInfo | 不寫入，回 false |
| 損毀 JSON | 不拋錯，回 false |
| Cookie 存在 | getAuthToken 回正確值 |
| Cookie 不存在 | getAuthToken 回 null |
| localStorage 合法 JSON | getCurrentUser 回物件 |
| localStorage 損毀 JSON | getCurrentUser 回 null |
| clearAuthData | 清除 Cookie + localStorage + location.href |

**P1 — API Routes**（`tests/unit/api/`）

concerts/review：401（無 header）、500（後端失敗）、200（成功）
users/update-role：401（無 header）、400（缺參數）、200（成功）、403（後端拒絕）

**P2 — `middleware.ts`**（`tests/unit/middleware.test.ts`）

Cookie 存在→放行、URL token→Set-Cookie + redirect、都無→redirect 登入、非 /dashboard→放行

**P2 — 元件**

- `RoleSwitcher`：渲染、loading 禁用
- `ConcertReviewPanel`：pending→顯示 Actions，其他→隱藏

**P3 — `ConcertReviewActions`**

通過/拒絕→開 Dialog、備註空→toast.error 不送、有備註→呼叫 onReviewComplete、API 失敗→toast.error

### Phase 3：E2E 測試

**`tests/e2e/auth.spec.ts`**
- 無 token → redirect 前端登入
- URL token → Cookie 寫入、URL 清除
- 注入 Cookie → 不 redirect

**`tests/e2e/dashboard.spec.ts`**（需先注入 Cookie）
- /dashboard → 四個 StatsCard
- /dashboard/users → 用戶管理標題
- /dashboard/concerts → 演唱會管理標題
- /dashboard/orders → 訂單管理標題

## Tasks

- [x] 安裝 vitest + testing-library devDependencies
- [x] 安裝 @playwright/test
- [x] 建立 vitest.config.ts
- [x] 建立 playwright.config.ts
- [x] 建立 tests/setup.ts
- [x] 更新 package.json scripts
- [x] 寫 tests/unit/auth-utils.test.ts（P1）
- [x] 寫 tests/unit/api/concerts-review.test.ts（P1）
- [x] 寫 tests/unit/api/users-update-role.test.ts（P1）
- [x] 寫 tests/unit/middleware.test.ts（P2）
- [x] 寫 tests/unit/components/role-switcher.test.tsx（P2）
- [x] 寫 tests/unit/components/concert-review-panel.test.tsx（P2）
- [x] 寫 tests/unit/components/concert-review-actions.test.tsx（P3）
- [x] 寫 tests/e2e/auth.spec.ts
- [x] 寫 tests/e2e/dashboard.spec.ts
- [x] 更新 docs/TESTING.md

## 驗證方式

1. `npm run test` → 所有單元測試通過
2. `npm run test:coverage` → 核心模組覆蓋率 ≥ 80%
3. `npm run dev` + `npm run test:e2e` → E2E 全過
4. `npm run build` → 建構無錯
