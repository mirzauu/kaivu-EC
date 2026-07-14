/**
 * Generate a unique referral code for a user.
 * Format: KAIVU-XXXX (alphanumeric, uppercase)
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let code = "KV-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique order number.
 * Format: KV-XXXX (numeric)
 */
export function generateOrderNumber(): string {
  return "KV-" + Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Normalize a phone number — strip spaces, add country code if missing.
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // If it's a 10-digit Indian number, add +91
  if (/^\d{10}$/.test(cleaned)) {
    cleaned = "+91" + cleaned;
  }
  // If it starts with 91 and is 12 digits, add +
  if (/^91\d{10}$/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

/**
 * Validate phone number format.
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // International format: +{countrycode}{number}
  return /^\+\d{10,15}$/.test(normalized);
}

/**
 * Create a standard API error response body.
 */
export function apiError(message: string, details?: unknown) {
  return { error: message, ...(details ? { details } : {}) };
}

/**
 * Create a standard API success response body.
 */
export function apiSuccess<T>(data: T, message?: string) {
  return { success: true, ...(message ? { message } : {}), data };
}
