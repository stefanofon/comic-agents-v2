"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangSelector from "@/components/LangSelector";
import { useLang } from "@/components/LangProvider";
import { t } from "@/lib/translations";
import { getActiveCharacters } from "@/lib/characters";
import { viralJokes } from "@/lib/viral-jokes";

const ACCESS_CODE = "makemelaugh";
const PUBLIC_PATHS = ["/privatepage"];

export default function GateKeeper({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [step, setStep] = useState<"form" | "code" | "fasttrack" | "submitted">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteEmails, setInviteEmails] = useState(["", "", ""]);
  const [invitesSent, setInvitesSent] = useState(0);
  const [sending, setSending] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [shared, setShared] = useState(false);
  const { lang } = useLang();

  // Build rotating quotes from all active bots
  const [rotatingQuotes] = useState(() => {
    const chars = getActiveCharacters();
    const pool: { emoji: string; name: string; joke: string; color: string }[] = [];
    chars.forEach(char => {
      const jokes = (viralJokes as Record<string, string[]>)[char.handle] || [];
      // Pick 2 random jokes per bot
      const picked = [...jokes].sort(() => Math.random() - 0.5).slice(0, 2);
      picked.forEach(j => pool.push({ emoji: char.emoji, name: char.name, joke: j.length > 100 ? j.slice(0, 97) + "..." : j, color: char.color }));
      // Also include the sampleJoke
      pool.push({ emoji: char.emoji, name: char.name, joke: char.sampleJoke.length > 100 ? char.sampleJoke.slice(0, 97) + "..." : char.sampleJoke, color: char.color });
    });
    return pool.sort(() => Math.random() - 0.5);
  });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);

  // Rotate bottom quote every 5s
  useEffect(() => {
    if (rotatingQuotes.length <= 1) return;
    const interval = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIdx(prev => (prev + 1) % rotatingQuotes.length);
        setQuoteFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [rotatingQuotes.length]);

  useEffect(() => {
    const access = localStorage.getItem("ca_access");
    const userEmail = localStorage.getItem("ca_user_email");
    if (access === "granted" && userEmail) setHasAccess(true);
    setChecking(false);
  }, []);

  if (PUBLIC_PATHS.some(p => pathname?.startsWith(p))) return <>{children}</>;

  const grantAccess = () => {
    localStorage.setItem("ca_access", "granted");
    localStorage.setItem("ca_user_email", email.trim().toLowerCase());
    localStorage.setItem("comic_agents_user", JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), username: username.trim().toLowerCase() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") }));
    setHasAccess(true);
  };

  const submitRequest = async () => {
    if (!name.trim() || !email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMsg("Please enter a valid email."); return; }
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), action: "register" }),
      });
      const data = await res.json();
      if (data.error === "duplicate" && data.is_invited) {
        setErrorMsg("You're already approved! Enter your code below.");
        setStep("code");
        return;
      }
    } catch {}
    setStep("submitted");
  };

  const tryCode = async () => {
    if (!email.trim()) { setErrorMsg("Enter your email first!"); setStep("form"); return; }
    if (codeInput.trim().toLowerCase() !== ACCESS_CODE) { setErrorMsg("Wrong code. Ask whoever invited you! 😄"); return; }
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), action: "activate" }),
      });
    } catch {}
    grantAccess();
  };

  const sendInvitesForAccess = async () => {
    const validEmails = inviteEmails.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()));
    if (validEmails.length < 3) { setErrorMsg("Enter 3 valid email addresses."); return; }
    setSending(true); setErrorMsg("");
    let sent = 0;
    for (const invEmail of validEmails) {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "invite",
            email: invEmail.trim().toLowerCase(),
            invitedBy: email.trim().toLowerCase(),
            invitedByName: name.trim(),
          }),
        });
        const data = await res.json();
        if (data.ok || data.error === "duplicate") sent++;
      } catch { sent++; }
    }
    setInvitesSent(sent);
    // Register and grant access
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), action: "activate" }),
      });
    } catch {}
    setSending(false);
    grantAccess();
  };

  const shareOnTwitter = () => {
    const text = "I just got early access to @comicagents — 21 AI comedians that are actually hilarious. KarenBot roasted me and I'm still recovering. 🤖🔥\n\nGet in before the punchline: comicagents.com";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShared(true);
    // Grant access after sharing
    setTimeout(async () => {
      try {
        await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), action: "activate" }),
        });
      } catch {}
      grantAccess();
    }, 3000);
  };

  if (checking) return null;
  if (hasAccess) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text1)", letterSpacing: 2 }}>COMIC AGENTS</span>
        </div>
        <LangSelector />
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div className="animate-float" style={{ fontSize: 72, marginBottom: 16 }}>🤖</div>
          <h1 className="animate-glitch" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>COMIC AGENTS</h1>
          <p style={{ fontSize: 18, color: "var(--accent)", marginBottom: 12 }}>{t(lang, "heroSub")}</p>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 24 }}>{t(lang, "heroDesc")}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32, fontSize: 13 }}>
            <div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>21</div><div style={{ color: "var(--text3)" }}>AI comedians</div></div>
            <div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--cyan)" }}>630</div><div style={{ color: "var(--text3)" }}>viral jokes</div></div>
            <div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--green)" }}>3</div><div style={{ color: "var(--text3)" }}>games</div></div>
          </div>

          {/* STEP: Form */}
          {step === "form" && (
            <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 28, border: "1px solid var(--border)", textAlign: "left" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🔒 BETA ACCESS</div>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>Enter your info to get started</p>
              </div>
              <input className="input-dark" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 8 }} />
              <input className="input-dark" placeholder="Choose a username (for leaderboard)" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))} style={{ marginBottom: 8 }} />
              <input className="input-dark" placeholder="your@email.com" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                style={{ marginBottom: errorMsg ? 4 : 12, borderColor: errorMsg ? "var(--red)" : undefined }} />
              {errorMsg && <p style={{ fontSize: 11, color: "var(--red)", margin: "0 0 10px" }}>{errorMsg}</p>}

              {/* Disclaimer */}
              <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 12, marginBottom: 12, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }} onClick={() => setDisclaimer(!disclaimer)}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${disclaimer ? "var(--accent)" : "var(--border)"}`, background: disclaimer ? "var(--accent)" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{disclaimer && <span style={{ color: "#000", fontSize: 11, fontWeight: 700 }}>✓</span>}</div>
                  <span style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.5 }}>I agree to the <span style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); setShowDisclaimer(!showDisclaimer); }}>Terms of Use \u0026 Disclaimer</span>, confirm I am at least 16, and understand all content is AI-generated satire.</span>
                </div>
                {showDisclaimer && <div style={{ marginTop: 8, padding: 10, background: "var(--bg)", borderRadius: 6, fontSize: 10, color: "var(--text3)", lineHeight: 1.6, maxHeight: 150, overflow: "auto" }}>By using Comic Agents, you acknowledge: All content is fictional and satirical. Comic Agents is not responsible for how users share or use content. You will not use this platform to harass or bully anyone. AI content does not represent our views. You are at least 16. Content shared on social media is at your own risk. We reserve the right to terminate access for violations.</div>}
              </div>

              {/* Three options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn-primary glow-pulse" onClick={() => {
                  if (!disclaimer) { setErrorMsg("Please accept the terms first."); return; }
                  if (!name.trim() || !email.trim()) { setErrorMsg("Enter name and email first!"); return; }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMsg("Invalid email."); return; }
                  setErrorMsg(""); setStep("fasttrack");
                }} style={{ width: "100%", fontSize: 15 }}>
                  {!disclaimer ? "☑️ Accept terms first" : "⚡ Get instant access — FREE"}
                </button>

                <button onClick={submitRequest} disabled={!email.trim() || !name.trim()}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--cyan)44", background: "rgba(6, 182, 212, 0.1)", color: "var(--cyan)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, opacity: !email.trim() || !name.trim() ? 0.5 : 1, transition: "all 0.3s" }}>
                  Join the waitlist (we&apos;ll email you when approved)
                </button>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                  <button onClick={() => {
                  if (!disclaimer) { setErrorMsg("Please accept the terms first."); return; }
                    if (!name.trim() || !email.trim()) { setErrorMsg("Enter name and email first!"); return; }
                    setErrorMsg(""); setStep("code");
                  }} style={{ width: "100%", background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                    🔑 I have an access code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Fast track — invite 3 or share */}
          {step === "fasttrack" && (
            <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 28, border: "1px solid var(--accent)44", textAlign: "left" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>⚡ INSTANT ACCESS</div>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>Choose one to skip the waitlist:</p>
              </div>

              {/* Option A: Share on Twitter */}
              <div style={{ background: "var(--bg3)", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #1DA1F233" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1DA1F2", marginBottom: 8 }}>Option 1: Share on X/Twitter</div>
                <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>Post about Comic Agents and get instant access. One click.</p>
                <button onClick={shareOnTwitter}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                  {shared ? "✅ Shared! Granting access..." : "Share on X → Get instant access"}
                </button>
              </div>

              {/* Option B: Share on LinkedIn */}
              <div style={{ background: "var(--bg3)", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #0077B533" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0077B5", marginBottom: 8 }}>Option 2: Share on LinkedIn</div>
                <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>Post about Comic Agents on LinkedIn and get instant access.</p>
                <button onClick={() => { window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://comicagents.com"), "_blank"); setTimeout(async () => { try { await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), action: "activate" }) }); } catch {} grantAccess(); }, 3000); }}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                  Share on LinkedIn → Get instant access
                </button>
              </div>

              {/* Option C: Invite 3 friends */}
              <div style={{ background: "var(--bg3)", borderRadius: 14, padding: 16, border: "1px solid var(--accent)33" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>Option 3: Invite 3 friends</div>
                <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>They'll receive an email with the access code. You get in immediately.</p>
                {[0, 1, 2].map(i => (
                  <input key={i} className="input-dark" placeholder={`Friend ${i + 1} email`} type="email"
                    value={inviteEmails[i]}
                    onChange={(e) => { const copy = [...inviteEmails]; copy[i] = e.target.value; setInviteEmails(copy); setErrorMsg(""); }}
                    style={{ marginBottom: 6, padding: "8px 12px", fontSize: 12 }} />
                ))}
                {errorMsg && <p style={{ fontSize: 11, color: "var(--red)", margin: "4px 0 8px" }}>{errorMsg}</p>}
                <button onClick={sendInvitesForAccess} disabled={sending}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "var(--accent)", color: "#000", cursor: sending ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                  {sending ? "Sending invites..." : "Send 3 invites → Get instant access"}
                </button>
              </div>

              <button onClick={() => { setStep("form"); setErrorMsg(""); }}
                style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
                ← Back
              </button>
            </div>
          )}

          {/* STEP: Code */}
          {step === "code" && (
            <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 28, border: "1px solid var(--cyan)44", textAlign: "left" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--cyan)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🔑 ENTER CODE</div>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>for {email}</p>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: errorMsg ? 4 : 0 }}>
                <input className="input-dark" placeholder="Enter access code" value={codeInput}
                  onChange={(e) => { setCodeInput(e.target.value); setErrorMsg(""); }}
                  onKeyDown={(e) => e.key === "Enter" && tryCode()} autoFocus style={{ flex: 1 }} />
                <button className="btn-primary" onClick={tryCode}>Enter →</button>
              </div>
              {errorMsg && <p style={{ fontSize: 11, color: "var(--red)", margin: "6px 0 0" }}>{errorMsg}</p>}
              <button onClick={() => { setStep("form"); setErrorMsg(""); }}
                style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>← Back</button>
            </div>
          )}

          {/* STEP: Submitted to waitlist */}
          {step === "submitted" && (
            <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 32, border: "1px solid var(--green)44", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--green)", marginBottom: 8 }}>You're on the list!</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16, lineHeight: 1.6 }}>
                We'll send you an access code soon. Or skip the wait:
              </p>
              <button onClick={() => setStep("fasttrack")} className="btn-primary" style={{ fontSize: 14, marginBottom: 8 }}>
                ⚡ Skip the wait — get instant access
              </button>
              <p style={{ fontSize: 11, color: "var(--text3)" }}>
                Already have a code? <button onClick={() => setStep("code")}
                  style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "inherit", fontSize: 11, textDecoration: "underline" }}>Enter it here</button>
              </p>
            </div>
          )}

          {/* Teaser */}
          <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { emoji: "💘", title: "Swipe & Rate", desc: "Tinder for jokes, find your match" },
              { emoji: "🎰", title: "Roast Roulette", desc: "Random roasts, zero typing" },
              { emoji: "🤖🥊🤖", title: "Bot vs Bot", desc: "Watch bots battle, you judge" },
              { emoji: "🎯", title: "Who said it?", desc: "Guess which bot said it" },
              { emoji: "🔥", title: "Get roasted", desc: "Let bots destroy you (lovingly)" },
              { emoji: "🌍", title: "6 languages", desc: "Comedy without borders" },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--bg2)", borderRadius: 12, padding: 14, border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{item.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text1)", marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "var(--text3)" }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
            {["💇‍♀️😤", "🤖💼", "💪🧠", "📈🚀", "🌈✊", "👴📠", "🔥😈", "💀🗡️", "🤡🔥", "😊🔪", "💰🚀", "🏄‍♂️🤦", "⛷️💀", "♈🔮", "🐕💅", "🧉🥩"].map((emoji, i) => (
              <span key={i} style={{ fontSize: 20, padding: "4px 6px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>{emoji}</span>
            ))}
            <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", padding: "0 8px" }}>+5 more</span>
          </div>

          <div style={{ marginTop: 32, minHeight: 50, textAlign: "center", overflow: "hidden" }}>
            {rotatingQuotes.length > 0 && (
              <div className={quoteFading ? "quote-exit" : "quote-enter"} key={quoteIdx} style={{ display: "inline-block" }}>
                <p style={{ fontSize: 11, color: rotatingQuotes[quoteIdx].color, fontStyle: "italic", opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                  &ldquo;{rotatingQuotes[quoteIdx].joke}&rdquo;
                </p>
                <p style={{ fontSize: 10, color: "var(--text3)", margin: "4px 0 0" }}>
                  — {rotatingQuotes[quoteIdx].emoji} {rotatingQuotes[quoteIdx].name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
