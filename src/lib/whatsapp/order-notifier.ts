import { sendWhatsAppTextMessage } from "./client";

export interface OrderNotificationPayload {
  orderNumber: string;
  total: number | string;
  paymentMethod?: string | null;
  deliveryAddress?: string | null;
  deliveryLat?: number | string | null;
  deliveryLng?: number | string | null;
  items: Array<{
    itemName: string;
    quantity: number;
    itemPrice: number | string;
  }>;
  customer?: {
    name?: string | null;
    phone?: string | null;
  };
}

/**
 * Dispatches an automated WhatsApp order alert to the designated store WhatsApp group.
 */
export async function notifyNewOrderToWhatsAppGroup(payload: OrderNotificationPayload) {
  const groupId =
    process.env.WHATSAPP_ORDER_NOTIFICATION_GROUP_ID || "120363411261970886@g.us";

  try {
    const itemsList = payload.items
      .map(
        (item) =>
          `• ${item.quantity}x *${item.itemName}* (₹${Number(item.itemPrice) * item.quantity})`
      )
      .join("\n");

    const customerDetails = payload.customer
      ? `👤 *Customer:* ${payload.customer.name || "Customer"} (${payload.customer.phone || "N/A"})\n`
      : "";

    const lat = payload.deliveryLat != null ? Number(payload.deliveryLat) : null;
    const lng = payload.deliveryLng != null ? Number(payload.deliveryLng) : null;
    const hasGps = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
    const googleMapsUrl = hasGps ? `https://maps.google.com/?q=${lat},${lng}` : null;

    let addressDetails = "";
    if (payload.deliveryAddress) {
      addressDetails = `📍 *Delivery Address:*\n${payload.deliveryAddress}\n`;
      if (googleMapsUrl) {
        addressDetails += `🗺️ *Google Maps Link:*\n${googleMapsUrl}\n`;
      }
    } else {
      addressDetails = "📍 *Delivery:* Dine-in / Takeaway\n";
    }

    const formattedTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const message = [
      `🍔 *NEW KAIVU ORDER RECEIVED!*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Order ID:* #${payload.orderNumber}`,
      customerDetails.trim(),
      `💰 *Total Amount:* ₹${Number(payload.total).toFixed(2)} (${payload.paymentMethod || "WALLET"})`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Items Ordered:*`,
      itemsList,
      `━━━━━━━━━━━━━━━━━━━━`,
      addressDetails.trim(),
      `⏰ *Time:* ${formattedTime}`,
      `━━━━━━━━━━━━━━━━━━━━`,
    ]
      .filter(Boolean)
      .join("\n");

    console.log(`[WhatsApp Notifier] 📢 Dispatching new order #${payload.orderNumber} to group ${groupId}...`);
    const result = await sendWhatsAppTextMessage(groupId, message);

    if (result.success) {
      console.log(`[WhatsApp Notifier] ✅ Order #${payload.orderNumber} notification sent to group! (ID: ${result.messageId})`);
    } else {
      console.warn(`[WhatsApp Notifier] ⚠️ Could not send order notification to group:`, result.error);
    }
  } catch (error) {
    console.error("[WhatsApp Notifier] ❌ Error notifying WhatsApp group:", error);
  }
}
