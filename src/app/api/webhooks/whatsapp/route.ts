import { NextRequest, NextResponse } from 'next/server';
import type { WhatsAppWebhookPayload } from '@/lib/whatsapp/types';
import {
  verifyWhatsAppSignature,
  processIncomingMessage,
  processStatusUpdate,
} from '@/lib/whatsapp/handler';

/**
 * Verification Endpoint (GET)
 * Handles Meta's webhook verification challenge handshake.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && challenge) {
    if (token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      console.warn('[WhatsApp Webhook] Verification failed: Token mismatch');
      return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 });
    }
  }

  return NextResponse.json({ error: 'Invalid verification request' }, { status: 400 });
}

/**
 * Event Receiver Endpoint (POST)
 * Receives webhook notifications from Meta (incoming messages, status updates, etc.).
 */
export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const rawBody = await request.text();

  // Validate X-Hub-Signature-256 if APP_SECRET is configured
  if (appSecret) {
    const signature = request.headers.get('x-hub-signature-256');
    const isValid = verifyWhatsAppSignature(rawBody, signature, appSecret);

    if (!isValid) {
      console.error('[WhatsApp Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let body: WhatsAppWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    console.error('[WhatsApp Webhook] Failed to parse JSON body:', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Ensure it's a WhatsApp Business Account webhook
  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' }, { status: 200 });
  }

  // Process all entries asynchronously and return 200 quickly
  try {
    if (Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          if (change.field !== 'messages' || !change.value) continue;

          const value = change.value;
          const metadata = value.metadata;
          const contactsMap = new Map<string, string>();

          if (Array.isArray(value.contacts)) {
            for (const contact of value.contacts) {
              contactsMap.set(contact.wa_id, contact.profile?.name || '');
            }
          }

          // Handle incoming messages
          if (Array.isArray(value.messages)) {
            for (const message of value.messages) {
              const contactName = contactsMap.get(message.from);
              await processIncomingMessage(message, metadata, contactName);
            }
          }

          // Handle delivery statuses (sent, delivered, read, failed)
          if (Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              await processStatusUpdate(status, metadata);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing event:', error);
    // Still return 200 so Meta doesn't retry duplicate webhook bursts on application errors
    return NextResponse.json({ status: 'error_handled' }, { status: 200 });
  }
}
