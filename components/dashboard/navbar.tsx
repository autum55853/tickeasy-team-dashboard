"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { getAuthToken } from "@/lib/auth-utils";

// 導覽列項目
const navItems = [
  { href: "/dashboard/users", label: "用戶管理" },
  { href: "/dashboard/concerts", label: "演唱會管理" },
  { href: "/dashboard/orders", label: "訂單管理" },
];

interface User {
  id?: string;
  email: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  preferredRegions?: string[];
  preferredEventTypes?: string[];
  country?: string;
  address?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 獲取用戶資訊的 API 呼叫
  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log("No token found");
        setIsLoadingUser(false);
        return;
      }

      const response = await fetch("https://tickeasy-team-backend.onrender.com/api/v1/users/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.data && data.data.user) {
          const userData = data.data.user;
          setUser(userData);
          
          // 同時更新 localStorage 中的用戶資訊
          localStorage.setItem("tickeasy_user", JSON.stringify(userData));
          console.log("Successfully fetched user profile:", userData);
        } else {
          console.error("API response error:", data);
        }
      } else {
        console.error("Failed to fetch user profile:", response.status);
        // 如果 API 失敗，嘗試從 localStorage 讀取
        const userString = localStorage.getItem("tickeasy_user");
        if (userString) {
          try {
            const userData = JSON.parse(userString);
            setUser(userData);
            console.log("Fallback to localStorage user data");
          } catch (error) {
            console.error("Failed to parse localStorage user data:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // 如果 API 失敗，嘗試從 localStorage 讀取
      const userString = localStorage.getItem("tickeasy_user");
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          setUser(userData);
          console.log("Fallback to localStorage user data due to error");
        } catch (error) {
          console.error("Failed to parse localStorage user data:", error);
        }
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 初始化時獲取用戶資訊
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 登出功能
  const handleLogout = () => {
    // 清除 user 資訊 (token 僅在 cookie 中，不用刪 localStorage token)
    localStorage.removeItem("tickeasy_user");
    // 清除同域 cookie，避免 Middleware 誤判
    try {
      document.cookie = "tickeasy_token=; path=/; max-age=0";
    } catch (err) {
      console.warn("無法刪除 cookie", err);
    }
    
    // 重定向到前端登入頁面
    window.location.href = "https://frontend-amber.onrender.com/login";
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-8 h-14">
        {/* 左側：Logo + 導覽列 */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Tickeasy Logo" width={150} height={48} />
          </Link>
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-medium hover:text-primary transition ${
                    pathname.startsWith(item.href)
                      ? "text-primary underline"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 右側：用戶資訊/登出 */}
        <div className="flex items-center gap-3">
          {isLoadingUser ? (
            /* 載入中狀態 */
            <div className="text-sm text-gray-500">
              載入中...
            </div>
          ) : user ? (
            <>
              {/* 用戶大頭貼 */}
              <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="用戶頭像" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {/* 優先顯示 nickname，然後 name，最後 email */}
                    {user.nickname 
                      ? user.nickname.charAt(0).toUpperCase() 
                      : user.name 
                        ? user.name.charAt(0).toUpperCase() 
                        : user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </Avatar.Root>
              
              {/* 用戶名稱 */}
              <span className="font-medium text-sm">
                {/* 優先顯示 nickname，然後 name，最後 email 前綴 */}
                {user.nickname || user.name || user.email.split("@")[0]}
              </span>
              
              {/* 角色標籤（如果是管理員） */}
              {(user.role === "admin" || user.role === "superuser") && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  管理員
                </span>
              )}
              
              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            /* 如果沒有用戶資訊，不顯示任何內容（因為會自動導向前端登入） */
            <div className="text-sm text-gray-500">
              未登入
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}