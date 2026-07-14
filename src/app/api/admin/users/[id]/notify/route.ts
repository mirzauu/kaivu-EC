import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import webpush from "web-push";

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:alerts@kaivu.dev",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

/**
 * POST /api/admin/users/[id]/notify
 * Sends a custom push notification to a specific user's registered devices.
 */
export const POST = withAdmin(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;
      const { title, body } = await req.json();

      if (!title || !body) {
        return NextResponse.json(
          apiError("Title and body are required for notifications"),
          { status: 400 }
        );
      }

      // Check if user exists
      const user = await db.user.findUnique({
        where: { id },
      });

      if (!user) {
        return NextResponse.json(apiError("User not found"), { status: 404 });
      }

      // Save notification record to the database
      await db.notification.create({
        data: {
          userId: id,
          title,
          body,
        },
      });

      // Query active subscriptions
      const subscriptions = await db.pushSubscription.findMany({
        where: { userId: id },
      });

      if (subscriptions.length === 0) {
        return NextResponse.json(
          apiError("User has no registered devices for notifications"),
          { status: 400 }
        );
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: "/images/menu/burger-classic.jpg",
        url: "/orders", // default destination
      });

      // Send pushes asynchronously
      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          ).catch(async (err) => {
            // Clean up invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
              await db.pushSubscription.delete({ where: { id: sub.id } });
            }
            throw err; // rethrow to register as failed in Promise.allSettled
          })
        )
      );

      const successfulCount = results.filter((r) => r.status === "fulfilled").length;
      const failedCount = results.length - successfulCount;

      return NextResponse.json(
        apiSuccess(
          { successfulCount, failedCount },
          `Notification sent. Successfully dispatched to ${successfulCount} devices (failed on ${failedCount}).`
        )
      );
    } catch (error) {
      console.error("Admin user notify error:", error);
      return NextResponse.json(apiError("Failed to send push notification"), { status: 500 });
    }
  }
);
