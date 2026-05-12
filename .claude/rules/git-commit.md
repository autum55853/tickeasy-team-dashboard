---
# 全域規則（無 paths 限制）
---

# Git Commit 規則

## Commit Message 格式

```
<type>: <中文描述>
```

## Type 類型

| type | 使用時機 |
|------|---------|
| feat | 新功能 |
| fix | Bug 修復 |
| refactor | 重構（不影響功能） |
| style | 樣式調整（CSS、格式） |
| docs | 文件更新 |
| chore | 設定、依賴更新 |
| perf | 效能優化 |

## 範例

```
feat: 新增演唱會審核歷史紀錄元件
fix: 修正跨域認證 token 寫入 Cookie 失敗的問題
refactor: 將角色更新邏輯從 Server Action 改為 API Route
docs: 更新 ARCHITECTURE.md 認證機制說明
chore: 更新 next 至 14.2.1
```

## 禁止 Commit 的檔案

- `.env.local`、`.env`（含 Supabase key）
- `package-lock.json`（除非修改了 dependencies）的重複提交
- `node_modules/`
