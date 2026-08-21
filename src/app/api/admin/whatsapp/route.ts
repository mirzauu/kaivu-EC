import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";

const BAILEYS_URL = process.env.BAILEYS_SERVICE_URL || "http://localhost:3001";

/**
 * GET /api/admin/whatsapp
 * Returns the current Baileys WhatsApp connection status and active QR code if available.
 */
export async function GET() {
  try {
    const [statusRes, qrRes, groupsRes] = await Promise.allSettled([
      fetch(`${BAILEYS_URL}/status`, { cache: "no-store", signal: AbortSignal.timeout(4000) }),
      fetch(`${BAILEYS_URL}/qr`, { cache: "no-store", signal: AbortSignal.timeout(4000) }),
      fetch(`${BAILEYS_URL}/groups`, { cache: "no-store", signal: AbortSignal.timeout(4000) }),
    ]);

    let statusData = { status: "disconnected", user: null, hasQr: false };
    let qrData = { qrDataUrl: null, qrRaw: null };
    let groups: Array<{ id: string; subject: string; participantsCount: number }> = [];

    if (statusRes.status === "fulfilled" && statusRes.value.ok) {
      const json = await statusRes.value.json();
      statusData = json.data || statusData;
    }

    if (qrRes.status === "fulfilled" && qrRes.value.ok) {
      const json = await qrRes.value.json();
      qrData = { qrDataUrl: json.qrDataUrl || null, qrRaw: json.qrRaw || null };
    }

    if (groupsRes.status === "fulfilled" && groupsRes.value.ok) {
      const json = await groupsRes.value.json();
      groups = json.groups || [];
    }

    return NextResponse.json(
      apiSuccess({
        serviceOnline: statusRes.status === "fulfilled" && statusRes.value.ok,
        ...statusData,
        ...qrData,
        groups,
      })
    );
  } catch (error) {
    console.error("Admin WhatsApp fetch error:", error);
    return NextResponse.json(
      apiError("Baileys WhatsApp service is offline or unreachable"),
      { status: 503 }
    );
  }
}

/**
 * POST /api/admin/whatsapp
 * Actions: { action: "send-test", phone: string, message: string } | { action: "logout" }
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send-test") {
      const { phone, message } = body;
      if (!phone || !message) {
        return NextResponse.json(apiError("Phone and message are required"), { status: 400 });
      }

      const result = await sendWhatsAppTextMessage(phone, message);
      if (!result.success) {
        return NextResponse.json(apiError(result.error || "Failed to send test message"), { status: 400 });
      }
      return NextResponse.json(apiSuccess(result, "Test message sent successfully!"));
    }

    if (action === "logout") {
      const res = await fetch(`${BAILEYS_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return NextResponse.json(apiSuccess(data, "Session reset successfully"));
    }

    return NextResponse.json(apiError("Unknown action"), { status: 400 });
  } catch (error) {
    console.error("Admin WhatsApp action error:", error);
    return NextResponse.json(apiError("Action failed"), { status: 500 });
  }
});
