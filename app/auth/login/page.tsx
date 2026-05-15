"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  // 自動重定向到前端登入頁面
  useEffect(() => {
    // 留一點時間讓用戶看到重定向訊息，然後自動跳轉
    const timer = setTimeout(() => {
      window.location.href = "https://frontend-amber.onrender.com/login";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* 顯示重定向訊息 */}
        <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            正在重定向...
          </h2>
          <p className="text-blue-600">
            將為您跳轉到前端登入頁面
          </p>
          <p className="text-sm text-blue-500 mt-2">
            如果沒有自動跳轉，請點擊 
            <a 
              href="https://frontend-amber.onrender.com/login" 
              className="underline font-medium"
            >
              這裡
            </a>
          </p>
        </div>
        
        {/* 保留原始登入表單（隱藏）但不刪除程式碼 */}
        <div style={{ display: 'none' }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
