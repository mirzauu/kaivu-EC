import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  type WASocket,
  type ConnectionState,
} from '@whiskeysockets/baileys';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { SignJWT } from 'jose';

// Load environment variables
dotenv.config();

// PostgreSQL Database Connection Pool
const dbPool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
    })
  : null;

if (dbPool) {
  dbPool.query('SELECT NOW()').then(() => {
    console.log('✅ [Baileys] PostgreSQL database connected successfully for WhatsApp Auth.');
  }).catch((err) => {
    console.warn('⚠️ [Baileys] PostgreSQL connection warning:', err.message);
  });
}

// Safety handlers for uncaught stream exceptions
process.on('uncaughtException', (err) => {
  console.error('[Baileys Uncaught Exception]:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Baileys Unhandled Rejection]:', reason);
});

const PORT = parseInt(process.env.BAILEYS_PORT || '3001', 10);
const AUTH_DIR = path.resolve(process.env.BAILEYS_AUTH_DIR || './sessions/baileys_auth');

// Ensure sessions directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const logger = pino({ level: (process.env.BAILEYS_LOG_LEVEL as any) || 'warn' });

interface ServiceState {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  qrRaw: string | null;
  qrDataUrl: string | null;
  user: { id?: string; name?: string; phone?: string } | null;
  lastConnectedAt: string | null;
  disconnectReason: string | null;
}

const state: ServiceState = {
  status: 'disconnected',
  qrRaw: null,
  qrDataUrl: null,
  user: null,
  lastConnectedAt: null,
  disconnectReason: null,
};

let sock: WASocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * Format any phone string or group ID to a WhatsApp JID
 * E.g. "918592033444" -> "918592033444@s.whatsapp.net"
 * E.g. "120363411261970886@s.whatsapp.net" -> "120363411261970886@g.us"
 * E.g. "120363411261970886@g.us" -> "120363411261970886@g.us"
 */
function formatToJid(target: string): string {
  const trimmed = target.trim();

  // If it starts with 120363 (standard WhatsApp group ID prefix) or contains hyphen, it's a group
  if (trimmed.startsWith('120363') || trimmed.includes('-') || trimmed.endsWith('@g.us')) {
    const cleaned = trimmed.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, '');
    return `${cleaned}@g.us`;
  }

  if (trimmed.endsWith('@s.whatsapp.net')) {
    return trimmed;
  }

  let cleaned = trimmed.replace(/\D/g, '');
  // Default to India (+91) if only 10 digits are provided
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return `${cleaned}@s.whatsapp.net`;
}

/**
 * Handle incoming "LOGIN KV-XXXX" verification message
 */
