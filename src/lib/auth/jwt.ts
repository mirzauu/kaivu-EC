import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kaivu-dev-secret-change-in-production"
);

const COOKIE_NAME = "kaivu_token";
const TOKEN_EXPIRY = "7d"; // 7 days

export interface TokenPayload extends JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

/**
 * Sign a new JWT token for a user.
 */
export async function signToken(payload: {
  userId: string;
  phone: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    phone: payload.phone,
    role: payload.role,
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer("kaivu")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token.
 * Returns the payload or null if invalid/expired.
 */
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "kaivu",
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Set the auth token as an HTTP-only cookie.
 */
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get the auth token from cookies.
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

/**
 * Clear the auth cookie (logout).
 */
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get the current user payload from the cookie token.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}
