# 後台認證系統修改說明

## 📋 修改概覽

為了實現前端與後台 Dashboard 的 Token 共用，我們對後台認證系統進行了以下修改：

### 🔄 主要變更

1. **隱藏後台登入介面**：用戶無法直接在後台登入
2. **統一登入入口**：所有登入都必須通過前端進行
3. **跨域認證支援**：後台能接收前端傳遞的認證資訊
4. **自動重定向**：未認證用戶自動導向前端登入頁面

## 📁 修改的文件

### 新增文件
- `lib/auth-utils.ts` - 跨域認證工具函數

### 修改文件
- `app/(dashboard)/layout.tsx` - 添加跨域認證處理，修改重定向邏輯
- `components/dashboard/navbar.tsx` - 修改登出重定向，隱藏登入連結
- `app/auth/login/page.tsx` - 添加自動重定向到前端

## 🔒 認證流程

### 正常流程（跨域認證）
1. 用戶在前端 (`https://frontend-amber.onrender.com`) 登入
2. 管理員點擊「後台管理」
3. 前端將 token 和用戶資訊作為 URL 參數傳遞給後台
4. 後台接收參數並設置到 localStorage
5. 清除 URL 參數，正常顯示 Dashboard

### 無認證情況
1. 直接訪問後台 Dashboard
2. 檢查到無 token
3. 自動重定向到前端登入頁面

### 直接訪問後台登入頁面
1. 顯示重定向提示訊息
2. 2 秒後自動跳轉到前端登入頁面

## 🛠️ 保留的功能

### 完整保留（隱藏但可用）
- `components/login-form.tsx` - 登入表單組件
- `app/auth/` 目錄下的所有認證相關頁面
- 原有的認證 API 和邏輯

### 如何重新啟用後台登入

如果需要重新啟用後台獨立登入功能：

1. **修改 Dashboard Layout** (`app/(dashboard)/layout.tsx`)
   ```typescript
   // 將這行
   window.location.href = "https://frontend-amber.onrender.com/login";
   // 改回
   router.replace("/auth/login");
   ```

2. **修改 Navbar** (`components/dashboard/navbar.tsx`)
   ```typescript
   // 將登出重定向改回
   router.push("/auth/login");
   // 並恢復登入連結顯示
   ```

3. **修改登入頁面** (`app/auth/login/page.tsx`)
   ```typescript
   // 移除自動重定向邏輯，恢復原始的 LoginForm 顯示
   ```

## 🔐 安全性考量

1. **URL 參數清理**：接收 token 後立即清除 URL 參數
2. **前端驗證**：只有 admin 角色才能看到「後台管理」按鈕
3. **後台驗證**：保留所有原有的權限檢查機制
4. **Token 過期**：保持原有的 token 過期和刷新機制

## 🧪 測試檢查清單

- [ ] 前端管理員能正確跳轉到後台
- [ ] 後台能正確接收並設置認證資訊
- [ ] 直接訪問後台會重定向到前端登入
- [ ] 登出功能正常，會導向前端登入
- [ ] URL 參數被正確清理
- [ ] 後台原有功能正常運作

## ⚠️ 注意事項

1. **環境相依性**：硬編碼了前端 URL，部署到不同環境時需要調整
2. **瀏覽器支援**：使用了 `window.location.href`，需要在瀏覽器環境運行
3. **備用方案**：建議保留後台登入功能以防前端故障時的緊急使用

## 📞 聯絡資訊

如有任何問題或需要修改，請聯絡開發團隊。

---
*最後更新：2025年6月17日*