async function handleLoginCode(jid: string, rawText: string): Promise<boolean> {
  const match = rawText.match(/^(?:LOGIN\s+)?(KV-[A-Z0-9]{4})$/i);
  if (!match) return false;

  const token = match[1].toUpperCase();
  console.log(`[Baileys Auth] 🔑 Detected login attempt with token: ${token} from ${jid}`);

  // Format phone number
  const rawSender = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
  let phone = rawSender;
  if (/^\d{10}$/.test(phone)) phone = '+91' + phone;
  else if (/^91\d{10}$/.test(phone)) phone = '+' + phone;
  else if (!phone.startsWith('+')) phone = '+' + phone;

  if (!dbPool) {
    console.error('[Baileys Auth] ⚠️ Database pool not initialized! Check DATABASE_URL in .env');
    return false;
  }

  try {
    // 1. Look up session in whatsapp_login_sessions
    const sessionRes = await dbPool.query(
      `SELECT * FROM whatsapp_login_sessions WHERE token = $1`,
      [token]
    );

    if (sessionRes.rows.length === 0) {
      console.warn(`[Baileys Auth] ⚠️ Token ${token} not found in database.`);
      if (sock) {
        await sock.sendMessage(jid, {
          text: `❌ *Invalid Login Code*\n\nThe code *${token}* was not recognized. Please return to Kaivu and click "Continue with WhatsApp" to get a new code.`
        });
      }
      return true;
    }

    const session = sessionRes.rows[0];

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      console.warn(`[Baileys Auth] ⚠️ Token ${token} has expired.`);
      if (sock) {
        await sock.sendMessage(jid, {
          text: `⏱️ *Code Expired*\n\nThe code *${token}* has expired. Please return to Kaivu and click "Continue with WhatsApp" to generate a fresh code.`
        });
      }
      return true;
    }

    // 2. Find or create User
    const userRes = await dbPool.query(
      `SELECT id, phone, role FROM users WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    let user = userRes.rows[0];
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Generate referral code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let refCode = "KV-";
      for (let i = 0; i < 6; i++) {
        refCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if session had a referrer
      let referrerId: string | null = null;
      let initialCoins = 0;
      if (session.referral_code) {
        const refRes = await dbPool.query(`SELECT id FROM users WHERE referral_code = $1 LIMIT 1`, [session.referral_code]);
        if (refRes.rows.length > 0) {
          referrerId = refRes.rows[0].id;
          initialCoins = 25; // Default referral referee bonus
        }
      }

      const insertRes = await dbPool.query(
        `INSERT INTO users (id, phone, referral_code, referred_by_id, kaivu_coins, role, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'USER', NOW(), NOW())
         RETURNING id, phone, role`,
        [phone, refCode, referrerId, initialCoins]
      );
      user = insertRes.rows[0];

      if (referrerId && initialCoins > 0) {
        try {
          await dbPool.query(
            `INSERT INTO coin_transactions (id, user_id, amount, type, description, created_at)
             VALUES (gen_random_uuid(), $1, $2, 'SIGNUP_BONUS', 'Welcome bonus from referral code', NOW())`,
            [user.id, initialCoins]
          );
          await dbPool.query(
            `UPDATE users SET kaivu_coins = kaivu_coins + 50 WHERE id = $1`,
            [referrerId]
          );
          await dbPool.query(
            `INSERT INTO coin_transactions (id, user_id, amount, type, description, created_at)
             VALUES (gen_random_uuid(), $1, 50, 'REFERRAL_BONUS', $2, NOW())`,
            [referrerId, `Referral bonus — ${phone} joined using your code`]
          );
        } catch (coinErr) {
          console.error('[Baileys Auth] Error recording referral coin transactions:', coinErr);
        }
      }
    }

    // 3. Generate JWT Token
    const jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'kaivu-dev-secret-change-this-in-production-to-a-random-64-char-string'
    );
    const authToken = await new SignJWT({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setIssuer('kaivu')
      .sign(jwtSecret);

    // 4. Update session to VERIFIED
    await dbPool.query(
      `UPDATE whatsapp_login_sessions
       SET status = 'VERIFIED',
           phone = $1,
           user_id = $2,
           auth_token = $3,
           updated_at = NOW()
       WHERE token = $4`,
      [phone, user.id, authToken, token]
    );

    console.log(`[Baileys Auth] ✅ Successfully verified session ${token} for user ${phone} (User ID: ${user.id})`);

    // 5. Send WhatsApp reply with magic link directly from active socket
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kaivu.co';
    const magicLink = `${appUrl}/api/auth/magic-link?token=${token}`;

    const welcomeMessage = isNewUser
      ? `*kaivu.*\n\nWelcome! You're logged in ✅\n\nTap to continue:\n${magicLink}`
      : `*kaivu.*\n\nWelcome back! You're logged in ✅\n\nTap to continue:\n${magicLink}`;

    if (sock) {
      await sock.sendMessage(jid, { text: welcomeMessage });
      console.log(`[Baileys Auth] 📤 Magic link and welcome message sent to ${jid}`);
    }

    // 6. Non-blocking webhook notification if configured
    if (process.env.NEXT_PUBLIC_APP_URL) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'messages.upsert',
          data: {
            messages: {
              key: { cleanedSenderPn: phone, remoteJid: jid },
              messageBody: rawText,
            },
          },
        }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('[Baileys Auth] Error verifying login code:', err);
    return false;
  }
}

/**
 * Initialize Baileys WhatsApp Socket
 */
