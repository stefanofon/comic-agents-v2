"use client";
import { useState, useEffect } from "react";

export default function InvitePanel() {
  const [email, setEmail] = useState("");
  const [invitesLeft, setInvitesLeft] = useState(10);
  const [sent, setSent] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedInvites = localStorage.getItem("ca_invites_sent");
    if (savedInvites) {
      const list = JSON.parse(savedInvites);
      setSent(list);
      setInvitesLeft(10 - list.length);
    }
  }, []);

  const sendInvite = async () => {
    if (!email.trim() || sending) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (invitesLeft <= 0) {
      setError("No invites left! You've used all 10.");
      return;
    }
    if (sent.includes(email.trim().toLowerCase())) {
      setError("You already invited this person!");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    const inviterEmail = localStorage.getItem("ca_user_email") || "";
    const inviterName = (() => { try { return JSON.parse(localStorage.getItem("comic_agents_user") || "{}").name || "A friend"; } catch { return "A friend"; } })();

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: email.trim().toLowerCase(),
          invitedBy: inviterEmail,
          invitedByName: inviterName,
        }),
      });
      const data = await res.json();
      
      if (data.error === "duplicate") {
        setError("This person is already on the platform!");
      } else if (data.ok) {
        const newSent = [...sent, email.trim().toLowerCase()];
        setSent(newSent);
        setInvitesLeft(10 - newSent.length);
        localStorage.setItem("ca_invites_sent", JSON.stringify(newSent));
        setSuccess(`Invite sent to ${email}! They'll receive the access code.`);
        setEmail("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setSending(false);
  };

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid var(--accent)33" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>💌</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>Invite friends</span>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
          background: invitesLeft > 0 ? "var(--accent)22" : "var(--red)22",
          color: invitesLeft > 0 ? "var(--accent)" : "var(--red)",
          border: `1px solid ${invitesLeft > 0 ? "var(--accent)44" : "var(--red)44"}`,
        }}>
          {invitesLeft} invites left
        </span>
      </div>

      <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, lineHeight: 1.5 }}>
        Share the laughs! Invite friends to Comic Agents. They'll receive an email with the access code.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: error || success ? 6 : 0 }}>
        <input
          className="input-dark"
          placeholder="friend@email.com"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
          onKeyDown={(e) => e.key === "Enter" && sendInvite()}
          disabled={invitesLeft <= 0 || sending}
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={sendInvite}
          disabled={!email.trim() || invitesLeft <= 0 || sending}
          style={{ whiteSpace: "nowrap", opacity: !email.trim() || invitesLeft <= 0 ? 0.5 : 1 }}
        >
          {sending ? "Sending..." : "Send invite 💌"}
        </button>
      </div>

      {error && <p style={{ fontSize: 11, color: "var(--red)", margin: "4px 0 0" }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: "var(--green)", margin: "4px 0 0" }}>{success}</p>}

      {sent.length > 0 && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>Sent invites:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {sent.map((e, i) => (
              <span key={i} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 6,
                background: "var(--green)15", color: "var(--green)",
                border: "1px solid var(--green)33",
              }}>✅ {e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
