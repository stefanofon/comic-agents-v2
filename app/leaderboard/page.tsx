"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const MEDALS = ["🥇", "🥈", "🥉"];
const GAME_INFO: Record<string, { emoji: string; name: string; color: string; scoreLabel: string }> = {
  battle: { emoji: "🥊", name: "Comedy Battle", color: "#EF4444", scoreLabel: "points" },
  roast: { emoji: "🔥", name: "Roast Me", color: "#F97316", scoreLabel: "severity" },
  quiz: { emoji: "🎯", name: "Who Said It?", color: "#F59E0B", scoreLabel: "/10" },
};

function ScoreRow({ entry, index, gameType }: { entry: any; index: number; gameType: string }) {
  const info = GAME_INFO[gameType];
  const medal = index < 3 ? MEDALS[index] : `#${index + 1}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <span style={{ width: 30, textAlign: "center", fontSize: index < 3 ? 18 : 12, color: index < 3 ? "var(--text1)" : "var(--text3)" }}>{medal}</span>
      <span style={{ flex: 1, fontWeight: index < 3 ? 700 : 400, color: index < 3 ? info.color : "var(--text1)" }}>{entry.username}</span>
      {entry.character_handle && <span style={{ fontSize: 11, color: "var(--cyan)", background: "var(--bg3)", padding: "2px 8px", borderRadius: 6 }}>vs {entry.character_handle}</span>}
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: info.color, fontSize: 15 }}>
        {entry.score}{gameType === "quiz" ? "/10" : ""}
      </span>
    </div>
  );
}

function AllTimeRow({ entry, index }: { entry: any; index: number }) {
  const medal = index < 3 ? MEDALS[index] : `#${index + 1}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <span style={{ width: 30, textAlign: "center", fontSize: index < 3 ? 18 : 12, color: index < 3 ? "var(--text1)" : "var(--text3)" }}>{medal}</span>
      <span style={{ flex: 1, fontWeight: index < 3 ? 700 : 400, color: index < 3 ? "var(--accent)" : "var(--text1)" }}>{entry.username}</span>
      <span style={{ fontSize: 11, color: "var(--text3)" }}>{entry.games} games</span>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{entry.total} pts</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "battle" | "roast" | "quiz">("all");

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="animate-pulse-slow">Loading leaderboard...</div></div>;

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🏆</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Leaderboard</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>The funniest humans on the internet</div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
        {(["all", "battle", "roast", "quiz"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
            background: tab === t ? "var(--bg)" : "transparent",
            color: tab === t ? (t === "all" ? "var(--accent)" : GAME_INFO[t]?.color || "var(--accent)") : "var(--text3)",
            borderBottom: tab === t ? `2px solid ${t === "all" ? "var(--accent)" : GAME_INFO[t]?.color}` : "2px solid transparent",
          }}>
            {t === "all" ? "🏆 All-time" : `${GAME_INFO[t].emoji} ${GAME_INFO[t].name}`}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
        {/* All-time leaderboard */}
        {tab === "all" && (
          <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              🏆 All-time top players
            </div>
            {(data?.allTime || []).length > 0 ? (
              (data?.allTime || []).map((entry: any, i: number) => <AllTimeRow key={i} entry={entry} index={i} />)
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                No scores yet — be the first! Play a game and claim the #1 spot. 🏆
              </div>
            )}
          </div>
        )}

        {/* Game-specific leaderboards */}
        {tab !== "all" && (
          <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: GAME_INFO[tab].color }}>
                {GAME_INFO[tab].emoji} {GAME_INFO[tab].name} — Top players
              </span>
              <Link href={tab === "battle" ? "/battle/karenbot5000" : tab === "roast" ? "/roastme/karenbot5000" : "/quiz"}
                style={{ fontSize: 11, color: GAME_INFO[tab].color, textDecoration: "none", fontWeight: 700 }}>
                Play now →
              </Link>
            </div>
            {(data?.[tab] || []).length > 0 ? (
              (data?.[tab] || []).map((entry: any, i: number) => <ScoreRow key={i} entry={entry} index={i} gameType={tab} />)
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                No {GAME_INFO[tab].name} scores yet — be the first! 🎮
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