async function startWhatsAppSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Teardown existing socket cleanly if any
  if (sock) {
    try {
      sock.ev.removeAllListeners('connection.update');
      sock.ev.removeAllListeners('creds.update');
      sock.ws?.close();
    } catch {
      // ignore
    }
    sock = null;
  }

  try {
    state.status = 'connecting';
    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`[Baileys] Initializing WhatsApp Web v${version.join('.')} (Latest: ${isLatest})...`);

    const socketInstance = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      browser: ['Kaivu Store', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      printQRInTerminal: false,
      auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys, logger),
      },
      shouldIgnoreJid: (jid) => isJidBroadcast(jid) || jid.endsWith('@g.us') || jid.endsWith('@newsletter'),
      getMessage: async (_key) => undefined,
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 15000,
      emitOwnEvents: false,
      retryRequestDelayMs: 500,
    });

    sock = socketInstance;

    // Save credentials whenever updated
    socketInstance.ev.on('creds.update', saveCreds);

    // Handle incoming WhatsApp messages
    socketInstance.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const jid = msg.key.remoteJid || '';
        if (!jid || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) continue;

        const senderPn = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
        const messageBody = (
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          ''
        ).trim();

        if (!messageBody || !senderPn) continue;

        console.log(`[Baileys Service] 📩 Incoming message from ${senderPn} (${jid}): "${messageBody}"`);

        // Check and process 1-tap WhatsApp Login token
        await handleLoginCode(jid, messageBody);
      }
    });

    // Monitor connection events
    socketInstance.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        state.status = 'qr_ready';
        state.qrRaw = qr;
        try {
          state.qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        } catch (err) {
          console.error('[Baileys] Error generating QR data URL:', err);
        }

        console.log('\n======================================================');
        console.log('📱 [Baileys] SCAN THIS QR CODE WITH WHATSAPP ON YOUR PHONE:');
        console.log('======================================================');
        qrcodeTerminal.generate(qr, { small: true });
        console.log('======================================================\n');
      }

      if (connection === 'open') {
        state.status = 'connected';
        state.qrRaw = null;
        state.qrDataUrl = null;
        state.disconnectReason = null;
        state.lastConnectedAt = new Date().toISOString();

        const userJid = socketInstance.user?.id || '';
        const phone = userJid.split(':')[0] || userJid.split('@')[0];
        state.user = {
          id: userJid,
          name: socketInstance.user?.name || 'Kaivu WhatsApp',
          phone,
        };

        console.log(`\n✅ [Baileys] WhatsApp Connected successfully as +${phone} (${socketInstance.user?.name || 'Store Device'})!\n`);
      }

      if (connection === 'close') {
        const error = lastDisconnect?.error as Boom | undefined;
        const statusCode = error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const isConflict = statusCode === DisconnectReason.connectionReplaced || statusCode === 440;

        state.status = 'disconnected';
        state.disconnectReason = error?.message || `Status Code: ${statusCode}`;
        state.user = null;

        console.warn(`[Baileys] Connection closed: ${error?.message || 'Unknown'} (Status: ${statusCode})`);

        if (isLoggedOut) {
          console.warn('⚠️ [Baileys] Device logged out! Clearing session files...');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(AUTH_DIR, { recursive: true });
          } catch (e) {
            console.error('[Baileys] Failed to clear auth directory:', e);
          }
          reconnectTimer = setTimeout(() => startWhatsAppSocket(), 2000);
        } else {
          // If conflict/replaced, wait 5 seconds so WhatsApp server clears previous active stream
          const delayMs = isConflict ? 5000 : 3000;
          console.log(`[Baileys] Reconnecting in ${delayMs / 1000}s...`);
          reconnectTimer = setTimeout(() => startWhatsAppSocket(), delayMs);
        }
      }
    });
  } catch (error) {
    console.error('[Baileys] Fatal initialization error:', error);
    state.status = 'disconnected';
    state.disconnectReason = error instanceof Error ? error.message : String(error);
  }
}

// ─── Express App Setup ────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

/**
 * Health & Status Check
 */
app.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: state.status,
      user: state.user,
      lastConnectedAt: state.lastConnectedAt,
      disconnectReason: state.disconnectReason,
      hasQr: !!state.qrDataUrl,
    },
  });
});

/**
 * Get QR Code (JSON or Image)
 */
