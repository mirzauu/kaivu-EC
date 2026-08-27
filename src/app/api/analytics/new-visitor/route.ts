import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";
import { db } from "@/lib/db";

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
        body = JSON.parse(text);
      }
    }

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
    const sourceReferrer = body.referrer && body.referrer !== "" ? body.referrer : "Direct / Organic";

    const alertMessage =
      `🚀 *New Visitor on Kaivu!*\n\n` +
      `👤 *Event:* First-Time Website Visitor\n` +
      `⏰ *Time:* ${timeFormatted}\n` +
      `📱 *Device:* ${device} (${body.screen || "Standard Screen"})\n` +
      `🌐 *Landing Page:* ${landingPage}\n` +
      `🔗 *Source:* ${sourceReferrer}\n` +
      (locationStr ? `📍 *Location:* ${locationStr}\n` : "") +
      `🛡️ *IP Address:* ${ip}\n\n` +
      `_Kaivu Live Visitor Intelligence_`;

    // Send WhatsApp notification asynchronously without blocking response
    sendWhatsAppTextMessage(ALERT_WHATSAPP_NUMBER, alertMessage)
      .then((res) => {
        if (!res.success) {
          console.warn("[Visitor Alert] WhatsApp send warning:", res.error);
        } else {
          console.log(`[Visitor Alert] ✅ Sent WhatsApp alert to ${ALERT_WHATSAPP_NUMBER}`);
        }
      })
      .catch((err) => {
        console.error("[Visitor Alert] WhatsApp send error:", err);
      });

    // Optionally log in database for analytics
    try {
      await db.userEvent.create({
        data: {
          eventType: "NEW_VISITOR_VISIT",
          ipAddress: ip,
          userAgent: ua,
          metadata: {
            pathname: landingPage,
            referrer: sourceReferrer,
            screen: body.screen,
            language: body.language,
            location: locationStr,
          },
        },
      });
    } catch {
      // Non-blocking database logging
    }

    return NextResponse.json({ success: true, message: "Visitor tracked successfully" });
  } catch (error) {
    console.error("[Visitor Alert] Handler error:", error);
    return NextResponse.json({ success: true });
  }
}
