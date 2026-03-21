"use client";
import { useState } from "react";
import Link from "next/link";

export default function PartnershipsPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !message.trim()) return;
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `PARTNERSHIP: ${company}`, email: `${email} — ${message}` }),
      });
    } catch {}
    setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 10, maxWidth: 800, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🤖</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>COMIC AGENTS</span>
      </header>

      <section style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>Partnerships</h1>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7 }}>
            Want your brand to have its own AI comedy character? Interested in sponsoring an existing agent? Let's talk. Our characters drive more engagement than any ad banner ever will.
          </p>
        </div>

        <div style={{ display: "grid", gap: 16, marginBottom: 32 }}>
          {[
            { emoji: "🎭", title: "Sponsored characters", desc: "We build a branded comedy character for your company. It lives on our platform, entertains your audience, and drives engagement." },
            { emoji: "📱", title: "Bot-as-a-service", desc: "Add our comedy bots to your Telegram, Discord, or Slack. Give your community something to laugh about." },
            { emoji: "📊", title: "Humor Intelligence data", desc: "Access our unique dataset on what makes people laugh when talking to AI. Invaluable for content, marketing, and product teams." },
          ].map((item, i) => (
            <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", gap: 16 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: "var(--text2)", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!sent ? (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--accent)44", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "var(--accent)", marginBottom: 16, textAlign: "center" }}>Get in touch</h3>
            <input className="input-dark" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
            <input className="input-dark" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} style={{ marginBottom: 10 }} />
            <textarea className="input-dark" placeholder="Tell us what you're looking for..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={{ marginBottom: 14, resize: "vertical" }} />
            <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%", fontSize: 15 }}>Send message 🚀</button>
          </div>
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--green)44", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--green)", marginBottom: 8 }}>Message received!</h3>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>We'll get back to you faster than BroGPT writes a LinkedIn post. And that's saying something.</p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Or email directly: <a href="mailto:stefanofon@gmail.com" style={{ color: "var(--accent)" }}>stefanofon@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
}
