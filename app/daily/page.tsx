"use client";
import { useState, useEffect } from "react";
import { viralJokes } from "@/lib/viral-jokes";
import { getActiveCharacters } from "@/lib/characters";
import Link from "next/link";

function getDailyJoke() {
  const chars = getActiveCharacters();
  const allJokes: { joke: string; handle: string; name: string; emoji: string; color: string }[] = [];
  chars.forEach(char => {
    const jokes = (viralJokes as Record<string, string[]>)[char.handle] || [];
    jokes.forEach(joke => allJokes.push({ joke, handle: char.handle, name: char.name, emoji: char.emoji, color: char.color }));
  });

  // Use date as seed for consistent daily pick
  const today = new Date();
  const dayIndex = (today.getFullYear() * 1000 + today.getMonth() * 32 + today.getDate()) % allJokes.length;
  const correct = allJokes[dayIndex];

  // Pick 3 wrong options
  const wrongChars = chars.filter(c => c.handle !== correct.handle).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [
    { handle: correct.handle, name: correct.name, emoji: correct.emoji, color: correct.color },
    ...wrongChars.map(c => ({ handle: c.handle, name: c.name, emoji: c.emoji, color: c.color })),
  ].sort(() => {
    // Seeded shuffle so options are consistent per day
    const seed = dayIndex + correct.handle.length;
    return Math.sin(seed * Math.random()) - 0.5;
  });

  return { joke: correct.joke, correctHandle: correct.handle, correctName: correct.name, correctEmoji: correct.emoji, correctColor: correct.color, options };
}

export default function DailyPage() {
  const [daily] = useState(getDailyJoke);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("ca_daily");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.date === today) {
          setAlreadyPlayed(true);
          setSelected(data.selected);
          setAnswered(true);
        }
        setStreak(data.streak || 0);
      } catch {}
    }
  }, []);

  const guess = (handle: string) => {
    if (answered) return;
    setSelected(handle);
    setAnswered(true);

    const isCorrect = handle === daily.correctHandle;
    const today = new Date().toISOString().slice(0, 10);
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    localStorage.setItem("ca_daily", JSON.stringify({ date: today, selected: handle, streak: newStreak }));
  };

  const isCorrect = selected === daily.correctHandle;
  const shareText = isCorrect
    ? `I got today's Daily Joke right on Comic Agents! 🧠🔥 ${streak + 1}-day streak!\n\nCan you guess which AI comedian said it? comicagents.com/daily`
    : `I missed today's Daily Joke on Comic Agents 😅 It was ${daily.correctEmoji} ${daily.correctName}!\n\nTry it: comicagents.com/daily`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>📅</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Daily Joke</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
        </div>
        {streak > 0 && <div style={{ fontSize: 13, color: "var(--yellow)", fontWeight: 700 }}>🔥 {streak} day streak</div>}
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Who said this?</div>

          {/* The joke */}
          <div style={{
            background: "var(--bg2)", borderRadius: 20, padding: 28, marginBottom: 24,
            border: `1px solid ${answered ? (isCorrect ? "var(--green)" : "var(--red)") : "var(--border)"}`,
          }}>
            <div style={{ fontSize: 18, color: "var(--text1)", lineHeight: 1.7, fontStyle: "italic" }}>
              &ldquo;{daily.joke}&rdquo;
            </div>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {daily.options.map(opt => {
              const isThis = selected === opt.handle;
              const isAnswer = opt.handle === daily.correctHandle;
              let bg = "var(--bg2)";
              let border = "var(--border)";
              if (answered) {
                if (isAnswer) { bg = "rgba(16, 185, 129, 0.15)"; border = "var(--green)"; }
                else if (isThis && !isAnswer) { bg = "rgba(239, 68, 68, 0.15)"; border = "var(--red)"; }
              }

              return (
                <button key={opt.handle} onClick={() => guess(opt.handle)}
                  style={{
                    padding: 18, borderRadius: 14, border: `2px solid ${border}`, background: bg,
                    cursor: answered ? "default" : "pointer", fontFamily: "inherit", textAlign: "center",
                    transition: "all 0.2s", opacity: answered && !isAnswer && !isThis ? 0.4 : 1,
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: answered && isAnswer ? "var(--green)" : "var(--text1)" }}>{opt.name}</div>
                  {answered && isAnswer && <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>✅</div>}
                  {answered && isThis && !isAnswer && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>❌</div>}
                </button>
              );
            })}
          </div>

          {/* Result */}
          {answered && (
            <div className="animate-fade-in">
              <div style={{ fontSize: 48, marginBottom: 8 }}>{isCorrect ? "🎉" : "😅"}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: isCorrect ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                {isCorrect ? "You got it!" : "Not quite!"}
              </div>
              <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
                It was {daily.correctEmoji} <span style={{ color: daily.correctColor, fontWeight: 700 }}>{daily.correctName}</span>
              </div>

              {streak > 1 && isCorrect && (
                <div style={{ fontSize: 16, color: "var(--yellow)", fontWeight: 700, marginBottom: 16 }}>
                  🔥 {streak + 1}-day streak!
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Share on X</button>
                <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                  style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/chat/${daily.correctHandle}`} className="btn-primary" style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>Chat with {daily.correctName}</Link>
                <Link href="/feed" className="btn-outline" style={{ flex: 1, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>More jokes</Link>
              </div>

              <p style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>Come back tomorrow for a new joke! 📅</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
