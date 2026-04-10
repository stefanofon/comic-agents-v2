"use client";
import { useState, useEffect, useCallback } from "react";
import { getActiveCharacters } from "@/lib/characters";
import { viralJokes } from "@/lib/viral-jokes";
import Link from "next/link";

interface JokeCard {
  joke: string;
  handle: string;
  name: string;
  emoji: string;
  color: string;
}

function buildDeck(): JokeCard[] {
  const chars = getActiveCharacters();
  const pool: JokeCard[] = [];
  chars.forEach(char => {
    const jokes = (viralJokes as Record<string, string[]>)[char.handle] || [];
    jokes.forEach(joke => pool.push({ joke, handle: char.handle, name: char.name, emoji: char.emoji, color: char.color }));
  });
  return pool.sort(() => Math.random() - 0.5);
}

export default function SwipePage() {
  const [deck, setDeck] = useState<JokeCard[]>([]);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState<Record<string, { funny: number; meh: number }>>({});
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [phase, setPhase] = useState<"playing" | "result">("playing");
  const [total, setTotal] = useState(0);
  const [funny, setFunny] = useState(0);

  useEffect(() => { setDeck(buildDeck()); }, []);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (index >= deck.length || swipeDir) return;
    const card = deck[index];
    setSwipeDir(direction);
    const isFunny = direction === "right";
    setTotal(t => t + 1);
    if (isFunny) setFunny(f => f + 1);
    setStats(prev => ({
      ...prev,
      [card.handle]: {
        funny: (prev[card.handle]?.funny || 0) + (isFunny ? 1 : 0),
        meh: (prev[card.handle]?.meh || 0) + (isFunny ? 0 : 1),
      }
    }));
    setTimeout(() => {
      setSwipeDir(null);
      if (index + 1 >= Math.min(deck.length, 20)) setPhase("result");
      else setIndex(i => i + 1);
    }, 300);
  }, [index, deck, swipeDir]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleSwipe, phase]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 60) handleSwipe(diff > 0 ? "right" : "left");
    setTouchStart(null);
  };

  const getTopMatch = () => {
    const entries = Object.entries(stats);
    if (entries.length === 0) return null;
    let best = entries[0];
    entries.forEach(e => {
      const ratio = e[1].funny / (e[1].funny + e[1].meh);
      const bestRatio = best[1].funny / (best[1].funny + best[1].meh);
      if (ratio > bestRatio || (ratio === bestRatio && e[1].funny > best[1].funny)) best = e;
    });
    const chars = getActiveCharacters();
    const char = chars.find(c => c.handle === best[0]);
    const matchPercent = Math.round((best[1].funny / (best[1].funny + best[1].meh)) * 100);
    return char ? { ...char, matchPercent } : null;
  };

  const card = deck[index];
  const progress = Math.min(index + 1, 20);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Swipe to Rate</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Funny or meh? Find your comedy match</div>
        </div>
        {phase === "playing" && <div style={{ fontSize: 12, color: "var(--text3)" }}>{progress}/20</div>}
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {phase === "playing" && card && (
          <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ height: 3, background: "var(--bg3)", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(progress / 20) * 100}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20, fontSize: 13 }}>
              <span style={{ color: "var(--red)" }}>😐 {total - funny}</span>
              <span style={{ color: "var(--green)" }}>😂 {funny}</span>
            </div>

            <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
              style={{
                background: "var(--bg2)",
                border: `2px solid ${swipeDir === "right" ? "var(--green)" : swipeDir === "left" ? "var(--red)" : card.color + "33"}`,
                borderRadius: 20, padding: 32, minHeight: 220,
                display: "flex", flexDirection: "column", justifyContent: "center", position: "relative",
                transition: "all 0.3s ease",
                transform: swipeDir === "right" ? "translateX(80px) rotate(5deg)" : swipeDir === "left" ? "translateX(-80px) rotate(-5deg)" : "none",
                opacity: swipeDir ? 0.4 : 1, userSelect: "none",
              }}>
              {swipeDir === "right" && <div style={{ position: "absolute", top: 16, left: 16, fontSize: 28, color: "var(--green)", fontWeight: 700, transform: "rotate(-15deg)" }}>😂</div>}
              {swipeDir === "left" && <div style={{ position: "absolute", top: 16, right: 16, fontSize: 28, color: "var(--red)", fontWeight: 700, transform: "rotate(15deg)" }}>😐</div>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>{card.emoji}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: card.color }}>{card.name}</span>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text1)", whiteSpace: "pre-wrap" }}>{card.joke}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
              <button onClick={() => handleSwipe("left")}
                style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--red)", background: "var(--bg2)", cursor: "pointer", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#EF444433"; e.currentTarget.style.transform = "scale(1.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; e.currentTarget.style.transform = "scale(1)"; }}>😐</button>
              <button onClick={() => handleSwipe("right")}
                style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--green)", background: "var(--bg2)", cursor: "pointer", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#10B98133"; e.currentTarget.style.transform = "scale(1.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; e.currentTarget.style.transform = "scale(1)"; }}>😂</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--text3)" }}>← Swipe or use arrow keys →</div>
          </div>
        )}

        {phase === "result" && (() => {
          const match = getTopMatch();
          const shareText = match
            ? `My comedy soulmate is ${match.emoji} ${match.name} (${match.matchPercent}% match) on Comic Agents! 🤖\n\nFind yours: comicagents.com/swipe`
            : `I rated 20 AI jokes on Comic Agents! comicagents.com/swipe`;
          return (
            <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 72, marginBottom: 8 }}>{match?.emoji || "🤖"}</div>
              <div style={{ fontSize: 14, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Your comedy soulmate</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: match?.color || "var(--accent)", marginBottom: 8 }}>
                {match?.name || "Mystery Bot"}
              </div>
              <div style={{ fontSize: 52, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>
                {match?.matchPercent || 0}%
              </div>
              <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>
                {funny}/20 jokes made you laugh ({Math.round((funny / 20) * 100)}% laugh rate)
              </p>

              <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 2 }}>Your humor profile</div>
                {Object.entries(stats).sort((a, b) => (b[1].funny / (b[1].funny + b[1].meh)) - (a[1].funny / (a[1].funny + a[1].meh))).slice(0, 6).map(([handle, s]) => {
                  const chars = getActiveCharacters();
                  const char = chars.find(c => c.handle === handle);
                  if (!char) return null;
                  const pct = Math.round((s.funny / (s.funny + s.meh)) * 100);
                  return (
                    <div key={handle} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{char.emoji}</span>
                      <span style={{ fontSize: 12, color: "var(--text2)", width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{char.name}</span>
                      <div style={{ flex: 1, height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: char.color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: char.color, width: 32, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Share on X</button>
                <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" onClick={() => { setDeck(buildDeck()); setIndex(0); setStats({}); setTotal(0); setFunny(0); setPhase("playing"); }} style={{ flex: 1, fontSize: 14 }}>Play again 🔄</button>
                <Link href={match ? `/chat/${match.handle}` : "/"} className="btn-outline" style={{ flex: 1, textDecoration: "none", textAlign: "center", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Chat with {match?.name.split(" ")[0] || "bots"} →
                </Link>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
