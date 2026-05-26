# Plan: Venues 管理介面

**狀態**: 完成（2026-05-26）

## Context

venues 資料只在演唱會列表/詳情中被動顯示。管理員無法直接檢視或修改場地資訊。本功能新增獨立的 `/dashboard/venues` 頁面，讓管理員可以瀏覽所有場地並透過 Dialog 編輯欄位。

## 架構決策

- 後端有 `PATCH /api/v1/venues/{venueId}` — 使用 API Route proxy 模式（與 concerts/review、users/update-role 一致）
- UI：列表頁 + 編輯 Dialog（與現有 review-dialog 模式相同）
- `Venue` 型別已存在於 `lib/types/concert.ts`，直接沿用

---

## 實作步驟

### 1. API Route Proxy
**建立** `app/(dashboard)/dashboard/venues/update/route.ts`
- `POST` handler（接收 `venueId` + 所有可更新欄位）
- 驗證 `authorization` header（無 → 401）
- 轉發 `PATCH ${NEXT_PUBLIC_API_URL}/api/v1/venues/{venueId}`
- 成功後 `revalidatePath("/dashboard/venues")`
- 回應格式：`{ success: boolean, error?: string }`

### 2. Server Component 頁面
**建立** `app/(dashboard)/dashboard/venues/page.tsx`
- `export const dynamic = "force-dynamic"`
- 用 `createAdminClient()` 查詢 `venues` table（`select("*").order("venueName")`）
- 渲染 `<VenueTable venues={venues} />`

### 3. VenueTable Client Component
**建立** `components/venues/venue-table.tsx`
- 搜尋框（依 venueName / venueAddress 篩選）
- shadcn/ui Table：場地名稱、地址、容納人數、無障礙、停車場、大眾交通、操作
- 點擊「編輯」開啟 `VenueEditDialog`
- 編輯成功後 optimistic update 本地 state

### 4. VenueEditDialog Client Component
**建立** `components/venues/venue-edit-dialog.tsx`
- 表單欄位：`venueName`（必填）、`venueDescription`、`venueAddress`（必填）、`venueCapacity`、`venueImageUrl`、`googleMapUrl`、`isAccessible`、`hasParking`、`hasTransit`
- Submit 呼叫 `POST /dashboard/venues/update`（帶 Bearer token）
- 成功 → `toast.success` + `onSave(updatedVenue)` + 關閉
- 失敗 → `toast.error`
- Loading state 防止重複提交

### 5. Navbar 更新
**修改** `components/dashboard/navbar.tsx`
- navItems 加入 `{ href: "/dashboard/venues", label: "場地管理" }`（在演唱會管理之後）

---

## 完成的檔案

| 動作 | 路徑 |
|------|------|
| 建立 | `app/(dashboard)/dashboard/venues/page.tsx` |
| 建立 | `app/(dashboard)/dashboard/venues/update/route.ts` |
| 建立 | `components/venues/venue-table.tsx` |
| 建立 | `components/venues/venue-edit-dialog.tsx` |
| 修改 | `components/dashboard/navbar.tsx` |

## 重用的工具 / 型別

| 來源 | 用途 |
|------|------|
| `lib/types/concert.ts` → `Venue` | 型別定義 |
| `lib/supabase/server.ts` → `createAdminClient()` | Server Component 查詢（繞過 RLS） |
| `lib/auth-utils.ts` → `getAuthToken()` | Dialog 取 token |
| `components/ui/dialog` | Edit Dialog wrapper |
| `components/ui/table` | 列表 Table |
| `components/ui/badge` | 布林值顯示 |
| `sonner` → `toast` | 操作結果通知 |
