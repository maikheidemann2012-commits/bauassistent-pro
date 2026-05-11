import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bauassistent-pro-secret-2024"
);

const oeffentlicheRouten = ["/login", "/api/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (oeffentlicheRouten.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public|.*\\.svg|.*\\.png).*)"],
};