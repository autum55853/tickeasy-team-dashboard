import { NextRequest, NextResponse } from "next/server";

// 處理用戶角色更新的 API Route
export async function POST(req: NextRequest) {
  try {
    // 取得 Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    // 取得請求內容
    const { userId, newRole } = await req.json();
    if (!userId || !newRole) {
      return NextResponse.json({ success: false, error: "缺少必要參數" }, { status: 400 });
    }

    // 轉發請求到後端 API (使用 PATCH 並符合後端路由 /role)
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-amber-backend.onrender.com";
    const apiRes = await fetch(
      `${apiBase}/api/v1/users/${userId}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader, // 轉發 token
        },
        body: JSON.stringify({ role: newRole }),
      }
    );

    const data = await apiRes.json();
    if (!apiRes.ok) {
      return NextResponse.json({ success: false, error: data.error || "後端 API 錯誤" }, { status: apiRes.status });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("角色更新錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
} 