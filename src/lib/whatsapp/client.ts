/**
 * Baileys Open-Source WhatsApp Client Integration
 * Communicates with the background Baileys WhatsApp microservice
 */

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppStatusResult {
  success: boolean;
  status: 'connected' | 'qr_ready' | 'connecting' | 'disconnected';
  user?: { id?: string; name?: string; phone?: string } | null;
  lastConnectedAt?: string | null;
  hasQr?: boolean;
  error?: string;
}

/**
 * Format phone number to digits only with country code (e.g. +91 85920 33444 -> "918592033444")
 */
export function formatWhatsAppRecipient(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // If 10 digits provided, default to India (+91)
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Base URL for the Baileys WhatsApp Microservice
 */
function getBaileysBaseUrl(): string {
  return process.env.BAILEYS_SERVICE_URL || "http://localhost:3001";
}

/**
 * Sends a WhatsApp text message via local Baileys service
 * Endpoint: POST http://localhost:3001/send-message
 */
export async function sendWhatsAppTextMessage(
  toPhone: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const recipient = formatWhatsAppRecipient(toPhone);
  const baseUrl = getBaileysBaseUrl();
  const endpoint = `${baseUrl}/send-message`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: recipient,
        message: messageText,
      }),
      // Set a short timeout so API routes don't hang if service is offline
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("[Baileys Client] Failed sending WhatsApp message:", data);
      return {
        success: false,
        error: data.error || data.message || "Failed to send message via Baileys WhatsApp service",
      };
    }

    console.log(`[Baileys Client] ✅ Message sent to ${recipient} (ID: ${data.messageId || 'OK'})`);

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("[Baileys Client] Service unreachable or request failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Baileys WhatsApp service is offline or unreachable on " + baseUrl,
    };
  }
}

/**
 * Sends an OTP verification code via WhatsApp
 */
export async function sendWhatsAppOtp(
  toPhone: string,
  code: string
): Promise<WhatsAppSendResult> {
  const messageBody = `*${code}* is your verification code for Kaivu.\n\nValid for 5 minutes. Please do not share this code with anyone.`;
  return await sendWhatsAppTextMessage(toPhone, messageBody);
}

/**
 * Sends a WhatsApp message directly to a WhatsApp Group (e.g. "120363421953306400@g.us")
 */
export async function sendWhatsAppGroupMessage(
  groupId: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const baseUrl = getBaileysBaseUrl();
  const endpoint = `${baseUrl}/send-message`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: groupId,
        message: messageText,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to send message to group",
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to WhatsApp service",
    };
  }
}

export interface WhatsAppGroupItem {
  id: string;
  subject: string;
  owner?: string;
  creation?: number;
  participantsCount: number;
}

/**
 * Fetch all WhatsApp groups the connected account belongs to
 */
export async function getWhatsAppGroups(): Promise<{ success: boolean; groups: WhatsAppGroupItem[]; error?: string }> {
  const baseUrl = getBaileysBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/groups`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { success: false, groups: [], error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    return {
      success: true,
      groups: json.groups || [],
    };
  } catch (err) {
    return {
      success: false,
      groups: [],
      error: err instanceof Error ? err.message : "Service unreachable",
    };
  }
}

/**
 * Query current connection status of the Baileys WhatsApp service
 */
export async function getWhatsAppServiceStatus(): Promise<WhatsAppStatusResult> {
  const baseUrl = getBaileysBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { success: false, status: "disconnected", error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    return {
      success: true,
      status: json.data?.status || "disconnected",
      user: json.data?.user,
      lastConnectedAt: json.data?.lastConnectedAt,
      hasQr: json.data?.hasQr,
    };
  } catch (err) {
    return {
      success: false,
      status: "disconnected",
      error: err instanceof Error ? err.message : "Baileys service unreachable",
    };
  }
}


