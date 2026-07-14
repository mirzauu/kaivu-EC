import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { Prisma } from "@prisma/client";

/**
 * POST /api/track
 * Batch event tracking endpoint.
 * Accepts events from the client tracker and bulk-inserts into user_events.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse body — can come from sendBeacon (text) or fetch (json)
    let body: { events: Array<{ eventType: string; metadata?: Record<string, unknown>; timestamp: string }>; sessionId?: string };
    
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // sendBeacon sends as text/plain
      const text = await req.text();
      body = JSON.parse(text);
    }

    const { events, sessionId } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(apiError("Events array is required"), { status: 400 });
    }

    // Get user from cookie (optional — anonymous tracking is allowed)
    const user = await getCurrentUser();

    // Extract request metadata
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Bulk insert events
    await db.userEvent.createMany({
      data: events.map((event) => ({
        userId: user?.userId || null,
        eventType: event.eventType,
        metadata: (event.metadata || {}) as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
        sessionId: sessionId || null,
        createdAt: new Date(event.timestamp),
      })),
    });

    return NextResponse.json(apiSuccess({ tracked: events.length }));
  } catch (error) {
    console.error("Tracking error:", error);
    // Don't fail loudly — tracking should be resilient
    return NextResponse.json(apiSuccess({ tracked: 0 }));
  }
}
