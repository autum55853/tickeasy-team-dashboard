# 2026-07-13 全端優化計畫（Dashboard 部分）

> 來源：2026-07-13 全專案（backend / frontend / dashboard）優化審查。
> 本檔只列 dashboard 項目；backend 與 frontend 項目見各自 repo 的 `docs/plans/2026-07-13-optimization.md`。
> 完成後移至 `docs/plans/archive/`。

## 優先序總覽

| # | 項目 | 類別 | 嚴重度 | 狀態 |
|---|------|------|--------|------|
| 1 | 升級 Next.js ≥ 14.2.25（CVE-2025-29927 middleware 認證繞過） | 安全 | 🔴 最高 | 待處理 |
| 2 | 依賴版本鎖定（移除 `"latest"`） | 安全 | 🔴 高 | 待處理 |
| 3 | React 與 @types/react 版本對齊 | 維護 | 🟡 中 | 待處理 |
| 4 | ESLint 8 → 9（與其他 repo 對齊） | 維護 | 🟢 低 | 待處理 |

---

## 1. 升級 Next.js（CVE-2025-29927）

- **問題**：現用 `next@14.2.1`。CVE-2025-29927：請求帶 `x-middleware-subrequest` header 可完全跳過 `middleware.ts` 的執行。本專案的路由保護**只有** middleware 這一層（檢查 `tickeasy_token` cookie），且 Server Component 以 service_role key 直連 Supabase 讀取全部用戶、訂單資料——繞過後未登入者可直接看到所有後台頁面資料。寫入操作因後端另驗 JWT 不受影響，但讀取面全裸。
- **做法**：升級 `next` 至 `14.2.25` 以上（同 14.2 系列 patch，破壞性風險低），`eslint-config-next` 同步升。
- **驗收**：
  - `npm run build` 過。
  - 正常登入流程（前端跳轉帶 token → cookie 寫入 → 進 dashboard）實測可用。
  - 帶 `x-middleware-subrequest: middleware` header、無 cookie 訪問 `/dashboard`，確認被導向登入頁（漏洞已堵）。
  - `npm run test` 全綠。

## 2. 依賴版本鎖定

- **問題**：`@supabase/ssr: "latest"`、`@supabase/supabase-js: "latest"`。每次 install 抓最新版：build 不可重現、上游發生供應鏈攻擊時自動吃到毒版本。
- **做法**：查 `package-lock.json` 目前實際安裝版本，改成對應的 `^x.y.z` 固定範圍。
- **驗收**：`package.json` 無任何 `"latest"`；`rm -rf node_modules && npm ci && npm run build` 過。

## 3. React 與 @types/react 對齊

- **問題**：`react: 18.2.0` 配 `@types/react: ^19`、`@types/react-dom: ^19`——執行版與型別版跨大版，會出現與實際 API 不符的型別錯誤。
- **做法**：二選一——(a) types 降回 `^18`（保守，推薦先做）；(b) React 升 19（frontend 已是 19，長期一致，但需驗 Next 14 相容性，工程量大）。本計畫採 (a)，(b) 另議。
- **驗收**：`npx tsc --noEmit` 過、`npm run build` 過。

## 4. ESLint 8 → 9

- **問題**：dashboard 用 eslint 8 + `eslint-config-next`，backend / frontend 皆 eslint 9，三 repo 兩套 config 心智。
- **做法**：隨 Next 升級順帶評估；若 `eslint-config-next` 對 flat config 支援仍麻煩，可延後，不阻塞其他項目。
- **驗收**：`npm run lint` 過，規則行為無明顯回歸。

---

## 跨 repo 項目（記錄，暫緩）

- **跨域 token 走 URL query**（`?token=<jwt>`）：留在伺服器日誌、瀏覽器歷史、Referer。長期解法：改一次性短效 code 交換。牽動三個 repo，另開計畫。
- **前端 URL 硬編碼**：`docs/DEVELOPMENT.md` 已記錄 `https://frontend-amber.onrender.com/login` 出現多處，應統一改讀 `NEXT_PUBLIC_FRONTEND_URL`（`middleware.ts` 已用 env，`lib/auth-utils.ts` 等處待清）。可與項目 1 同批順手做。

## 建議執行順序

1（Next 升級，最急）→ 2（鎖版本，與 1 同一個 commit 亦可）→ 3 → 4（選配）

每項完成即跑 `npm run lint` + `npm run test`，全綠才進下一項。
