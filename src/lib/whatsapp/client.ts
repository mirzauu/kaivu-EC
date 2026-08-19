/**
 * WhatsApp Cloud API Client
 * Sends messages and authentication OTPs using Meta's Graph API.
 */

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format phone number to WhatsApp international standard digits-only format
 * e.g. "+91 98765 43210" -> "919876543210"
 */
export function formatWhatsAppRecipient(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // If user provided a 10-digit number without country code, default to India (+91)
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Sends a plain text WhatsApp message
 */
export async function sendWhatsAppTextMessage(
  toPhone: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient = formatWhatsAppRecipient(toPhone);

  if (!phoneNumberId || !accessToken) {
    console.warn(
      `[WhatsApp] WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_API_TOKEN is missing. (Recipient: ${recipient}, Message: "${messageText}")`
    );
    return {
      success: true,
      error: "WhatsApp credentials not configured in .env",
    };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: {
      preview_url: false,
      body: messageText,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp] API error response:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
      };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsApp] Message successfully sent to ${recipient} (ID: ${messageId})`);

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("[WhatsApp] Request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error calling WhatsApp API",
    };
  }
}

/**
 * Sends an OTP verification code to a user via WhatsApp.
 * Supports Meta Authentication Template or Direct Text message.
 */
export async function sendWhatsAppOtp(
  toPhone: string,
  code: string
): Promise<WhatsAppSendResult> {
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient = formatWhatsAppRecipient(toPhone);

  // If a template is configured in Meta WhatsApp Manager (recommended for production authentication)
  if (templateName && phoneNumberId && accessToken) {
    const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: code,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: code,
              },
            ],
          },
        ],
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.messages?.[0]?.id };
      }
      console.warn("[WhatsApp] Template send failed, falling back to text message:", data.error?.message);
    } catch (err) {
      console.warn("[WhatsApp] Template request error, falling back to text message:", err);
    }
  }

  // Standard message body
  const messageBody = `*${code}* is your verification code for Kaivu.\n\nValid for 5 minutes. Please do not share this code with anyone.`;
  return await sendWhatsAppTextMessage(toPhone, messageBody);
}
