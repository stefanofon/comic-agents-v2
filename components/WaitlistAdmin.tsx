"use client";
import { useState, useEffect } from "react";

export default function WaitlistAdmin() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchWaitlist = async () => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      setWaitlist(data.waitlist || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchWaitlist(); }, []);

  const approve = async (email: string) => {
    setApproving(email);
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", email }),
    });
    setApproving(null);
    fetchWaitlist();
  };

  const approveAll = async () => {
    setApproving("all");
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_all" }),
    });
    setApproving(null);
    fetchWaitlist();
  };

  const pending = waitlist.filter(w => !w.is_invited);
  const approved = waitlist.filter(w => w.is_invited);

  if (loading) return <div style={{ padding: 30, textAlign: "center", color: "var(--text3)" }}>Loading waitlist...</div>;

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 12, padding: 14, border: "1px solid var(--yellow)33", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--yellow)" }}>{pending.length}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Pending requests</div>
        </div>
        <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 12, padding: 14, border: "1px solid var(--green)33", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{approved.length}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Approved</div>
        </div>
        <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 12, padding: 14, border: "1px solid var(--accent)33", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{waitlist.length}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Total</div>
        </div>
      </div>

      {/* Approve all button */}
      {pending.length > 0 && (
        <button
          onClick={approveAll}
          disabled={approving === "all"}
          style={{
            width: "100%", padding: 12, borderRadius: 10, border: "none",
            background: "var(--green)", color: "#000", fontWeight: 700,
            cursor: approving === "all" ? "wait" : "pointer", fontFamily: "inherit",
            fontSize: 14, marginBottom: 16,
          }}
        >
          {approving === "all" ? "Approving & sending emails..." : `✅ Approve all ${pending.length} pending & send access codes`}
        </button>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, color: "var(--yellow)" }}>
            ⏳ Pending requests ({pending.length})
          </div>
          {pending.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)" }}>{w.source || "—"}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{w.email}</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>{new Date(w.created_at).toLocaleDateString()}</div>
              <button
                onClick={() => approve(w.email)}
                disabled={approving === w.email}
                style={{
                  padding: "5px 14px", borderRadius: 8, border: "none",
                  background: "var(--green)", color: "#000", fontWeight: 700,
                  cursor: approving === w.email ? "wait" : "pointer",
                  fontFamily: "inherit", fontSize: 11,
                }}
              >
                {approving === w.email ? "..." : "✅ Approve"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Approved list */}
      <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
          ✅ Approved ({approved.length})
        </div>
        {approved.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>No approved users yet</div>
        )}
        {approved.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
            <span style={{ color: "var(--green)" }}>✅</span>
            <span style={{ color: "var(--text1)", flex: 1 }}>{w.email}</span>
            <span style={{ color: "var(--text3)", fontSize: 10 }}>{w.invited_at ? new Date(w.invited_at).toLocaleDateString() : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
