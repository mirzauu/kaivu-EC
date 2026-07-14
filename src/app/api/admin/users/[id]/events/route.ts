import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/admin/users/[id]/events
 * Paginated event log for a specific user.
 */
export const GET = withAdmin(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;
      const { searchParams } = req.nextUrl;
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const eventType = searchParams.get("type"); // filter by event type

      const where: Record<string, unknown> = { userId: id };
      if (eventType) {
        where.eventType = eventType;
      }

      const [events, total] = await Promise.all([
        db.userEvent.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.userEvent.count({ where }),
      ]);

      // Get distinct event types for this user (for filter dropdown)
      const eventTypes = await db.userEvent.groupBy({
        by: ["eventType"],
        where: { userId: id },
        _count: true,
        orderBy: { _count: { eventType: "desc" } },
      });

      return NextResponse.json(
        apiSuccess({
          events,
          eventTypes: eventTypes.map((et) => ({
            type: et.eventType,
            count: et._count,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      );
    } catch (error) {
      console.error("Admin user events error:", error);
      return NextResponse.json(apiError("Failed to fetch user events"), { status: 500 });
    }
  }
);
