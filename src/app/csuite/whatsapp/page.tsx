"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Server,
  Zap,
  Users,
  MessageSquare,
} from "lucide-react";

interface WhatsAppGroup {
  id: string;
  subject: string;
  participantsCount: number;
}

interface WhatsAppStatusResponse {
  serviceOnline: boolean;
  status: "connected" | "qr_ready" | "connecting" | "disconnected";
  user?: { id?: string; name?: string; phone?: string } | null;
  lastConnectedAt?: string | null;
  qrDataUrl?: string | null;
  qrRaw?: string | null;
  disconnectReason?: string | null;
  groups?: WhatsAppGroup[];
}

export default function WhatsAppManagementPage() {
  const [data, setData] = useState<WhatsAppStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recipientType, setRecipientType] = useState<"phone" | "group">("phone");
  const [testPhone, setTestPhone] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [customGroupId, setCustomGroupId] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Kaivu WhatsApp Baileys!");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setData({
          serviceOnline: false,
          status: "disconnected",
          disconnectReason: json.error || "Service unavailable",
        });
      }
    } catch (err) {
      setData({
        serviceOnline: false,
        status: "disconnected",
        disconnectReason: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 4 seconds for responsive QR scan updates
    const interval = setInterval(() => {
      fetchStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const destination =
      recipientType === "phone"
        ? testPhone.trim()
        : selectedGroup === "custom"
        ? customGroupId.trim()
        : selectedGroup.trim();

    if (!destination || !testMessage.trim()) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-test",
          phone: destination,
          message: testMessage,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setTestResult({
          success: true,
          text: `Message dispatched successfully! (ID: ${result.data?.messageId || "OK"})`,
        });
      } else {
        setTestResult({
          success: false,
          text: result.error || "Failed to send message",
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        text: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to unlink this WhatsApp session? You will need to scan a new QR code to reconnect.")) {
      return;
    }
    setLoggingOut(true);
    try {
      await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      await fetchStatus(true);
    } catch (err) {
      alert("Failed to unlink: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/csuite"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                WhatsApp Device Manager
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Direct and Group Messaging via Baileys Multi-Device Protocol
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                data?.status === "connected"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : data?.status === "qr_ready"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {data?.status === "connected" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : data?.status === "qr_ready" ? (
                <QrCode className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Status</div>
              <div className="text-base font-bold capitalize text-white">
                {loading
                  ? "Checking..."
                  : data?.status === "connected"
                  ? "Connected & Live"
                  : data?.status === "qr_ready"
                  ? "Ready for QR Scan"
                  : data?.status === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Service Engine</div>
              <div className="text-base font-bold text-white">
                {data?.serviceOnline ? "Baileys (Port 3001)" : "Service Offline"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Device</div>
              <div className="text-base font-bold text-white truncate max-w-[140px]">
                {data?.user?.phone ? `+${data.user.phone}` : "No Device"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-500/20 text-teal-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Joined Groups</div>
              <div className="text-base font-bold text-white">
                {data?.groups ? `${data.groups.length} Groups` : "0 Groups"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
            <p>Connecting to WhatsApp service...</p>
          </div>
        ) : !data?.serviceOnline ? (
          /* Service Offline Guide */
          <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-200">Baileys Service is not running</h2>
                <p className="text-sm text-rose-300/80 mt-1">
                  The background WhatsApp server is currently offline or unreachable on port 3001.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-rose-900/30 text-sm font-mono text-emerald-400">
                  npm run whatsapp:service
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Run the command above in a separate terminal to start the Baileys service.
                </p>
              </div>
            </div>
          </div>
        ) : data?.status === "connected" ? (
          /* Connected State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Info Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Linked WhatsApp Account
                </h2>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone Number:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{data.user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Name:</span>
                  <span className="text-slate-200">{data.user?.name || "Kaivu Store"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connected Since:</span>
                  <span className="text-slate-200">
                    {data.lastConnectedAt ? new Date(data.lastConnectedAt).toLocaleString() : "Active"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Participating Groups:</span>
                  <span className="text-slate-200 font-semibold">{data.groups?.length || 0}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Unlinking..." : "Unlink / Logout This Device"}
                </button>
              </div>
            </div>

            {/* Test Message Dispatcher (Direct or Group) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Dispatch WhatsApp Message
              </h2>

              {/* Target Type Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRecipientType("phone")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                    recipientType === "phone"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Direct Phone
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType("group")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                    recipientType === "group"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  WhatsApp Group
                </button>
              </div>

              <form onSubmit={handleSendTestMessage} className="space-y-4">
                {recipientType === "phone" ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Recipient Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Select WhatsApp Group
                    </label>
                    {data.groups && data.groups.length > 0 ? (
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      >
                        <option value="">-- Choose a group --</option>
                        {data.groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.subject} ({group.participantsCount} members)
                          </option>
                        ))}
                        <option value="custom">+ Enter custom Group JID</option>
                      </select>
                    ) : (
                      <div className="text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        No groups found or group fetching not completed. You can enter a group JID below.
                      </div>
                    )}

                    {(selectedGroup === "custom" || !data.groups || data.groups.length === 0) && (
                      <input
                        type="text"
                        placeholder="e.g. 120363421953306400@g.us"
                        value={customGroupId}
                        onChange={(e) => setCustomGroupId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Message Text</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingTest ? "Sending..." : `Send to ${recipientType === "phone" ? "Phone" : "Group"}`}
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {testResult.text}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* QR Code Scan Area */
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl shadow-emerald-950/20">
              {data?.qrDataUrl ? (
                <img
                  src={data.qrDataUrl}
                  alt="WhatsApp Pairing QR Code"
                  className="w-64 h-64 md:w-72 md:h-72 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-600 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium">Generating QR Code...</span>
                </div>
              )}
              <div className="mt-3 text-xs text-slate-600 font-medium">Scan with WhatsApp Linked Devices</div>
            </div>

            <div className="space-y-4 max-w-md">
              <h2 className="text-xl font-bold text-white">How to link your WhatsApp</h2>
              <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
                <li>Open <strong>WhatsApp</strong> on your phone.</li>
                <li>Tap <strong>Settings</strong> or the <strong>Three Dots Menu (⋮)</strong>.</li>
                <li>Tap <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong>.</li>
                <li>Point your camera at this QR code to complete pairing.</li>
              </ol>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Persistent Multi-Device Session
                </div>
                <p>
                  Once scanned, session credentials are encrypted and stored locally. The service will automatically
                  reconnect whenever the server restarts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
