import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  console.log(request.nextUrl);
  // 1. Check Login
  const isLoggedIn = !!request.auth;
  const isApiCall = request.nextUrl.pathname.startsWith("/api/v1");

  // If call API backend which unauthorized -> return 401
  if (isApiCall && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Access Dashboard mà chưa login -> Đá về Login
  if (!isLoggedIn && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Nếu OK, Next.js tự động đi tiếp (và gặp config Rewrites ở trên để Proxy đi)
});
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
