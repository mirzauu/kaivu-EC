import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

const ALERT_WHATSAPP_NUMBER = "9995939334";

function parseDevice(ua: string): string {
  if (/iphone/i.test(ua)) return "📱 Apple iPhone";
  if (/ipad/i.test(ua)) return "📱 Apple iPad";
  if (/android/i.test(ua)) return "📱 Android Mobile";
  if (/windows/i.test(ua)) return "💻 Windows Desktop";
  if (/macintosh|mac os x/i.test(ua)) return "💻 Apple Mac";
  if (/linux/i.test(ua)) return "💻 Linux Desktop";
  return "📱 Mobile / Web Browser";
}

export async function POST(req: NextRequest) {
  try {
    let body: {
      visitorId?: string;
      fingerprint?: string;
      pathname?: string;
      referrer?: string;
      screen?: string;
      language?: string;
      userAgent?: string;
    } = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else {
      const text = await req.text().catch(() => "");
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {}
      }
    }

    const visitorId =
      body.visitorId || req.cookies.get("kaivu_vid")?.value || "";
    const fingerprint = body.fingerprint || "";
    const ua = body.userAgent || req.headers.get("user-agent") || "unknown";
    const device = parseDevice(ua);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "Unknown IP";

    const country = req.headers.get("cf-ipcountry") || "";
    const city = req.headers.get("cf-ipcity") || "";
    const locationStr = [city, country].filter(Boolean).join(", ");

    const timeFormatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    const landingPage = body.pathname || "/";
    const sourceReferrer =
      body.referrer && body.referrer !== "" ? body.referrer : "Direct / Organic";

    // ── 1. CHECK IF LOGGED-IN CUSTOMER ──
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.userId) {
        const dbUser = await db.user.findUnique({
          where: { id: currentUser.userId },
          select: { createdAt: true },
        });

        // If registered more than 15 mins ago, they are an existing customer
        if (
          dbUser &&
          Date.now() - new Date(dbUser.createdAt).getTime() > 15 * 60 * 1000
        ) {
          return NextResponse.json({
            success: true,
            isNew: false,
            message: "Existing registered customer — alert skipped",
          });
        }
      }
    } catch {
      // Non-blocking auth check
    }

    // ── 2. CHECK DATABASE DEDUPLICATION BY VISITOR ID ──
    if (visitorId) {
      try {
        const existingByVid = await db.userEvent.findFirst({
          where: {
            OR: [
              { sessionId: visitorId },
              { metadata: { path: ["visitorId"], equals: visitorId } },
            ],
          },
          select: { id: true, createdAt: true },
        });

        if (existingByVid) {
          return NextResponse.json({
            success: true,
            isNew: false,
            message: "Returning visitor (matched persistent visitorId)",
          });
        }
      } catch (err) {
        console.warn("[Visitor Alert] VisitorId lookup error:", err);
      }
    }

    // ── 3. CHECK DATABASE DEDUPLICATION BY HARDWARE FINGERPRINT ──
    if (fingerprint && fingerprint !== "fp_default" && fingerprint !== "server") {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const existingByFp = await db.userEvent.findFirst({
          where: {
            eventType: "NEW_VISITOR_VISIT",
            createdAt: { gte: thirtyDaysAgo },
            metadata: {
              path: ["fingerprint"],
              equals: fingerprint,
            },
          },
          select: { id: true },
        });

        if (existingByFp) {
          return NextResponse.json({
            success: true,
            isNew: false,
            message: "Returning visitor (matched device hardware fingerprint)",
          });
        }
      } catch (err) {
        console.warn("[Visitor Alert] Fingerprint lookup error:", err);
      }
    }

    // ── 4. LOG FIRST-TIME VISIT EVENT TO DATABASE ──
    try {
      await db.userEvent.create({
        data: {
          eventType: "NEW_VISITOR_VISIT",
          sessionId: visitorId || null,
          ipAddress: ip,
          userAgent: ua,
          metadata: {
            visitorId,
            fingerprint,
            pathname: landingPage,
            referrer: sourceReferrer,
            screen: body.screen,
            language: body.language,
            location: locationStr,
          },
        },
      });
    } catch (dbErr) {
      console.error("[Visitor Alert] Database log error:", dbErr);
    }

    // ── 5. DISPATCH WHATSAPP NOTIFICATION FOR GENUINE NEW VISITOR ──
    const shortVid = visitorId
      ? visitorId.replace(/^vid_/, "").slice(0, 10)
      : "Assigned";

    const alertMessage =
      `🚀 *New Visitor on Kaivu!*\n\n` +
      `👤 *Event:* Verified First-Time Visitor\n` +
      `⏰ *Time:* ${timeFormatted}\n` +
      `📱 *Device:* ${device} (${body.screen || "Standard Screen"})\n` +
      `🌐 *Landing Page:* ${landingPage}\n` +
      `🔗 *Source:* ${sourceReferrer}\n` +
      (locationStr ? `📍 *Location:* ${locationStr}\n` : "") +
      `🆔 *Visitor ID:* ${shortVid}\n` +
      `🛡️ *Network IP:* ${ip}\n\n` +
      `_Kaivu Live Visitor Intelligence_`;

    sendWhatsAppTextMessage(ALERT_WHATSAPP_NUMBER, alertMessage)
      .then((res) => {
        if (!res.success) {
          console.warn("[Visitor Alert] WhatsApp send warning:", res.error);
        } else {
          console.log(
            `[Visitor Alert] ✅ Sent WhatsApp alert to ${ALERT_WHATSAPP_NUMBER}`
          );
        }
      })
      .catch((err) => {
        console.error("[Visitor Alert] WhatsApp send error:", err);
      });

    const response = NextResponse.json({
      success: true,
      isNew: true,
      message: "New visitor registered successfully",
    });

    // Ensure persistent cookie is set in response headers
    if (visitorId) {
      response.cookies.set("kaivu_vid", visitorId, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("[Visitor Alert] Handler error:", error);
    return NextResponse.json({ success: true });
  }
}
