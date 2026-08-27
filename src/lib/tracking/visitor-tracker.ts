/**
 * Zero-latency client-side visitor tracker.
 * Detects first-time visitors synchronously using localStorage and dispatches
 * a non-blocking background alert without impacting page load speed.
 */

const VISITOR_STORAGE_KEY = "kaivu_visitor_tracked_v1";

export function trackNewVisitor(currentPath: string = "/") {
  if (typeof window === "undefined") return;

  // Don't track admin pages
  if (currentPath.startsWith("/csuite")) return;

  try {
    const alreadyTracked = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (alreadyTracked) {
      // Returning visitor — 0ms overhead, immediate return
      return;
    }

    // Mark as tracked immediately
    localStorage.setItem(VISITOR_STORAGE_KEY, "true");
    localStorage.setItem("kaivu_first_visit_time", new Date().toISOString());

    const payload = JSON.stringify({
      pathname: currentPath || window.location.pathname || "/",
      referrer: document.referrer || "",
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || "en",
      userAgent: navigator.userAgent || "",
    });

    const endpoint = "/api/analytics/new-visitor";

    // Dispatch in background via sendBeacon or non-blocking keepalive fetch
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, payload);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently so user experience is never interrupted
    console.debug("[VisitorTracker] error:", e);
  }
}
