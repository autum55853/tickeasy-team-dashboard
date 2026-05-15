# TESTING.md

## 目前狀態

已建立完整測試框架：**Vitest**（單元 / 整合）+ **Playwright**（E2E）。

## 測試框架

| 層次 | 框架 | 設定檔 |
|------|------|--------|
| 單元 / 整合 | Vitest + @testing-library/react | `vitest.config.ts` |
| E2E | Playwright | `playwright.config.ts` |

## 指令

```bash
npm run test              # 所有單元測試（跑一次）
npm run test:watch        # 監看模式（開發中用）
npm run test:coverage     # 產生覆蓋率報告（≥ 80% 門檻）
npm run test:e2e          # E2E 測試（需先啟動 dev server）
```

## 目錄結構

```
tests/
├── setup.ts                              # @testing-library/jest-dom 初始化
├── unit/
│   ├── auth-utils.test.ts                # lib/auth-utils.ts（P1）
│   ├── middleware.test.ts                # middleware.ts（P2）
│   ├── api/
│   │   ├── concerts-review.test.ts       # /dashboard/concerts/review（P1）
│   │   └── users-update-role.test.ts     # /dashboard/users/update-role（P1）
│   └── components/
│       ├── role-switcher.test.tsx        # components/users/role-switcher（P2）
│       ├── concert-review-panel.test.tsx # components/concerts/concert-review-panel（P2）
│       └── concert-review-actions.test.tsx  # components/concerts/concert-review-actions（P3）
└── e2e/
    ├── auth.spec.ts                      # 認證流程
    └── dashboard.spec.ts                 # 各頁面主要路徑
```

## 優先順序

| 優先 | 測試標的 | 原因 |
|------|----------|------|
| P1 | `lib/auth-utils.ts` | 影響所有頁面認證，邏輯複雜 |
| P1 | API Routes（review / update-role） | 唯一的寫入路徑，需驗證 401/400/500 |
| P2 | `middleware.ts` | 保護 /dashboard 入口，邊界條件重要 |
| P2 | `RoleSwitcher`、`ConcertReviewPanel` | 核心互動 UI |
| P3 | `ConcertReviewActions` | Dialog 確認流程 |

## 覆蓋率目標

核心模組（auth-utils、API routes）維持 **≥ 80%** 行覆蓋率。
`components/ui/`（shadcn/ui 元件）排除在覆蓋率計算外。

## 測試認證注意事項

- `getAuthToken()` 依賴 `document.cookie`，測試時用 `document.cookie = '...'` 設定
- `handleCrossDomainAuth()` 呼叫 `window.history.replaceState()`，jsdom 已支援
- API Routes 測試：用 `vi.stubGlobal('fetch', vi.fn())` mock 後端 fetch
- E2E：用 `page.context().addCookies()` 注入 `tickeasy_token` 繞過 middleware

## Mock 策略速查

| 場景 | Mock 方法 |
|------|-----------|
| 後端 fetch（單元） | `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(...))` |
| `getAuthToken()` | `vi.mock('@/lib/auth-utils', () => ({ getAuthToken: vi.fn(() => 'fake-token') }))` |
| `sonner` toast | `vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))` |
| Radix Dialog（元件） | `vi.mock('@/components/ui/dialog', ...)` 換成簡單 HTML wrapper |
| next/cache | `vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))` |
| E2E 認證 | `page.context().addCookies([{ name: 'tickeasy_token', ... }])` |

## 常見陷阱

- **Supabase client**：Server Component 在 jsdom 無法直接測試，需 mock 或抽出邏輯
- **Radix UI Select**：jsdom 中難以觸發開啟事件，改測 fetch 呼叫側效果
- **next/server（NextRequest / NextResponse）**：可直接在 Vitest 中 import，不需額外 mock
- **E2E token**：測試用的假 token 無法通過後端驗證，Supabase 查詢可能失敗；E2E 應針對 UI 渲染而非資料準確性
