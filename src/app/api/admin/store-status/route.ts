import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { getStoreStatus, updateStoreStatus, StoreStatus } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/store-status
 * Get current store operational status and closing countdown timer.
 */
export const GET = withAdmin(async (_req: AuthenticatedRequest) => {
  try {
    const status = await getStoreStatus();
    return NextResponse.json(apiSuccess(status));
  } catch (error) {
    console.error("Admin store status fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch store status"), { status: 500 });
  }
});

/**
 * POST /api/admin/store-status
 * Update store status:
 * Body options:
 * - { action: "toggle_open", isOpen: boolean }
 * - { action: "start_timer", durationMinutes: number }
 * - { action: "cancel_timer" }
 * - { action: "update_message", closedMessage: string }
 * - Direct object: { isOpen?: boolean, closingTimerEndsAt?: string | null, closedMessage?: string }
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    let updates: Partial<StoreStatus> = {};

    if (body.action === "toggle_open") {
      updates.isOpen = Boolean(body.isOpen);
      // If opening, cancel any active timer
      if (body.isOpen) {
        updates.closingTimerEndsAt = null;
      }
    } else if (body.action === "start_timer") {
      const minutes = Number(body.durationMinutes) || 10;
      const endsAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      updates.isOpen = true; // Store remains open during countdown
      updates.closingTimerEndsAt = endsAt;
    } else if (body.action === "cancel_timer") {
      updates.closingTimerEndsAt = null;
    } else if (body.action === "update_message") {
      updates.closedMessage = String(body.closedMessage || "").trim();
    } else {
      // Direct update
      if (body.isOpen !== undefined) updates.isOpen = Boolean(body.isOpen);
      if (body.closingTimerEndsAt !== undefined) updates.closingTimerEndsAt = body.closingTimerEndsAt;
      if (body.closedMessage !== undefined) updates.closedMessage = body.closedMessage;
    }

    const newStatus = await updateStoreStatus(updates);
    return NextResponse.json(apiSuccess(newStatus));
  } catch (error) {
    console.error("Admin store status update error:", error);
    return NextResponse.json(apiError("Failed to update store status"), { status: 500 });
  }
});
