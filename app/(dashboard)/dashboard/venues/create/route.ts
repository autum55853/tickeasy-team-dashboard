import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.venueName?.trim()) {
      return NextResponse.json({ success: false, error: "場地名稱為必填" }, { status: 400 });
    }
    if (!body.venueAddress?.trim()) {
      return NextResponse.json({ success: false, error: "地址為必填" }, { status: 400 });
    }
    if (!body.venueDescription?.trim()) {
      return NextResponse.json({ success: false, error: "場地描述為必填" }, { status: 400 });
    }
    if (!body.venueCapacity) {
      return NextResponse.json({ success: false, error: "容納人數為必填" }, { status: 400 });
    }
    if (!body.venueImageUrl?.trim()) {
      return NextResponse.json({ success: false, error: "場地圖片 URL 為必填" }, { status: 400 });
    }
    if (!body.googleMapUrl?.trim()) {
      return NextResponse.json({ success: false, error: "Google Maps 連結為必填" }, { status: 400 });
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-amber-backend.onrender.com";
    const apiRes = await fetch(`${apiBase}/api/v1/concerts/venues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json({ success: false, error: errorText || "外部 API 調用失敗" }, { status: 500 });
    }

    const data = await apiRes.json();
    revalidatePath("/dashboard/venues");

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("場地新增錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}
