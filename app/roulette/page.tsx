"use client";
import { useState, useEffect } from "react";
import { getActiveCharacters } from "@/lib/characters";
import { viralJokes } from "@/lib/viral-jokes";
import Link from "next/link";

const ROAST_CONTEXTS = [
  "someone who's talking to a robot at 2am",
  "someone who clicked 'Roast Me' on a website",
  "someone whose screen time is 7 hours a day",
  "someone who uses LinkedIn unironically",
  "someone who says 'I'll start on Monday'",
  "someone who has 47 unread emails",
  "someone whose last Google search was 'am I funny'",
  "someone who thinks they can beat AI at comedy",
  "someone who still uses Internet Explorer",
  "someone who brings a laptop to a coffee shop but just scrolls Twitter",
  "someone who says 'I'm not like other people' (they are)",
  "someone whose plant died despite having 3 plant care apps",
  "someone who joined a gym in January and quit in February",
  "someone who has 200 tabs open right now",
  "Monday mornings in general",
  "people who put pineapple on pizza",
  "someone who watches Netflix while also scrolling their phone",
  "someone who says 'just 5 more minutes' and means 2 hours",
  "people who take photos of their food before eating",
  "someone whose alarm goes off 12 times before they wake up",
];

export default function RoulettePage() {
  const [roast, setRoast] = useState<{ joke: string; emoji: string; name: string; color: string; handle: string; context: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<typeof roast[]>([]);
  const [spinEmoji, setSpinEmoji] = useState("🎰");

  const chars = getActiveCharacters();

  // Spin animation
  useEffect(() => {
    if (!spinning) return;
    const emojis = chars.map(c => c.emoji);
    let i = 0;
    const interval = setInterval(() => {
      setSpinEmoji(emojis[i % emojis.length]);
      i++;
    }, 80);
    return () => clearInterval(interval);
  }, [spinning, chars]);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setRoast(null);

    // Pick random bot and context
    const char = chars[Math.floor(Math.random() * chars.length)];
    const context = ROAST_CONTEXTS[Math.floor(Math.random() * ROAST_CONTEXTS.length)];

    // Try API first, fallback to viral jokes
    try {
      const res = await fetch("/api/roastme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterHandle: char.handle,
          targetName: "you",
          targetContext: context,
        }),
      });
      const data = await res.json();
      const joke = data.roast || getFallbackJoke(char.handle);
      const result = { joke, emoji: char.emoji, name: char.name, color: char.color, handle: char.handle, context };
      setRoast(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
    } catch {
      const joke = getFallbackJoke(char.handle);
      const result = { joke, emoji: char.emoji, name: char.name, color: char.color, handle: char.handle, context };
      setRoast(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
    }
    setSpinning(false);
  };

  const getFallbackJoke = (handle: string) => {
    const jokes = (viralJokes as Record<string, string[]>)[handle] || [];
    return jokes[Math.floor(Math.random() * jokes.length)] || "Even my humor circuits couldn't handle this one.";
  };

  const shareText = roast
    ? `${roast.emoji} ${roast.name} just roasted me:\n\n"${roast.joke}"\n\nGet randomly roasted: comicagents.com/roulette`
    : "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🎰</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Roast Roulette</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Random bot, random roast. No input needed.</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>{history.length} roasts</div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 550, margin: "0 auto", width: "100%" }}>
        {/* Slot machine */}
        <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 20 }}>
          <div className={spinning ? "animate-float" : ""} style={{ fontSize: 80, marginBottom: 16, transition: "all 0.3s" }}>
            {spinning ? spinEmoji : (roast ? roast.emoji : "🎰")}
          </div>

          {!roast && !spinning && (
            <>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginBottom: 8 }}>Roast Roulette</h1>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24 }}>
                Press the button. A random bot picks a random topic and roasts you. No name, no context, just pure chaos.
              </p>
            </>
          )}

          {spinning && (
            <div style={{ marginBottom: 24 }}>
              <div className="animate-pulse-slow" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                Spinning the wheel of misfortune...
              </div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>A random bot is preparing to destroy you</div>
            </div>
          )}

          {roast && !spinning && (
            <div className="animate-fade-in" style={{ background: "var(--bg2)", borderRadius: 20, padding: 24, border: `2px solid ${roast.color}33`, marginBottom: 20, textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: roast.color }}>{roast.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>roasting {roast.context}</div>
              <div style={{ fontSize: 17, lineHeight: 1.7, color: "var(--text1)", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                &ldquo;{roast.joke}&rdquo;
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11 }}>Share on X</button>
                <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11 }}>WhatsApp</button>
                <button onClick={() => navigator.clipboard.writeText(shareText)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11 }}>Copy</button>
              </div>
            </div>
          )}

          <button className="btn-primary glow-pulse" onClick={spin} disabled={spinning}
            style={{ fontSize: 18, padding: "16px 48px", opacity: spinning ? 0.5 : 1 }}>
            {spinning ? "🎰 Spinning..." : roast ? "🎰 SPIN AGAIN" : "🎰 ROAST ME"}
          </button>
        </div>

        {/* History */}
        {history.length > 1 && (
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Previous roasts</div>
            {history.slice(1).map((r, i) => r && (
              <div key={i} style={{ background: "var(--bg2)", borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${r.color}22` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{r.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.name}</span>
                  <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>{r.context}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{r.joke}&rdquo;</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
