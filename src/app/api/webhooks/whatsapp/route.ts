import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook Endpoint (GET & POST)
 * Handles incoming webhooks from WASenderAPI and Meta.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token && challenge) {
    if (token === verifyToken) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
  }

  return NextResponse.json({ status: "WASenderAPI webhook active" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ status: "empty" }, { status: 200 });
    }

    const payload = JSON.parse(rawBody);

    // WASenderAPI Webhook Format
    if (payload?.event || payload?.data?.messages) {
      const messageData = payload?.data?.messages;
      if (messageData) {
        const key = messageData.key || {};
        const sender = key.cleanedParticipantPn || key.cleanedSenderPn || key.remoteJid;
        const messageBody = messageData.messageBody || messageData.message?.conversation || "";

        console.log(`[WASenderAPI Webhook] Incoming message from ${sender}: "${messageBody}"`);
      }
      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ status: "error_handled" }, { status: 200 });
  }
}
