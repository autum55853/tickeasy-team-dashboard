import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest, { params }: { params: { venueId: string } }) {
  try {
    const { venueId } = params;

    if (!venueId) {
      return NextResponse.json({ success: false, error: "缺少 venueId" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-amber-backend.onrender.com";
    const apiRes = await fetch(`${apiBase}/api/v1/venues/${venueId}`, {
      method: "DELETE",
      headers: { "Authorization": authHeader },
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json({ success: false, error: errorText || "外部 API 調用失敗" }, { status: 500 });
    }

    revalidatePath("/dashboard/venues");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("場地刪除錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { venueId: string } }) {
  try {
    const { venueId } = params;

    if (!venueId) {
      return NextResponse.json({ success: false, error: "缺少 venueId" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    const body = await req.json();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://tickeasy-amber-backend.onrender.com";
    const apiRes = await fetch(`${apiBase}/api/v1/venues/${venueId}`, {
      method: "PATCH",
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

    revalidatePath("/dashboard/venues");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("場地更新錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}
