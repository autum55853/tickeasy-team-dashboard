import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// 只允許 POST 請求
export async function POST(req: NextRequest) {
  try {
    const { concertId, reviewStatus, reviewerNote } = await req.json();

    // 從前端 header 取得 token
    const authHeader = req.headers.get("authorization"); // 取得 Authorization: Bearer <token>
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-amber-backend.onrender.com";
    const apiRes = await fetch(
      `${apiBase}/api/v1/concerts/${concertId}/manual-review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader, // 轉發 token 給後端
        },
        body: JSON.stringify({ reviewStatus, reviewerNote }),
      }
    );
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json({ success: false, error: errorText || "外部 API 調用失敗" }, { status: 500 });
    }

    // 重新驗證快取
    revalidatePath("/dashboard/concerts");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("審核錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
} 