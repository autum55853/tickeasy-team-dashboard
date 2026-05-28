# 計畫：前台登出 → Dashboard 自動登出（Supabase Realtime Broadcast）

## Context

前台（`frontend-amber.onrender.com`）與後台（`tickeasy-team-dashboard.onrender.com`）為不同 origin，BroadcastChannel 無法跨域使用。當前台管理員登出，Dashboard 不會自動登出，造成安全疑慮與 UX 不一致。

兩個專案皆可連接 Supabase，以 Supabase Realtime Broadcast 作為跨域訊息匯流排。前台登出時廣播 LOGOUT 事件；Dashboard 在 layout 掛載時訂閱對應 channel，收到事件後執行現有的 `clearAuthData()` 登出流程。

廣播採 **best-effort** 模式（最多等待 2 秒，逾時直接導向 /login），故 Dashboard 登出為盡力通知，不影響前台登出流程。

---

## Channel 設計

- Channel 名稱：`tickeasy-logout-${email}`（每個用戶有獨立 channel）
- Payload：`{ timestamp: number }`
- 安全性：收到事件即可觸發登出（channel 名稱已包含 email 識別，不需 payload 比對）
- 風險：知道管理員 email 者可強制登出（DoS，非資料洩漏，管理後台可接受）

---

## 受影響檔案

### 前台（tickeasy-team-frontend）

| 檔案 | 動作 |
|------|------|
| `package.json` | 新增 `@supabase/supabase-js` |
| `.env.example` | 新增 `VITE_SUPABASE_URL=`、`VITE_SUPABASE_ANON_KEY=` |
| `vitest.config.ts` | `test.env` 補 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` |
| `.github/workflows/*.yml` | 確認 `env:` 區塊是否需要新增（需查閱） |
| NEW `src/lib/supabase.ts` | Supabase client singleton |
| `src/pages/comm/views/logoutBroadcastPage.tsx` | 新增 Supabase Realtime broadcast |
| `src/pages/comm/views/__tests__/logoutBroadcastPage.test.tsx` | mock supabase + 新增廣播測試 |

### 後台（tickeasy-team-dashboard）

| 檔案 | 動作 |
|------|------|
| `app/(dashboard)/layout.tsx` | 新增第二個 useEffect 訂閱 Realtime channel |
| `tests/unit/components/dashboard-layout.test.tsx` | 新建測試（Realtime 訂閱行為） |

---

## 實作細節

### Step 1：前台安裝 Supabase

```bash
# 在 tickeasy-team-frontend 目錄
npm install @supabase/supabase-js
```

### Step 2：`src/lib/supabase.ts`（新建）

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3：`logoutBroadcastPage.tsx` 修改

```typescript
import { supabase } from "@/lib/supabase";

export default function LogoutBroadcastPage() {
  const logout = useAuthStore((state) => state.logout);
  const email = useAuthStore((state) => state.email); // 在 logout() 前捕獲
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    logout();

    // ... 現有 BroadcastChannel + localStorage fallback 邏輯不變 ...

    // Supabase Realtime 跨域廣播（best-effort，最多等 2 秒）
    const broadcastAndNavigate = async () => {
      if (email) {
        try {
          await new Promise<void>((resolve) => {
            const channel = supabase.channel(`tickeasy-logout-${email}`)
            const fallback = setTimeout(() => {
              supabase.removeChannel(channel)
              resolve()
            }, 2000)
            channel.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(fallback)
                channel.send({
                  type: 'broadcast',
                  event: 'LOGOUT',
                  payload: { timestamp: Date.now() },
                }).finally(() => {
                  supabase.removeChannel(channel)
                  resolve()
                })
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                clearTimeout(fallback)
                supabase.removeChannel(channel)
                resolve()
              }
            })
          })
        } catch {
          // best effort，忽略錯誤
        }
      }
      navigate('/login', { replace: true })
    }

    broadcastAndNavigate()
  }, [logout, email, navigate])

  return <div />
}
```

> 注意：現有的 `navigate("/login", { replace: true })` 移入 `broadcastAndNavigate()` 末尾，不再在 useEffect 直接呼叫。

### Step 4：`layout.tsx` 新增第二個 useEffect

```typescript
import { createClient } from "@/lib/supabase/client";
import { clearAuthData, getCurrentUser } from "@/lib/auth-utils";

// 第二個 useEffect（獨立，不依賴 router）
useEffect(() => {
  const user = getCurrentUser()
  if (!user?.email) return

  const supabase = createClient()
  const channel = supabase.channel(`tickeasy-logout-${user.email}`)

  channel
    .on('broadcast', { event: 'LOGOUT' }, () => {
      clearAuthData()
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 環境變數同步

| 專案 | 檔案 | 新增內容 |
|------|------|---------|
| 前台 | `.env.example` | `VITE_SUPABASE_URL=` / `VITE_SUPABASE_ANON_KEY=` |
| 前台 | `vitest.config.ts` → `test.env` | `VITE_SUPABASE_URL: "https://xxx.supabase.co"` / `VITE_SUPABASE_ANON_KEY: "test-anon-key"` |
| 前台 | `.github/workflows/*.yml` | 確認是否有 `env:` 區塊需補（待查） |

Dashboard 的 Supabase 環境變數（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`）已存在，無需變動。

---

## 測試計畫

### 前台 `logoutBroadcastPage.test.tsx` 修改

```typescript
// mock supabase
vi.mock('@/lib/supabase', () => {
  const mockSend = vi.fn().mockResolvedValue('ok')
  const mockSubscribe = vi.fn((cb) => { cb('SUBSCRIBED'); return mockChannel })
  const mockRemoveChannel = vi.fn()
  const mockChannel = { subscribe: mockSubscribe, send: mockSend }
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: mockRemoveChannel,
    }
  }
})
```

新增測試：
- 廣播 LOGOUT 事件到 `tickeasy-logout-test@test.com` channel
- CHANNEL_ERROR 時仍正常導向 /login
- email 為空時不建立 channel

### 後台 `tests/unit/components/dashboard-layout.test.tsx`（新建）

mock `createClient`、`getCurrentUser`、`clearAuthData`，驗證：
- 掛載時訂閱 `tickeasy-logout-${user.email}` channel
- 收到 LOGOUT broadcast → 呼叫 `clearAuthData()`
- unmount 時呼叫 `removeChannel`（cleanup）
- `getCurrentUser()` 回傳 null 時不訂閱

---

## 完成後更新

- `docs/CHANGELOG.md`：新增 [0.4.3] 條目
- `docs/FEATURES.md`：更新認證機制說明（補充跨域登出同步）
