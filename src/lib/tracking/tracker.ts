/**
 * Client-side event tracker for Kaivu.
 * Buffers events and flushes to /api/track in batches.
 *
 * Usage:
 *   import { tracker } from "@/lib/tracking/tracker";
 *   tracker.track("ADD_TO_CART", { itemId: "xxx", price: 260 });
 *   tracker.track("PAGE_VIEW", { page: "/menu" });
 */

type TrackEvent = {
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 20;

class EventTracker {
  private buffer: TrackEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();

    if (typeof window !== "undefined") {
      // Flush on interval
      this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL);

      // Flush on page unload
      window.addEventListener("beforeunload", () => this.flush());

      // Flush on visibility change (tab hidden)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });
    }
  }

  private generateSessionId(): string {
    if (typeof window === "undefined") return "server";
    const stored = sessionStorage.getItem("kaivu_session_id");
    if (stored) return stored;
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("kaivu_session_id", id);
    return id;
  }

  /**
   * Track an event.
   */
  track(eventType: string, metadata?: Record<string, unknown>) {
    if (typeof window === "undefined") return; // SSR guard

    this.buffer.push({
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Auto-flush if buffer is full
    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush buffered events to the server.
   */
  async flush() {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      // Use sendBeacon for reliability on page unload
      const payload = JSON.stringify({
        events,
        sessionId: this.sessionId,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", payload);
      } else {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // Put events back in buffer on failure
      this.buffer.unshift(...events);
    }
  }

  /**
   * Clean up resources.
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const tracker =
  typeof window !== "undefined" ? new EventTracker() : ({
    track: () => {},
    flush: async () => {},
    destroy: () => {},
  } as unknown as EventTracker);
