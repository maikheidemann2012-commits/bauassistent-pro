import { NextRequest, NextResponse } from "next/server";
import { login } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const token = await login(email, password);

  if (!token) {
    return NextResponse.json(
      { error: "Email oder Passwort falsch!" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}