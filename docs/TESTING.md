# TESTING.md

## 目前狀態

專案**尚無測試框架**。現有 `npm run lint`（ESLint）為唯一自動化品質檢查。

## 建議引入的測試框架

| 測試類型 | 建議框架 | 說明 |
|----------|----------|------|
| 單元測試 / 整合測試 | Vitest + @testing-library/react | Next.js 相容性佳，速度快 |
| E2E 測試 | Playwright | 模擬真實認證流程 |

## 若引入 Vitest 的設定步驟

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
```

## 優先測試項目

按重要性排序：

1. **`lib/auth-utils.ts`**：`handleCrossDomainAuth()`、`getAuthToken()`、`clearAuthData()`
   - 邏輯複雜，影響所有頁面的認證
   - 需 mock `document.cookie` 和 `window.localStorage`

2. **API Routes**（`/dashboard/concerts/review`、`/dashboard/users/update-role`）
   - 驗證缺少 Authorization header 時回 401
   - 驗證轉發 body 正確

3. **`components/users/role-switcher.tsx`**：角色更新成功 / 失敗的 UI 行為

4. **`components/concerts/concert-review-panel.tsx`**：reviewStatus 為 pending 才顯示操作區塊

## 測試認證的注意事項

- `getAuthToken()` 依賴 `document.cookie`，測試時需手動設定
- `handleCrossDomainAuth()` 呼叫 `window.history.replaceState()`，需確保 jsdom 支援
- E2E 測試需模擬跨域 token 傳入流程，無法直接走正常登入介面

## 常見陷阱

- Server Components 無法用 React Testing Library 直接測試（需 mock 或抽出邏輯）
- Supabase client 在測試環境需 mock（`@supabase/supabase-js` 的 `createBrowserClient`）
- API Routes 測試需 mock `fetch`（轉發至後端的呼叫）
