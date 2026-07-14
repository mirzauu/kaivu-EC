import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type TokenPayload } from "./jwt";

/**
 * Authenticated request type — adds `user` to the request context.
 */
export type AuthenticatedRequest = NextRequest & {
  user: TokenPayload;
};

/**
 * Wrapper for route handlers that require authentication.
 * Returns 401 if the user is not authenticated.
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (req) => {
 *   const userId = req.user.userId;
 *   // ... your handler logic
 * });
 * ```
 */
export function withAuth(
  handler: (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => Promise<NextResponse | Response>
) {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    return handler(req as AuthenticatedRequest, context);
  };
}

/**
 * Wrapper for route handlers that require admin role.
 * Returns 401 if not authenticated, 403 if not admin.
 */
export function withAdmin(
  handler: (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => Promise<NextResponse | Response>
) {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    (req as AuthenticatedRequest).user = user;
    return handler(req as AuthenticatedRequest, context);
  };
}
