import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.SESSION_SECRET);
export const SESSION_COOKIE = "session-token";

export async function createSession(adminId: number) {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // JS in the browser cannot read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as { adminId: number };
  } catch {
    return null; // expired or tampered
  }
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
