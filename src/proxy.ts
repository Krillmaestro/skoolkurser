import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAuth = request.cookies.get("pin-auth")?.value === "true";
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (isLoginPage) return NextResponse.next();
  if (isAuth) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
