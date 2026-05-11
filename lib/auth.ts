import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { users } from "./users";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bauassistent-pro-secret-2024"
);

export async function login(email: string, password: string) {
  const user = users.find(
    (u) => u.email === email && u.password === password && u.aktiv
  );

  if (!user) return null;

  const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}