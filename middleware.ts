import { NextResponse, type NextRequest } from "next/server";

// 後台全域驗證與跨域 token 處理
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // ------------- 僅保護 /dashboard ------------
  if (isDashboardRoute) {
    // 1) 先看 Cookie
    const cookieToken = request.cookies.get("tickeasy_token")?.value;
    if (cookieToken) {
      // 有 Cookie，直接放行
      return NextResponse.next();
    }

    // 2) 再檢查 URL query ?token=
    const urlToken = searchParams.get("token");
    if (urlToken) {
      // 準備乾淨網址（移除 token 參數）
      const cleanedURL = request.nextUrl.clone();
      cleanedURL.searchParams.delete("token");

      // 將 token 寫進 Cookie，並 302 導回乾淨網址
      const response = NextResponse.redirect(cleanedURL);
      response.cookies.set({
        name: "tickeasy_token",
        value: urlToken,
        httpOnly: false, // 若前端不需要讀，可改為 true
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 天
      });
      return response;
    }

    // 3) 都沒有 → 導向前端登入頁
    const loginURL = new URL("https://frontend-amber.onrender.com/login");
    loginURL.searchParams.set("next", request.nextUrl.href);
    return NextResponse.redirect(loginURL);
  }

  // 非 /dashboard 路徑：直接放行
  return NextResponse.next();
}

// 與原先設定保持一致：排除靜態資源
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
