import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // /admin は adminロールのみ
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // /contributors/[id]/edit はログイン必須
  if (pathname.match(/^\/contributors\/[^/]+\/edit$/)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/contributors/:path*/edit"],
};
