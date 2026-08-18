import crypto from 'node:crypto';
import type { WhatsAppIncomingMessage, WhatsAppMessageStatus, WhatsAppChangeValue } from './types';

/**
 * Verifies the SHA256 HMAC signature sent in X-Hub-Signature-256 header.
 */
export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) {
    return false;
  }

  const [prefix, signature] = signatureHeader.split('=');
  if (prefix !== 'sha256' || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Handle incoming user messages (text, quick replies, list selections, media)
 */
export async function processIncomingMessage(
  message: WhatsAppIncomingMessage,
  metadata: WhatsAppChangeValue['metadata'],
  contactName?: string
) {
  console.log(`[WhatsApp] Received message ${message.id} from ${message.from} (${contactName || 'Unknown'}):`, {
    type: message.type,
    text: message.text?.body,
    button: message.button?.text || message.interactive?.button_reply?.title,
    list: message.interactive?.list_reply?.title,
  });

  // Example: Insert custom business logic here (e.g. chat routing, order lookup, auto-response)
}

/**
 * Handle delivery status updates (sent, delivered, read, failed)
 */
export async function processStatusUpdate(
  status: WhatsAppMessageStatus,
  metadata: WhatsAppChangeValue['metadata']
) {
  console.log(`[WhatsApp] Status update for message ${status.id}: ${status.status} (recipient: ${status.recipient_id})`);
  
  if (status.errors && status.errors.length > 0) {
    console.error(`[WhatsApp] Delivery error for ${status.id}:`, status.errors);
  }

  // Example: Update message delivery state in your database
}
