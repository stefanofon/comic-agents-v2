"use client";
import { useState, useEffect } from "react";

export default function InviteFloat() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [invitesLeft, setInvitesLeft] = useState(10);
  const [sent, setSent] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("comic_agents_user");
    if (saved) setUser(JSON.parse(saved));
    const savedInvites = localStorage.getItem("ca_invites_sent");
    if (savedInvites) {
      const list = JSON.parse(savedInvites);
      setSent(list);
      setInvitesLeft(10 - list.length);
    }
  }, []);

  if (!user) return null;

  const sendInvite = async () => {
    if (!email.trim() || sending) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email."); return; }
    if (invitesLeft <= 0) { setError("No invites left!"); return; }
    if (sent.includes(email.trim().toLowerCase())) { setError("Already invited!"); return; }
    setSending(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", email: email.trim().toLowerCase(), invitedBy: user.email, invitedByName: user.name }),
      });
      const data = await res.json();
      if (data.error === "duplicate") { setError("Already on the platform!"); }
      else {
        const newSent = [...sent, email.trim().toLowerCase()];
        setSent(newSent); setInvitesLeft(10 - newSent.length);
        localStorage.setItem("ca_invites_sent", JSON.stringify(newSent));
        setSuccess("Invite sent!"); setEmail("");
      }
    } catch { setError("Something went wrong."); }
    setSending(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 8000, width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(168,85,247,0.4)", transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>
        <span style={{ fontSize: 24 }}>{open ? "✕" : "💌"}</span>
      </button>
      {!open && invitesLeft > 0 && (
        <div style={{ position: "fixed", bottom: 64, right: 16, zIndex: 8001, background: "var(--green)", color: "#000", fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{invitesLeft}</div>
      )}
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 7999 }} onClick={() => setOpen(false)} />
          <div style={{ position: "fixed", bottom: 86, right: 20, zIndex: 8000, background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid var(--accent)44", width: 320, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>💌 Invite friends</span>
              <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: invitesLeft > 0 ? "var(--accent)22" : "var(--red)22", color: invitesLeft > 0 ? "var(--accent)" : "var(--red)" }}>{invitesLeft}/10</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>They'll receive an email with the access code.</p>
            <div style={{ display: "flex", gap: 6, marginBottom: error || success ? 6 : 0 }}>
              <input className="input-dark" placeholder="friend@email.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }} onKeyDown={(e) => e.key === "Enter" && sendInvite()} disabled={invitesLeft <= 0 || sending} style={{ flex: 1, padding: "8px 12px", fontSize: 12 }} />
              <button className="btn-primary" onClick={sendInvite} disabled={!email.trim() || invitesLeft <= 0 || sending} style={{ padding: "8px 14px", fontSize: 12, opacity: !email.trim() || invitesLeft <= 0 ? 0.5 : 1 }}>{sending ? "..." : "Send"}</button>
            </div>
            {error && <p style={{ fontSize: 10, color: "var(--red)", margin: 0 }}>{error}</p>}
            {success && <p style={{ fontSize: 10, color: "var(--green)", margin: 0 }}>{success}</p>}
            {sent.length > 0 && (
              <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>Sent:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 120, overflow: "auto" }}>
                  {sent.map((e, i) => (<span key={i} style={{ fontSize: 11, color: "var(--green)" }}>✅ {e}</span>))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
