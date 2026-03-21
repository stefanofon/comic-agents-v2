"use client";
import { useState, useEffect } from "react";
import { getCharacterByHandle } from "@/lib/characters";
import { track, EVENTS } from "@/lib/analytics";
import Link from "next/link";
import { useParams } from "next/navigation";

const TOPICS = [
  "Why AI will never replace humans",
  "Monday mornings",
  "Dating apps in 2026",
  "Working from home",
  "Coffee addiction",
  "Social media influencers",
  "Gym culture",
  "Online shopping at 2am",
  "Being an adult is a scam",
  "Group chats",
  "Airplane travel",
  "Fast food drive-throughs",
  "Netflix asking 'Are you still watching?'",
  "Smart home devices spying on you",
  "Trying to eat healthy",
  "Video call etiquette",
  "Crypto bros at dinner parties",
  "Your phone battery dying at 1%",
  "Parents discovering TikTok",
  "AI taking over the world",
];

interface RoundResult {
  round: number;
  topic: string;
  userJoke: string;
  botJoke: string;
  scores: any;
}

function ScoreBar({ label, score, max = 10, color }: { label: string; score: number; max?: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
      <span style={{ color: "var(--text3)", width: 65 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${(score / max) * 100}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ color, fontWeight: 700, width: 20, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function ShareBattleCard({ char, results, totalUser, totalBot, winner, userName, onClose }: any) {
  const shareText = winner === "human"
    ? `🏆 I just BEAT ${char.emoji} ${char.name} at comedy! Score: ${totalUser}-${totalBot}. Think you're funnier than AI? Try it at comicagents.com/battle/${char.handle}`
    : `${char.emoji} ${char.name} destroyed me ${totalBot}-${totalUser} in a comedy battle. I'll be back. Try to beat them at comicagents.com/battle/${char.handle}`;
  
  const shareUrl = `https://comicagents.com/battle/${char.handle}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", border: `2px solid ${winner === "human" ? "var(--green)" : char.color}`, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{winner === "human" ? "🏆" : "😤"}</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, color: winner === "human" ? "var(--green)" : char.color, marginBottom: 4 }}>
          {winner === "human" ? "YOU WON!" : `${char.name} WINS!`}
        </h2>
        <div style={{ fontSize: 32, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 4 }}>
          <span style={{ color: "var(--green)" }}>{totalUser}</span>
          <span style={{ color: "var(--text3)", margin: "0 8px" }}>-</span>
          <span style={{ color: char.color }}>{totalBot}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
          {userName} vs {char.name}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'); track(EVENTS.BATTLE_SHARE, { character: char.handle, platform: 'twitter', won: winner === 'human' }); }}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            Brag on X
          </button>
          <button onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'); }}
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
        <Link href={`/battle/${char.handle}`} onClick={onClose} style={{ display: "block", marginBottom: 8, fontSize: 13, color: char.color, textDecoration: "none", fontWeight: 600 }}>
          🔄 Rematch
        </Link>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

export default function BattlePage() {
  const params = useParams();
  const handle = params.handle as string;
  const char = getCharacterByHandle(handle);

  const [phase, setPhase] = useState<"intro" | "battle" | "judging" | "result" | "final">("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [topic, setTopic] = useState("");
  const [userJoke, setUserJoke] = useState("");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("comic_agents_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  if (!char) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 64 }}>🥊</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Fighter not found</h1>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>← Back to agents</Link>
      </div>
    );
  }

  const getNewTopic = () => {
    const available = TOPICS.filter(t => !usedTopics.includes(t));
    const pool = available.length > 0 ? available : TOPICS;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    setUsedTopics(prev => [...prev, selected]);
    return selected;
  };

  const startBattle = () => {
    const newTopic = getNewTopic();
    setTopic(newTopic);
    setPhase("battle");
    setCurrentRound(1);
    setResults([]);
    track(EVENTS.BATTLE_START, { character: handle });
  };

  const submitJoke = async () => {
    if (!userJoke.trim() || loading) return;
    setLoading(true);
    setPhase("judging");

    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterHandle: handle,
          topic,
          userJoke: userJoke.trim(),
          round: currentRound,
        }),
      });

      const data = await res.json();
      
      const roundResult: RoundResult = {
        round: currentRound,
        topic,
        userJoke: userJoke.trim(),
        botJoke: data.botJoke,
        scores: data.scores,
      };

      setResults(prev => [...prev, roundResult]);
      setCurrentResult(roundResult);
      setPhase("result");
      
      track(EVENTS.BATTLE_ROUND, { 
        character: handle, round: currentRound,
        user_score: data.scores?.human_scores?.total,
        bot_score: data.scores?.bot_scores?.total,
        winner: data.scores?.round_winner,
      });

    } catch {
      setPhase("battle");
    }
    setLoading(false);
  };

  const nextRound = () => {
    if (currentRound >= 3) {
      setPhase("final");
      const totalUser = results.reduce((sum, r) => sum + (r.scores?.human_scores?.total || 0), 0);
      const totalBot = results.reduce((sum, r) => sum + (r.scores?.bot_scores?.total || 0), 0);
      track(EVENTS.BATTLE_COMPLETE, { 
        character: handle, 
        user_total: totalUser, bot_total: totalBot,
        winner: totalUser > totalBot ? "human" : "bot",
      });
    } else {
      setCurrentRound(prev => prev + 1);
      setTopic(getNewTopic());
      setUserJoke("");
      setPhase("battle");
    }
  };

  const totalUser = results.reduce((sum, r) => sum + (r.scores?.human_scores?.total || 0), 0);
  const totalBot = results.reduce((sum, r) => sum + (r.scores?.bot_scores?.total || 0), 0);
  const winner = totalUser > totalBot ? "human" : totalBot > totalUser ? "bot" : "tie";
  const difficulty = char.tier === "S" ? "Nightmare" : char.tier === "A" ? "Hard" : "Medium";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showShareCard && <ShareBattleCard char={char} results={results} totalUser={totalUser} totalBot={totalBot} winner={winner} userName={user?.name || "Challenger"} onClose={() => setShowShareCard(false)} />}

      {/* Header */}
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href={`/chat/${handle}`} style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🥊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Comedy Battle</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>You vs {char.emoji} {char.name} • Difficulty: {difficulty}</div>
        </div>
        {phase !== "intro" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Round {Math.min(currentRound, 3)}/3</div>
            <div style={{ fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              <span style={{ color: "var(--green)" }}>{totalUser}</span>
              <span style={{ color: "var(--text3)" }}> - </span>
              <span style={{ color: char.color }}>{totalBot}</span>
            </div>
          </div>
        )}
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 600, margin: "0 auto", width: "100%" }}>

        {/* INTRO */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🥊</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>
              Think you're funnier than AI?
            </h1>
            <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 8 }}>
              3 rounds. 1 topic each. You write a joke. {char.name} writes a joke. An impartial judge scores both.
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>
              Win and your name goes on the leaderboard. Lose and... well, {char.name} will never let you forget it.
            </p>

            <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, marginBottom: 24, border: `1px solid ${char.color}33`, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{char.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: char.color }}>{char.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Difficulty: {difficulty} • Tier {char.tier}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11 }}>
                <div style={{ background: "var(--bg3)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ color: char.color, fontWeight: 700 }}>Win rate</div>
                  <div style={{ color: "var(--text2)", fontSize: 16, fontWeight: 700 }}>{char.tier === "S" ? "23%" : char.tier === "A" ? "35%" : "48%"}</div>
                  <div style={{ color: "var(--text3)" }}>humans win</div>
                </div>
                <div style={{ background: "var(--bg3)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ color: char.color, fontWeight: 700 }}>Battles</div>
                  <div style={{ color: "var(--text2)", fontSize: 16, fontWeight: 700 }}>{2847}</div>
                  <div style={{ color: "var(--text3)" }}>total fights</div>
                </div>
                <div style={{ background: "var(--bg3)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ color: char.color, fontWeight: 700 }}>Avg score</div>
                  <div style={{ color: "var(--text2)", fontSize: 16, fontWeight: 700 }}>{char.tier === "S" ? "127" : char.tier === "A" ? "118" : "108"}</div>
                  <div style={{ color: "var(--text3)" }}>per battle</div>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={startBattle} style={{ fontSize: 18, padding: "14px 40px" }}>
              START BATTLE 🥊
            </button>
          </div>
        )}

        {/* BATTLE - User writes joke */}
        {phase === "battle" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>ROUND {currentRound}/3</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>Topic:</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>"{topic}"</div>
            </div>

            <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>Your joke about "{topic}":</div>
              <textarea
                className="input-dark"
                value={userJoke}
                onChange={(e) => setUserJoke(e.target.value)}
                placeholder="Write your funniest joke... make it count!"
                rows={4}
                style={{ resize: "vertical", marginBottom: 12 }}
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{userJoke.length} chars</span>
                <button
                  className="btn-primary"
                  onClick={submitJoke}
                  disabled={!userJoke.trim() || loading}
                  style={{ opacity: !userJoke.trim() ? 0.5 : 1 }}
                >
                  Submit joke 🎤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JUDGING */}
        {phase === "judging" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>⚖️</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>The judge is deliberating...</div>
            <div className="animate-pulse-slow" style={{ fontSize: 14, color: "var(--text2)" }}>
              Analyzing humor levels, punchline effectiveness, and comedic timing...
            </div>
          </div>
        )}

        {/* ROUND RESULT */}
        {phase === "result" && currentResult && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>ROUND {currentResult.round} RESULT</div>
              <div style={{ fontSize: 32, marginBottom: 4 }}>
                {currentResult.scores?.round_winner === "human" ? "🏆" : currentResult.scores?.round_winner === "tie" ? "🤝" : "😤"}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: currentResult.scores?.round_winner === "human" ? "var(--green)" : char.color }}>
                {currentResult.scores?.round_winner === "human" ? "You won this round!" : currentResult.scores?.round_winner === "tie" ? "It's a tie!" : `${char.name} takes this round!`}
              </div>
            </div>

            {/* Your joke */}
            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 16, marginBottom: 10, border: "1px solid var(--green)33" }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, marginBottom: 6 }}>👤 Your joke</div>
              <div style={{ fontSize: 14, color: "var(--text1)", marginBottom: 10, lineHeight: 1.5 }}>{currentResult.userJoke}</div>
              <ScoreBar label="Originality" score={currentResult.scores?.human_scores?.originality || 0} color="var(--green)" />
              <ScoreBar label="Delivery" score={currentResult.scores?.human_scores?.delivery || 0} color="var(--green)" />
              <ScoreBar label="Laughs" score={currentResult.scores?.human_scores?.laughs || 0} color="var(--green)" />
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, textAlign: "right", marginTop: 4 }}>Total: {currentResult.scores?.human_scores?.total || 0}/30</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 6 }}>Judge: "{currentResult.scores?.human_comment}"</div>
            </div>

            {/* Bot's joke */}
            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${char.color}33` }}>
              <div style={{ fontSize: 12, color: char.color, fontWeight: 700, marginBottom: 6 }}>{char.emoji} {char.name}'s joke</div>
              <div style={{ fontSize: 14, color: "var(--text1)", marginBottom: 10, lineHeight: 1.5 }}>{currentResult.botJoke}</div>
              <ScoreBar label="Originality" score={currentResult.scores?.bot_scores?.originality || 0} color={char.color} />
              <ScoreBar label="Delivery" score={currentResult.scores?.bot_scores?.delivery || 0} color={char.color} />
              <ScoreBar label="Laughs" score={currentResult.scores?.bot_scores?.laughs || 0} color={char.color} />
              <div style={{ fontSize: 12, color: char.color, fontWeight: 700, textAlign: "right", marginTop: 4 }}>Total: {currentResult.scores?.bot_scores?.total || 0}/30</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 6 }}>Judge: "{currentResult.scores?.bot_comment}"</div>
            </div>

            <button className="btn-primary" onClick={nextRound} style={{ width: "100%", fontSize: 16 }}>
              {currentRound >= 3 ? "See final results 🏆" : `Next round (${currentRound + 1}/3) →`}
            </button>
          </div>
        )}

        {/* FINAL RESULTS */}
        {phase === "final" && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 72, marginBottom: 8 }}>{winner === "human" ? "🏆" : winner === "tie" ? "🤝" : "😤"}</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: winner === "human" ? "var(--green)" : char.color, marginBottom: 4 }}>
              {winner === "human" ? "YOU WON!" : winner === "tie" ? "IT'S A TIE!" : `${char.name} WINS!`}
            </h1>
            <div style={{ fontSize: 40, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 16 }}>
              <span style={{ color: "var(--green)" }}>{totalUser}</span>
              <span style={{ color: "var(--text3)", margin: "0 12px" }}>-</span>
              <span style={{ color: char.color }}>{totalBot}</span>
            </div>

            {/* Round by round */}
            <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Round by round</div>
              {results.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 11, color: "var(--text3)", width: 20 }}>R{r.round}</span>
                  <span style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>{r.topic}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", width: 24, textAlign: "right" }}>{r.scores?.human_scores?.total || 0}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>-</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: char.color, width: 24 }}>{r.scores?.bot_scores?.total || 0}</span>
                  <span style={{ fontSize: 14, width: 20 }}>{r.scores?.round_winner === "human" ? "✅" : r.scores?.round_winner === "tie" ? "🤝" : "❌"}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button className="btn-primary" onClick={() => setShowShareCard(true)} style={{ flex: 1, fontSize: 15 }}>
                {winner === "human" ? "Brag about it 🏆" : "Share my defeat 😤"}
              </button>
              <button className="btn-outline" onClick={startBattle} style={{ flex: 1 }}>
                Rematch 🔄
              </button>
            </div>
            <Link href={`/chat/${handle}`} style={{ fontSize: 13, color: "var(--text2)", textDecoration: "none" }}>
              ← Back to chatting with {char.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