app.get('/qr', (req: Request, res: Response) => {
  if (state.status === 'connected') {
    return res.status(200).json({
      success: true,
      connected: true,
      message: 'WhatsApp is already connected.',
      user: state.user,
    });
  }

  if (!state.qrRaw) {
    return res.status(404).json({
      success: false,
      message: state.status === 'connecting' ? 'Generating QR code, please wait...' : 'QR code not available.',
      status: state.status,
    });
  }

  if (req.query.format === 'image' && state.qrDataUrl) {
    const base64Data = state.qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
    });
    return res.end(imgBuffer);
  }

  return res.json({
    success: true,
    status: state.status,
    qrRaw: state.qrRaw,
    qrDataUrl: state.qrDataUrl,
  });
});

let cachedGroups: Array<{ id: string; subject: string; owner?: string; creation?: number; participantsCount: number }> = [];
let lastGroupsFetchedAt = 0;
let isFetchingGroups = false;

/**
 * List Participating WhatsApp Groups
 */
app.get('/groups', async (_req: Request, res: Response) => {
  if (state.status !== 'connected' || !sock) {
    return res.status(200).json({
      success: true,
      groups: cachedGroups,
    });
  }

  const now = Date.now();
  // Return cached groups if fetched within last 5 minutes or if a fetch is already in progress
  if (now - lastGroupsFetchedAt < 300000 || isFetchingGroups) {
    return res.json({ success: true, groups: cachedGroups });
  }

  isFetchingGroups = true;
  lastGroupsFetchedAt = now;

  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupList = Object.values(groups).map((g) => ({
      id: g.id,
      subject: g.subject,
      owner: g.owner,
      creation: g.creation,
      participantsCount: g.participants?.length || 0,
    }));

    cachedGroups = groupList;
    return res.json({
      success: true,
      groups: groupList,
    });
  } catch (error) {
    // Gracefully handle rate-limits without crashing or spamming console
    return res.json({
      success: true,
      groups: cachedGroups,
    });
  } finally {
    isFetchingGroups = false;
  }
});

/**
 * Send WhatsApp Text Message (Direct Phone or Group)
 * Body: { to: "919876543210" | "120363421953306400@g.us", message: "Hello" }
 */
app.post('/send-message', async (req: Request, res: Response) => {
  const { to, text, message } = req.body;
  const messageContent = text || message;

  if (!to || !messageContent) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: "to" and ("text" or "message")',
    });
  }

  // If reconnecting, wait up to 4 seconds for socket to finish connection
  if (state.status !== 'connected' && sock) {
    for (let i = 0; i < 8; i++) {
      if ((state.status as string) === 'connected') break;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (state.status !== 'connected' || !sock) {
    console.warn(`[Baileys API] Cannot send message to ${to}: WhatsApp is not connected (current: ${state.status})`);
    return res.status(503).json({
      success: false,
      error: `WhatsApp client is not connected (status: ${state.status}). Please link the device first.`,
    });
  }

  const jid = formatToJid(to);

  try {
    let targetJid = jid;

    // If direct message, verify recipient exists on WhatsApp
    if (!jid.endsWith('@g.us')) {
      const [result] = await sock.onWhatsApp(jid);
      if (!result?.exists) {
        console.warn(`[Baileys API] Recipient JID ${jid} does not exist on WhatsApp.`);
      }
      targetJid = result?.jid || jid;
    }

    const sent = await sock.sendMessage(targetJid, { text: messageContent });

    console.log(`[Baileys API] ✅ Message sent to ${targetJid} (ID: ${sent?.key?.id})`);

    return res.json({
      success: true,
      messageId: sent?.key?.id,
      timestamp: sent?.messageTimestamp,
    });
  } catch (error) {
    console.error(`[Baileys API] ❌ Failed to send message to ${jid}:`, error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending message via Baileys',
    });
  }
});

/**
 * Logout & Reset Session
 */
app.post('/logout', async (_req: Request, res: Response) => {
  try {
    if (sock) {
      await sock.logout('User requested logout');
    }
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    setTimeout(() => startWhatsAppSocket(), 1500);

    return res.json({
      success: true,
      message: 'Logged out successfully. Generating new QR code.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error logging out',
    });
  }
});

// Start Express server and Baileys
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 [Baileys WhatsApp Service] REST API listening on http://0.0.0.0:${PORT}`);
  console.log(`📁 [Baileys] Storing session credentials in: ${AUTH_DIR}\n`);
  startWhatsAppSocket();
});
