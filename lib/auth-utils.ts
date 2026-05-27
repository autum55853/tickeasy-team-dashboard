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
 * 清除所有認證資訊並導向前台 logout-broadcast 頁面。
 * 前台在第一方 context 廣播給其他前台分頁後跳轉 /login。
 * 取代舊版 iframe 方案：跨站 iframe 受瀏覽器儲存隔離，BroadcastChannel 無法跨 partition 傳遞。
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;

  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://frontend-amber.onrender.com';

  localStorage.removeItem('tickeasy_token');
  localStorage.removeItem('tickeasy_user');
  try {
    document.cookie = 'tickeasy_token=; path=/; max-age=0';
  } catch (err) {
    console.warn('無法刪除 cookie:', err);
  }

  window.location.href = `${FRONTEND_URL}/auth/logout-broadcast`;
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
