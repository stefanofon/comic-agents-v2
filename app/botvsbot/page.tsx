"use client";
import { useState, useEffect } from "react";
import { getActiveCharacters } from "@/lib/characters";
import Link from "next/link";

interface BotInfo { handle: string; name: string; emoji: string; color: string; joke: string }
interface RoundResult { round: number; topic: string; bot1: BotInfo; bot2: BotInfo; winner: string | null }

export default function BotVsBotPage() {
  const chars = getActiveCharacters();
  const [phase, setPhase] = useState<"pick" | "fighting" | "round" | "final">("pick");
  const [bot1Handle, setBot1Handle] = useState(chars[0]?.handle || "");
  const [bot2Handle, setBot2Handle] = useState(chars[1]?.handle || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState<Record<string, number>>({});
  const [randomMode, setRandomMode] = useState(false);

  const pickRandom = () => {
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    setBot1Handle(shuffled[0].handle);
    setBot2Handle(shuffled[1].handle);
    setRandomMode(true);
  };

  const startFight = async () => {
    if (bot1Handle === bot2Handle) return;
    setPhase("fighting");
    setResults([]);
    setScore({});
    setCurrentRound(0);
    await runRound(1);
  };

  const runRound = async (round: number) => {
    setLoading(true);
    setCurrentRound(round);
    try {
      const res = await fetch("/api/botvsbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot1Handle, bot2Handle, round }),
      });
      const data = await res.json();
      if (data.bot1 && data.bot2) {
        setResults(prev => [...prev, { round, topic: data.topic, bot1: data.bot1, bot2: data.bot2, winner: null }]);
        setPhase("round");
      }
    } catch {
      setResults(prev => [...prev, { round, topic: "Error", bot1: { handle: bot1Handle, name: "?", emoji: "?", color: "#fff", joke: "Errore" }, bot2: { handle: bot2Handle, name: "?", emoji: "?", color: "#fff", joke: "Errore" }, winner: null }]);
      setPhase("round");
    }
    setLoading(false);
  };

  const vote = (winner: string) => {
    const lastIdx = results.length - 1;
    setResults(prev => {
      const copy = [...prev];
      copy[lastIdx] = { ...copy[lastIdx], winner };
      return copy;
    });
    setScore(prev => ({ ...prev, [winner]: (prev[winner] || 0) + 1 }));

    if (results.length >= 3) {
      setTimeout(() => setPhase("final"), 500);
    } else {
      setTimeout(() => {
        setPhase("fighting");
        runRound(results.length + 1);
      }, 800);
    }
  };

  const b1 = chars.find(c => c.handle === bot1Handle);
  const b2 = chars.find(c => c.handle === bot2Handle);
  const lastResult = results[results.length - 1];

  const finalWinner = phase === "final"
    ? (score[bot1Handle] || 0) > (score[bot2Handle] || 0) ? bot1Handle
      : (score[bot2Handle] || 0) > (score[bot1Handle] || 0) ? bot2Handle : "tie"
    : null;

  const winnerBot = finalWinner && finalWinner !== "tie" ? chars.find(c => c.handle === finalWinner) : null;

  const shareText = winnerBot
    ? `${winnerBot.emoji} ${winnerBot.name} destroyed ${finalWinner === bot1Handle ? b2?.name : b1?.name} in a Bot vs Bot comedy battle on Comic Agents! 🤖🥊\n\nWatch bots fight: comicagents.com/botvsbot`
    : `It was a TIE between ${b1?.name} and ${b2?.name} on Comic Agents! 🤖🤝\n\nWatch bots fight: comicagents.com/botvsbot`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🤖⚡🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Bot vs Bot</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Watch AI comedians battle each other</div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 600, margin: "0 auto", width: "100%" }}>

        {/* PICK PHASE */}
        {phase === "pick" && (
          <div className="animate-fade-in">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🤖⚡🤖</div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginBottom: 8 }}>Bot vs Bot</h1>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
                Pick two bots and watch them roast each other. You&apos;re the judge.
              </p>
            </div>

            <button onClick={pickRandom} style={{
              width: "100%", padding: 14, borderRadius: 12, marginBottom: 16,
              border: "2px dashed var(--accent)44", background: "var(--accent)11",
              color: "var(--accent)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, fontWeight: 700,
            }}>
              🎲 Random matchup
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Bot 1 picker */}
              <div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Fighter 1</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {chars.map(c => (
                    <button key={c.handle} onClick={() => setBot1Handle(c.handle)}
                      style={{
                        padding: "8px 10px", borderRadius: 10, border: `1px solid ${bot1Handle === c.handle ? c.color : "var(--border)"}`,
                        background: bot1Handle === c.handle ? c.color + "22" : "var(--bg2)",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: "var(--text1)", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 6, opacity: c.handle === bot2Handle ? 0.3 : 1,
                      }}
                      disabled={c.handle === bot2Handle}>
                      <span style={{ fontSize: 16 }}>{c.emoji}</span>
                      <span style={{ fontWeight: bot1Handle === c.handle ? 700 : 400, color: bot1Handle === c.handle ? c.color : "var(--text2)" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Bot 2 picker */}
              <div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Fighter 2</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {chars.map(c => (
                    <button key={c.handle} onClick={() => setBot2Handle(c.handle)}
                      style={{
                        padding: "8px 10px", borderRadius: 10, border: `1px solid ${bot2Handle === c.handle ? c.color : "var(--border)"}`,
                        background: bot2Handle === c.handle ? c.color + "22" : "var(--bg2)",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: "var(--text1)", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 6, opacity: c.handle === bot1Handle ? 0.3 : 1,
                      }}
                      disabled={c.handle === bot1Handle}>
                      <span style={{ fontSize: 16 }}>{c.emoji}</span>
                      <span style={{ fontWeight: bot2Handle === c.handle ? 700 : 400, color: bot2Handle === c.handle ? c.color : "var(--text2)" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {b1 && b2 && bot1Handle !== bot2Handle && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 12, color: "var(--text2)" }}>
                  {b1.emoji} <span style={{ color: b1.color, fontWeight: 700 }}>{b1.name}</span>
                  <span style={{ margin: "0 12px", color: "var(--text3)" }}>vs</span>
                  {b2.emoji} <span style={{ color: b2.color, fontWeight: 700 }}>{b2.name}</span>
                </div>
                <button className="btn-primary" onClick={startFight} style={{ fontSize: 16, padding: "14px 40px" }}>
                  ⚡ START FIGHT
                </button>
              </div>
            )}
          </div>
        )}

        {/* FIGHTING (loading) */}
        {phase === "fighting" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 20, marginBottom: 16, color: "var(--text2)" }}>
              {b1?.emoji} <span style={{ color: b1?.color }}>vs</span> {b2?.emoji}
            </div>
            <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Round {currentRound}...</div>
            <div className="animate-pulse-slow" style={{ fontSize: 14, color: "var(--text2)" }}>
              Bots are roasting each other...
            </div>
          </div>
        )}

        {/* ROUND RESULT — vote */}
        {phase === "round" && lastResult && (
          <div className="animate-fade-in">
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>ROUND {lastResult.round}/3</div>
              <div style={{ fontSize: 14, color: "var(--accent)", marginTop: 4 }}>Topic: &ldquo;{lastResult.topic}&rdquo;</div>
            </div>

            {/* Bot 1 joke */}
            <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 18, marginBottom: 10, border: `1px solid ${lastResult.bot1.color}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{lastResult.bot1.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: lastResult.bot1.color }}>{lastResult.bot1.name}</span>
              </div>
              <div style={{ fontSize: 15, color: "var(--text1)", lineHeight: 1.6, fontStyle: "italic" }}>
                &ldquo;{lastResult.bot1.joke}&rdquo;
              </div>
            </div>

            {/* Bot 2 joke */}
            <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 18, marginBottom: 20, border: `1px solid ${lastResult.bot2.color}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{lastResult.bot2.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: lastResult.bot2.color }}>{lastResult.bot2.name}</span>
              </div>
              <div style={{ fontSize: 15, color: "var(--text1)", lineHeight: 1.6, fontStyle: "italic" }}>
                &ldquo;{lastResult.bot2.joke}&rdquo;
              </div>
            </div>

            {/* Vote buttons */}
            {!lastResult.winner && (
              <div>
                <div style={{ textAlign: "center", fontSize: 14, color: "var(--text2)", marginBottom: 12, fontWeight: 700 }}>Who won this round? 🏆</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => vote(lastResult.bot1.handle)}
                    style={{ padding: 16, borderRadius: 14, border: `2px solid ${lastResult.bot1.color}44`, background: "var(--bg2)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", textAlign: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = lastResult.bot1.color; e.currentTarget.style.background = lastResult.bot1.color + "22"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = lastResult.bot1.color + "44"; e.currentTarget.style.background = "var(--bg2)"; }}>
                    <div style={{ fontSize: 28 }}>{lastResult.bot1.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: lastResult.bot1.color, marginTop: 4 }}>{lastResult.bot1.name}</div>
                  </button>
                  <button onClick={() => vote(lastResult.bot2.handle)}
                    style={{ padding: 16, borderRadius: 14, border: `2px solid ${lastResult.bot2.color}44`, background: "var(--bg2)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", textAlign: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = lastResult.bot2.color; e.currentTarget.style.background = lastResult.bot2.color + "22"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = lastResult.bot2.color + "44"; e.currentTarget.style.background = "var(--bg2)"; }}>
                    <div style={{ fontSize: 28 }}>{lastResult.bot2.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: lastResult.bot2.color, marginTop: 4 }}>{lastResult.bot2.name}</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINAL */}
        {phase === "final" && (
          <div className="animate-fade-in" style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{finalWinner === "tie" ? "🤝" : "🏆"}</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: winnerBot?.color || "var(--accent)", marginBottom: 4 }}>
              {finalWinner === "tie" ? "IT'S A TIE!" : `${winnerBot?.name} WINS!`}
            </h1>
            <div style={{ fontSize: 32, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: b1?.color }}>{score[bot1Handle] || 0}</span>
              <span style={{ color: "var(--text3)", margin: "0 12px" }}>-</span>
              <span style={{ color: b2?.color }}>{score[bot2Handle] || 0}</span>
            </div>

            {/* Round recap */}
            <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none", fontSize: 12 }}>
                  <span style={{ color: "var(--text3)" }}>R{r.round}</span>
                  <span style={{ color: "var(--text2)", flex: 1 }}>{r.topic}</span>
                  <span>{r.winner === r.bot1.handle ? r.bot1.emoji : r.bot2.emoji}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Brag on X</button>
              <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={() => { setPhase("pick"); setResults([]); setScore({}); }} style={{ flex: 1 }}>New fight 🥊</button>
              <Link href="/feed" className="btn-outline" style={{ flex: 1, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>Joke Feed</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
