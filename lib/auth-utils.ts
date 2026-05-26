/**
 * 跨域認證工具函數
 * 處理從前端傳遞過來的認證參數
 */

/**
 * 處理跨域認證參數
 * 從 URL 參數中獲取 token 和 userInfo，並設置到 localStorage
 */
export const handleCrossDomainAuth = (): boolean => {
  // 確保在客戶端環境
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userInfo = urlParams.get('userInfo');

  if (token && userInfo) {
    try {
      // 解碼用戶資訊
      const decodedUserInfo = decodeURIComponent(userInfo);
      const parsedUserInfo = JSON.parse(decodedUserInfo);

      // 將 token 寫入 cookie，供 Middleware 與前端存取
      try {
        document.cookie = `tickeasy_token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      } catch (err) {
        console.warn('無法設定 cookie:', err);
      }

      // 設置用戶資訊（對應後台的 tickeasy_user）
      // 直接使用前端傳遞的完整用戶資訊，不需要格式轉換
      localStorage.setItem('tickeasy_user', decodedUserInfo);

      // 清除 URL 參數，避免刷新頁面時重複處理
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      console.log('跨域認證成功，已設置 token 和用戶資訊');
      return true;
    } catch (error) {
      console.error('處理跨域認證參數失敗:', error);
      return false;
    }
  }

  return false;
};

/**
 * 檢查是否有有效的認證 token
 */
export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = typeof document !== 'undefined' ? getAuthToken() : null;
  return !!token;
};

/**
 * 清除所有認證資訊並導向前端登入。
 * 先載入隱藏 iframe（前台 origin）觸發 BroadcastChannel 廣播，
 * 使同瀏覽器的前台分頁也一併登出，再執行本地清除與跳轉。
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;

  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://frontend-amber.onrender.com';
  const BROADCAST_TIMEOUT_MS = 4000;

  const performLocalCleanup = (iframe: HTMLIFrameElement | null): void => {
    localStorage.removeItem('tickeasy_token');
    localStorage.removeItem('tickeasy_user');
    try {
      document.cookie = 'tickeasy_token=; path=/; max-age=0';
    } catch (err) {
      console.warn('無法刪除 cookie:', err);
    }
    if (iframe?.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    window.location.href = `${FRONTEND_URL}/login`;
  };

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  const cleanup = (): void => {
    clearTimeout(timer);
    window.removeEventListener('message', onMessage);
    performLocalCleanup(iframe);
  };

  const timer = setTimeout(cleanup, BROADCAST_TIMEOUT_MS);

  const onMessage = (event: MessageEvent): void => {
    if (event.data?.type === 'LOGOUT_BROADCAST_DONE' && event.source === iframe.contentWindow) {
      cleanup();
    }
  };

  window.addEventListener('message', onMessage);

  iframe.onerror = cleanup;

  iframe.src = `${FRONTEND_URL}/auth/logout-broadcast`;
  document.body.appendChild(iframe);
};

/**
 * 獲取當前用戶資訊
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('tickeasy_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('解析用戶資訊失敗:', error);
    return null;
  }
};

/**
 * 從同域 Cookie 讀取 JWT (tickeasy_token)
 */
export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )tickeasy_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};
