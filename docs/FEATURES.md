# FEATURES.md

## 功能總覽

| 功能 | 路徑 | 狀態 |
|------|------|------|
| 儀表板統計 | `/dashboard` | 完成 |
| 用戶管理 | `/dashboard/users` | 完成 |
| 演唱會管理（列表） | `/dashboard/concerts` | 完成 |
| 演唱會管理（詳情 + 審核） | `/dashboard/concerts/[id]` | 完成 |
| 訂單管理 | `/dashboard/orders` | 完成 |
| 跨域認證 | middleware + layout | 完成 |

---

## 認證機制（跨域）

### 行為描述

後台無獨立登入頁面。認證完全依賴前端傳遞：

1. 前端管理員點擊「後台管理」，帶 `?token=<jwt>&userInfo=<url-encoded-json>` 跳轉後台
2. Middleware 攔截，讀取 `?token=` 寫入 Cookie `tickeasy_token`（1 天），redirect 到乾淨 URL
3. Dashboard layout 的 `handleCrossDomainAuth()` 再次讀取 URL params（若 middleware 未處理時的備援），寫入 localStorage
4. 後續每次 `/dashboard` 請求，middleware 檢查 Cookie 是否存在，無則重導向前端登入

### 錯誤情境

| 情境 | 結果 |
|------|------|
| Cookie 不存在 + 無 URL token | 302 → `https://frontend-amber.onrender.com/login?next=<原始URL>` |
| 直接訪問 `/auth/login` | 2 秒後導向前端登入 |
| JWT 過期（後端驗證失敗） | API 回 401，前端顯示錯誤 toast |

---

## 儀表板

### 行為描述

Server Component 並行查詢 Supabase 四項資料：

- 總用戶數：`users` table count
- 總演唱會數：`concert` table count
- 總訂單數：`order` table count
- 待審核數：`concert` where `conInfoStatus = 'reviewing'`（動態計算 reviewing 狀態數量）

統計卡片 (`StatsCard`) 顯示數值 + 圖示 + 描述，待審核 > 0 時 card border 變橙色。

---

## 用戶管理

### 行為描述

- Server Component 從 Supabase 讀取所有用戶，按 `createdAt` 降序排列
- Client Component `UserTable` 使用 TanStack Table 渲染，支援欄位排序
- 每行有 `RoleSwitcher` 下拉選單（user/admin/superuser）

### 角色修改流程

1. 用戶選擇新角色 → `RoleSwitcher.handleRoleChange()`
2. 讀取 Cookie token → `POST /dashboard/users/update-role`（帶 Authorization header）
3. API Route 轉發 → `PATCH https://tickeasy-amber-backend.onrender.com/api/v1/users/{userId}/role`
4. 成功 → 前端更新本地狀態 + sonner toast「角色更新成功」
5. 失敗 → sonner toast 顯示錯誤訊息

### 業務邏輯

- 後端驗證操作者必須是 `superuser`，前端不額外驗證（依賴後端）
- 角色更新後不重新 fetch 用戶列表，只更新本地 React state

### 請求格式

```json
POST /dashboard/users/update-role
Authorization: Bearer <token>
{ "userId": "uuid", "newRole": "user" | "admin" | "superuser" }
```

---

## 演唱會管理

### 列表頁行為描述

- Server Component 從 Supabase 查詢所有演唱會，JOIN organization 和 venue
- 計算各狀態統計（draft/reviewing/published/rejected/finished/pending_review）
- Client Component `ConcertTable` + `ConcertFilters` 支援前端篩選

### 演唱會狀態流程

```
draft → reviewing（主辦方提交）→ published / rejected（管理員審核）→ finished
```

`conInfoStatus`：演唱會整體狀態
`reviewStatus`：當前審核輪次狀態（pending/approved/rejected/skipped）

只有 `reviewStatus = 'pending'` 時，審核操作區塊才顯示。

### 詳情頁行為描述

- Server Component 呼叫後端 API 取得完整演唱會資料（含 sessions，因 Supabase 直連較複雜）
- 顯示基本資訊、場地、主辦單位、場次與票價
- `ConcertReviewPanel` 包含：
  - `ConcertReviewHistory`：歷史審核紀錄列表
  - `ConcertReviewActions`：通過/拒絕操作（僅 reviewStatus = 'pending' 時顯示）

### 審核操作流程

1. 管理員點擊「通過」或「拒絕」→ 開啟確認對話框（可填入審核備註）
2. 確認後 → `POST /dashboard/concerts/review`（帶 Authorization header）
3. API Route 轉發 → `POST https://tickeasy-amber-backend.onrender.com/api/v1/concerts/{id}/manual-review`
4. 成功 → 更新本地 reviewStatus 狀態 + refreshKey（觸發 `ConcertReviewHistory` 重新 fetch）
5. 審核操作區塊隱藏（因 reviewStatus 不再是 'pending'）

### 請求格式

```json
POST /dashboard/concerts/review
Authorization: Bearer <token>
{
  "concertId": "uuid",
  "reviewStatus": "approved" | "rejected",
  "reviewerNote": "審核備註（選填）"
}
```

---

## 訂單管理

### 行為描述

- Server Component 從 Supabase 查詢所有訂單，JOIN user 和 ticketType
- 計算各狀態統計（held/expired/paid/cancelled/refunded）
- `StatsCard` 顯示統計，held > 0 顯示黃色 border，expired > 0 顯示橙色 border，paid 顯示綠色 border
- `OrderTable` 顯示訂單列表（Client Component，支援篩選）

### 訂單狀態說明

| 狀態 | 說明 |
|------|------|
| held | 保留中（尚未付款） |
| expired | 保留已過期 |
| paid | 已付款 |
| cancelled | 已取消 |
| refunded | 已退款 |

---

## Navbar

### 行為描述

- Client Component，掛載後呼叫後端 API 取得最新用戶資訊
- `GET https://tickeasy-amber-backend.onrender.com/api/v1/users/profile`（帶 Authorization header）
- API 失敗時 fallback 到 `localStorage.tickeasy_user`
- 顯示：用戶頭像（Radix Avatar）、用戶名稱（name 或 nickname）、角色 badge（superuser 才顯示）
- 登出按鈕 → `clearAuthData()`（清除 Cookie + localStorage，導向前端登入）
- 導覽項目：用戶管理 / 演唱會管理 / 訂單管理（active 狀態根據 pathname）
