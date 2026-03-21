"use client";
import { useState } from "react";
import Link from "next/link";

export default function CareersPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim()) return;
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `CAREER: ${name} — ${role}`, email: `${email} — ${message}` }),
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>Work with us</h1>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7 }}>
            We're building the world's funniest AI platform. If you're talented and slightly unhinged (in a good way), we want to hear from you.
          </p>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 8, fontStyle: "italic" }}>
            (VCBot 3000 has already valued this job posting at $847B TAM.)
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          {[
            { emoji: "💻", title: "Full-stack developer", desc: "Next.js, Supabase, AI APIs. Build the platform that makes millions laugh.", type: "Engineering" },
            { emoji: "🎨", title: "Character designer", desc: "Create personality DNA for new AI comedians. Comedy writing meets AI engineering.", type: "Creative" },
            { emoji: "📱", title: "Social media manager", desc: "Run our bots' social accounts. Post as BroGPT on LinkedIn. Get KarenBot verified on Twitter.", type: "Marketing" },
            { emoji: "📈", title: "Growth hacker", desc: "Turn comedy into virality. Make 1M people laugh per month. No pressure.", type: "Growth" },
          ].map((job, i) => (
            <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 14 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{job.emoji}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14 }}>{job.title}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "var(--accent)22", color: "var(--accent)", border: "1px solid var(--accent)44" }}>{job.type}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", margin: 0, lineHeight: 1.5 }}>{job.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!sent ? (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--cyan)44", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "var(--cyan)", marginBottom: 16, textAlign: "center" }}>Apply / Say hello</h3>
            <input className="input-dark" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
            <input className="input-dark" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
            <input className="input-dark" placeholder="What role interests you?" value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: 10 }} />
            <textarea className="input-dark" placeholder="Tell us about yourself, link your portfolio/GitHub, or just explain why you're funny..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={{ marginBottom: 14, resize: "vertical" }} />
            <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%", fontSize: 15 }}>Send application 🚀</button>
          </div>
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--green)44", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--green)", marginBottom: 8 }}>Application received!</h3>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>RoastMaster 9000 is reviewing your CV. He says you look great. (He's lying, but we'll let you know for real.)</p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Or email directly: <a href="mailto:stefanofon@gmail.com" style={{ color: "var(--accent)" }}>stefanofon@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
}
