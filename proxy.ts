import { NextResponse, type NextRequest } from "next/server";

const publicPaths = new Set(["/", "/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.has(pathname) || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // API handlers perform full token verification. This cookie check is only a
  // fast page redirect to the login screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (request.cookies.has("reservehub_session")) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
