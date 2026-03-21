"use client";
import { useState, useEffect } from "react";
import { getCharacterByHandle, getActiveCharacters } from "@/lib/characters";
import { track, EVENTS } from "@/lib/analytics";
import Link from "next/link";
import { useParams } from "next/navigation";

function ShareRoast({ char, name, roast, severity, onClose }: any) {
  const shareText = `${char.emoji} ${char.name} just roasted me (${severity}/10 savage):\n\n"${roast}"\n\nGet roasted at comicagents.com/roastme/${char.handle}`;
  const shareUrl = `https://comicagents.com/roastme/${char.handle}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", border: `1px solid ${char.color}44` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>{char.emoji}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: char.color }}>{char.name} roasted {name}</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Severity: {"🔥".repeat(severity)} ({severity}/10)</div>
        </div>
        <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 15, lineHeight: 1.6, color: "var(--text1)", textAlign: "center", fontStyle: "italic" }}>
          &ldquo;{roast}&rdquo;
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            Share on X
          </button>
          <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            LinkedIn
          </button>
          <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            WhatsApp
          </button>
          <button onClick={() => navigator.clipboard.writeText(shareText)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            Copy
          </button>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 8, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

export default function RoastMePage() {
  const params = useParams();
  const handle = params.handle as string;
  const char = getCharacterByHandle(handle);

  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [roastHistory, setRoastHistory] = useState<Array<{ roast: string; severity: number }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem("comic_agents_user");
    if (saved) {
      const user = JSON.parse(saved);
      setName(user.name || "");
    }
  }, []);

  if (!char) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 64 }}>🔥</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Roaster not found</h1>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>Back to agents</Link>
      </div>
    );
  }

  const getRoasted = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setRoast("");
    setSeverity(0);
    setHasRated(false);

    try {
      const res = await fetch("/api/roastme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterHandle: handle,
          targetName: name.trim(),
          targetContext: context.trim(),
        }),
      });
      const data = await res.json();
      setRoast(data.roast || "Even I couldn't roast you. That's how boring you are. (Just kidding.)");
    } catch {
      setRoast("My roast circuits overloaded. You're TOO roastable. Try again.");
    }
    setLoading(false);
  };

  const rateSeverity = (rating: number) => {
    setSeverity(rating);
    setHasRated(true);
    setRoastHistory(prev => [...prev, { roast, severity: rating }]);
    track(EVENTS.LIKE, { character: handle, type: "roast_rating", severity: rating });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showShare && <ShareRoast char={char} name={name} roast={roast} severity={severity} onClose={() => setShowShare(false)} />}

      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href={`/chat/${handle}`} style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Roast me</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>by {char.emoji} {char.name}</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          {roastHistory.length} roasts
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 550, margin: "0 auto", width: "100%" }}>

        {/* Intro */}
        {!roast && !loading && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{char.emoji}</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginBottom: 8 }}>
              Get roasted by {char.name}
            </h1>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
              Enter your name, optionally give some context, and let {char.name} destroy you. In a loving way. Mostly.
            </p>
          </div>
        )}

        {/* Input */}
        <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid var(--border)" }}>
          <input
            className="input-dark"
            placeholder="Your name (so the roast feels personal)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <input
            className="input-dark"
            placeholder="Give context to roast harder (e.g., 'I'm a programmer', 'I drive a Prius') — optional"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getRoasted()}
            style={{ marginBottom: 12 }}
          />
          <button
            className="btn-primary"
            onClick={getRoasted}
            disabled={!name.trim() || loading}
            style={{ width: "100%", fontSize: 16, opacity: !name.trim() || loading ? 0.5 : 1 }}
          >
            {loading ? `${char.emoji} thinking of something mean...` : roast ? "ROAST ME AGAIN 🔥" : "ROAST ME 🔥"}
          </button>
        </div>

        {/* The Roast */}
        {roast && (
          <div className="animate-fade-in" style={{ background: "var(--bg2)", borderRadius: 16, padding: 24, marginBottom: 20, border: `2px solid ${char.color}44`, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{char.emoji}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: char.color, marginBottom: 12 }}>{char.name} says:</div>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: "var(--text1)", marginBottom: 20, fontStyle: "italic" }}>
              &ldquo;{roast}&rdquo;
            </div>

            {/* Rate severity */}
            {!hasRated ? (
              <div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>How savage was that? Rate 1-10:</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => rateSeverity(n)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
                        background: "var(--bg3)", color: "var(--text1)", cursor: "pointer",
                        fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = char.color; e.currentTarget.style.color = "#000"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text1)"; }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, color: char.color, marginBottom: 12 }}>
                  {"🔥".repeat(severity)} {severity}/10 savage
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowShare(true)}
                  style={{ fontSize: 14, marginBottom: 8 }}
                >
                  Share this roast 🚀
                </button>
              </div>
            )}
          </div>
        )}

        {/* Roast history */}
        {roastHistory.length > 1 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Previous roasts</div>
            {roastHistory.slice(0, -1).reverse().map((r, i) => (
              <div key={i} style={{ background: "var(--bg2)", borderRadius: 10, padding: 12, marginBottom: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{r.roast}&rdquo;</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{"🔥".repeat(r.severity)} {r.severity}/10</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
