# 跨域跨分頁登出同步

## Context

管理員從前台登入後進入後台 Dashboard，後台登出時只清除後台自身的 Cookie/localStorage。若前台同時在另一個分頁開著，前台不知道已登出，仍顯示用戶已登入。需要在後台登出時，同步通知前台所有分頁執行登出。

## 方案：Hidden Iframe + BroadcastChannel

```
後台 clearAuthData()
    │
    ├─ 建立隱藏 iframe（src = frontend/auth/logout-broadcast）
    │       ↓ iframe 在前台 origin 執行
    │       ├─ localStorage.removeItem('tickeasy_token') 等前台清除
    │       └─ BroadcastChannel('tickeasy_auth').postMessage({ type: 'LOGOUT' })
    │                  ↓ 廣播到前台所有同 origin 分頁
    │
    ├─ iframe.onload → 後台本地清除 + window.location → 前台 /login
    └─ setTimeout 4000ms fallback（防 iframe 載入失敗卡住）
```

BroadcastChannel 不支援（Safari 15.3 以前）：使用 StorageEvent fallback（寫入/清除 `tickeasy_logout` key）。

## 改動清單

### Dashboard 側（此 repo）

**`lib/auth-utils.ts`** — clearAuthData 改為 iframe 方案

```
1. 建立 performLocalCleanup(iframe) helper：清 localStorage + cookie + 移除 iframe + 跳轉 /login
2. 建立隱藏 iframe，src = ${NEXT_PUBLIC_FRONTEND_URL}/auth/logout-broadcast
3. setAttribute('sandbox', 'allow-scripts allow-same-origin')
4. setTimeout 4000ms fallback → performLocalCleanup(iframe)
5. iframe.onload = () => { clearTimeout(timer); performLocalCleanup(iframe); }
6. iframe.onerror = () => { clearTimeout(timer); performLocalCleanup(iframe); }
7. document.body.appendChild(iframe)
```

**`components/dashboard/navbar.tsx`** — 移除重複登出邏輯

```
1. import clearAuthData from "@/lib/auth-utils"
2. handleLogout 改為 clearAuthData() 單一呼叫
3. 移除手動 localStorage.removeItem 和 cookie 清除程式碼
```

**`tests/unit/auth-utils.test.ts`** — 補充 clearAuthData iframe 測試

```
- mock document.createElement，驗證建立 iframe
- fake timer 驗證 4000ms fallback 觸發
- mock iframe.onload 驗證正常流程清除 localStorage + cookie + 跳轉
```

---

### Frontend 側（前台 repo）

**新增 `app/auth/logout-broadcast/page.tsx`**（Client Component）

```
useEffect:
1. 清除前台 localStorage（tickeasy_token、tickeasy_user 等）
2. 清除前台 cookie（tickeasy_token）
3. new BroadcastChannel('tickeasy_auth').postMessage({ type: 'LOGOUT', timestamp: Date.now() })
4. setTimeout(() => channel.close(), 100)
5. [StorageEvent fallback] 也同步 localStorage.setItem('tickeasy_logout', Date.now().toString())

render: 回傳空 <div />（iframe 內容，無需 UI）
```

確認此路由在前台 middleware 的 public 白名單（不需認證即可訪問）。

**新增 `components/auth/auth-sync-provider.tsx`**（Client Component）

```
useEffect:
1. BroadcastChannel 支援 → channel.onmessage 收到 LOGOUT → performFrontendLogout()
2. 不支援 → window.addEventListener('storage', ...)，key==='tickeasy_logout' → performFrontendLogout()
3. 冪等保護：若已在 /login 則不重複跳轉
4. cleanup：channel.close() / removeEventListener

performFrontendLogout:
- 清除前台 localStorage + cookie
- window.location.href = '/login'
```

**`app/layout.tsx`** — 在 body 內加入 `<AuthSyncProvider />`

## Edge Cases

| 場景 | 處理 |
|------|------|
| iframe 載入失敗 | 4s timeout fallback，後台正常完成登出 |
| BroadcastChannel 不支援 | StorageEvent fallback（tickeasy_logout key） |
| 前台無開啟分頁 | 無影響 |
| 前台 /auth/logout-broadcast 需要認證 | 前台 middleware 加白名單 |

## 驗證

1. 前台登入（分頁A），後台另一分頁B 開著
2. 後台 B 點登出
3. 預期：後台 B 短暫停頓（iframe 載入）→ 跳轉前台 /login；前台 A 幾乎同步跳轉 /login
4. DevTools Network：確認有對 `frontend/auth/logout-broadcast` 的請求（200）
5. Fallback 測試：`delete window.BroadcastChannel` 後重試，確認 StorageEvent fallback 運作
6. Timeout 測試：斷網後登出，確認 4 秒後後台仍完成跳轉
