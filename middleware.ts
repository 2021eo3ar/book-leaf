import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/books") ||
    pathname.startsWith("/tickets")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "author") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname === "/login" && session) {
    const redirect = session.user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirect, req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/books/:path*", "/tickets/:path*", "/admin/:path*", "/login"],
};
