import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminLoginApi = pathname === "/api/admin/login";
  const isAdminLogoutApi = pathname === "/api/admin/logout";

  if (!isAdminPath || isLoginPage || isAdminLoginApi || isAdminLogoutApi) {
    return NextResponse.next();
  }

  // session true/false nằm ở cookie (session cookie)
  const ok = req.cookies.get("admin")?.value === "1";
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
