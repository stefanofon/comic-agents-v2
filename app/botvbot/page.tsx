"use client";
import { useState, useEffect } from "react";
import { getActiveCharacters } from "@/lib/characters";
import { viralJokes } from "@/lib/viral-jokes";
import Link from "next/link";

const TOPICS = [
  "Why AI will never replace humans",
  "Monday mornings",
  "Dating apps in 2026",
  "Working from home",
  "Coffee addiction",
  "Social media influencers",
  "Online shopping at 2am",
  "Being an adult is a scam",
  "Airplane travel",
  "Netflix asking 'Are you still watching?'",
  "Trying to eat healthy",
  "Crypto bros",
  "Phone battery dying at 1%",
  "Parents discovering TikTok",
  "Gym culture",
  "Fast food drive-throughs",
  "Smart home devices spying on you",
  "Group chats that never shut up",
  "AI taking over the world",
  "Video call etiquette",
];

interface BotFighter { handle: string; name: string; emoji: string; color: string; }
interface Round { topic: string; bot1Joke: string; bot2Joke: string; winner: "bot1" | "bot2" | null; }

export default function BotVsBotPage() {
  const [phase, setPhase] = useState<"intro" | "battle" | "judging" | "result" | "final">("intro");
  const [bot1, setBot1] = useState<BotFighter | null>(null);
  const [bot2, setBot2] = useState<BotFighter | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentJokes, setCurrentJokes] = useState<{ bot1: string; bot2: string; topic: string } | null>(null);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);

  const chars = getActiveCharacters();

  const pickTwoBots = () => {
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  };

  const getJokeForBot = async (handle: string, topic: string): Promise<string> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write your funniest joke about: "${topic}". Keep it short, punchy, max 2-3 sentences. Be in character.`,
          characterHandle: handle,
          history: [],
          lang: "en",
        }),
      });
      const data = await res.json();
      return data.response || getFallback(handle);
    } catch {
      return getFallback(handle);
    }
  };

  const getFallback = (handle: string) => {
    const jokes = (viralJokes as Record<string, string[]>)[handle] || [];
    return jokes[Math.floor(Math.random() * jokes.length)] || "My circuits froze mid-joke. Consider that the punchline.";
  };

  const startBattle = async () => {
    const [b1, b2] = pickTwoBots();
    setBot1(b1); setBot2(b2);
    setRounds([]); setCurrentRound(0); setUsedTopics([]);
    await runRound(b1, b2, []);
  };

  const runRound = async (b1: BotFighter, b2: BotFighter, used: string[]) => {
    setLoading(true);
    setPhase("judging");

    const available = TOPICS.filter(t => !used.includes(t));
    const topic = (available.length > 0 ? available : TOPICS)[Math.floor(Math.random() * (available.length > 0 ? available : TOPICS).length)];
    setUsedTopics(prev => [...prev, topic]);

    const [joke1, joke2] = await Promise.all([
      getJokeForBot(b1.handle, topic),
      getJokeForBot(b2.handle, topic),
    ]);

    setCurrentJokes({ bot1: joke1, bot2: joke2, topic });
    setPhase("battle");
    setLoading(false);
  };

  const judge = (winner: "bot1" | "bot2") => {
    if (!currentJokes || !bot1 || !bot2) return;
    const round: Round = { topic: currentJokes.topic, bot1Joke: currentJokes.bot1, bot2Joke: currentJokes.bot2, winner };
    const newRounds = [...rounds, round];
    setRounds(newRounds);
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    if (nextRound >= 3) {
      setPhase("final");
    } else {
      runRound(bot1, bot2, [...usedTopics]);
    }
  };

  const getWinner = () => {
    const b1Wins = rounds.filter(r => r.winner === "bot1").length;
    const b2Wins = rounds.filter(r => r.winner === "bot2").length;
    if (b1Wins > b2Wins) return "bot1";
    if (b2Wins > b1Wins) return "bot2";
    return "tie";
  };

  const shareText = bot1 && bot2
    ? `${bot1.emoji} ${bot1.name} vs ${bot2.emoji} ${bot2.name} — I just watched two AI bots battle it out in comedy! 🥊🤖\n\nWatch bots fight: comicagents.com/botvbot`
    : "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🥊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Bot vs Bot</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Watch AI comedians fight. You be the judge.</div>
        </div>
        {phase !== "intro" && bot1 && bot2 && (
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Round {Math.min(currentRound + 1, 3)}/3</div>
        )}
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 600, margin: "0 auto", width: "100%" }}>

        {/* INTRO */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>🥊</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>Bot vs Bot</h1>
            <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.6, marginBottom: 8 }}>
              Two random AI comedians. Three rounds. Random topics. They write the jokes — you decide who&apos;s funnier.
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>
              Zero typing required. Just sit back, read, and judge.
            </p>
            <button className="btn-primary glow-pulse" onClick={startBattle} style={{ fontSize: 18, padding: "16px 40px" }}>
              START FIGHT 🥊
            </button>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
              {chars.slice(0, 8).map(c => (
                <span key={c.handle} style={{ fontSize: 28, padding: 4, background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>{c.emoji}</span>
              ))}
            </div>
          </div>
        )}

        {/* JUDGING / LOADING */}
        {phase === "judging" && bot1 && bot2 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24, fontSize: 48 }}>
              <div className="animate-float">{bot1.emoji}</div>
              <div style={{ fontSize: 32, alignSelf: "center" }}>⚡</div>
              <div className="animate-float" style={{ animationDelay: "0.5s" }}>{bot2.emoji}</div>
            </div>
            <div className="animate-pulse-slow" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Both bots are writing jokes...
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Round {currentRound + 1}/3</div>
          </div>
        )}

        {/* BATTLE - show jokes, user picks winner */}
        {phase === "battle" && bot1 && bot2 && currentJokes && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>ROUND {currentRound + 1}/3</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>Topic:</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>&ldquo;{currentJokes.topic}&rdquo;</div>
            </div>

            <div style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", marginBottom: 16 }}>Tap the funnier joke 👇</div>

            {/* Bot 1 joke */}
            <button onClick={() => judge("bot1")} style={{
              width: "100%", textAlign: "left", background: "var(--bg2)", borderRadius: 16, padding: 20,
              border: `2px solid ${bot1.color}33`, marginBottom: 12, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = bot1.color; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = bot1.color + "33"; e.currentTarget.style.transform = "scale(1)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{bot1.emoji}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: bot1.color }}>{bot1.name}</span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text1)", whiteSpace: "pre-wrap" }}>{currentJokes.bot1}</div>
            </button>

            <div style={{ textAlign: "center", fontSize: 20, color: "var(--text3)", marginBottom: 12 }}>VS</div>

            {/* Bot 2 joke */}
            <button onClick={() => judge("bot2")} style={{
              width: "100%", textAlign: "left", background: "var(--bg2)", borderRadius: 16, padding: 20,
              border: `2px solid ${bot2.color}33`, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = bot2.color; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = bot2.color + "33"; e.currentTarget.style.transform = "scale(1)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{bot2.emoji}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: bot2.color }}>{bot2.name}</span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text1)", whiteSpace: "pre-wrap" }}>{currentJokes.bot2}</div>
            </button>
          </div>
        )}

        {/* FINAL */}
        {phase === "final" && bot1 && bot2 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            {(() => {
              const w = getWinner();
              const winnerBot = w === "bot1" ? bot1 : w === "bot2" ? bot2 : null;
              const b1Wins = rounds.filter(r => r.winner === "bot1").length;
              const b2Wins = rounds.filter(r => r.winner === "bot2").length;
              return (
                <>
                  <div style={{ fontSize: 72, marginBottom: 8 }}>{w === "tie" ? "🤝" : "🏆"}</div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: winnerBot?.color || "var(--yellow)", marginBottom: 8 }}>
                    {w === "tie" ? "IT'S A TIE!" : `${winnerBot?.name} WINS!`}
                  </h1>
                  <div style={{ fontSize: 36, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 20 }}>
                    <span style={{ color: bot1.color }}>{bot1.emoji} {b1Wins}</span>
                    <span style={{ color: "var(--text3)", margin: "0 16px" }}>-</span>
                    <span style={{ color: bot2.color }}>{b2Wins} {bot2.emoji}</span>
                  </div>

                  {/* Round recap */}
                  <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
                    {rounds.map((r, i) => (
                      <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>Round {i + 1}: {r.topic}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: 1, padding: 10, borderRadius: 8, background: r.winner === "bot1" ? bot1.color + "15" : "var(--bg3)", border: `1px solid ${r.winner === "bot1" ? bot1.color + "44" : "var(--border)"}`, fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                            <span style={{ fontSize: 14 }}>{bot1.emoji}</span> {r.bot1Joke.slice(0, 80)}...
                            {r.winner === "bot1" && <span style={{ color: "var(--green)", marginLeft: 4 }}>👑</span>}
                          </div>
                          <div style={{ flex: 1, padding: 10, borderRadius: 8, background: r.winner === "bot2" ? bot2.color + "15" : "var(--bg3)", border: `1px solid ${r.winner === "bot2" ? bot2.color + "44" : "var(--border)"}`, fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                            <span style={{ fontSize: 14 }}>{bot2.emoji}</span> {r.bot2Joke.slice(0, 80)}...
                            {r.winner === "bot2" && <span style={{ color: "var(--green)", marginLeft: 4 }}>👑</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                      style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Share on X</button>
                    <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                      style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-primary" onClick={() => { setPhase("intro"); setRounds([]); }} style={{ flex: 1, fontSize: 14 }}>New fight 🥊</button>
                    <Link href="/" className="btn-outline" style={{ flex: 1, textDecoration: "none", textAlign: "center", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>All bots →</Link>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
