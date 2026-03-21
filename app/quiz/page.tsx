"use client";
import { useState, useEffect } from "react";
import { getActiveCharacters } from "@/lib/characters";
import { viralJokes } from "@/lib/viral-jokes";
import { track, EVENTS } from "@/lib/analytics";
import Link from "next/link";

function buildQuizPool() {
  const chars = getActiveCharacters();
  const pool: Array<{ joke: string; handle: string; name: string; emoji: string; color: string }> = [];
  for (const char of chars) {
    const jokes = viralJokes[char.handle as keyof typeof viralJokes] || [];
    for (const joke of jokes) {
      pool.push({ joke, handle: char.handle, name: char.name, emoji: char.emoji, color: char.color });
    }
  }
  return pool;
}

export default function QuizPage() {
  const [phase, setPhase] = useState<"intro" | "playing" | "result" | "final">("intro");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const totalQuestions = 10;

  useEffect(() => {
    const saved = localStorage.getItem("ca_quiz_best");
    if (saved) setBestStreak(parseInt(saved));
  }, []);

  const startQuiz = () => {
    const pool = buildQuizPool();
    const chars = getActiveCharacters();
    const qs = [];

    for (let i = 0; i < totalQuestions; i++) {
      const correct = pool[Math.floor(Math.random() * pool.length)];
      const wrongChars = chars.filter(c => c.handle !== correct.handle);
      const wrongOptions = [];
      while (wrongOptions.length < 3 && wrongChars.length > 0) {
        const idx = Math.floor(Math.random() * wrongChars.length);
        wrongOptions.push(wrongChars.splice(idx, 1)[0]);
      }
      const options = [
        { handle: correct.handle, name: correct.name, emoji: correct.emoji, color: correct.color },
        ...wrongOptions.map(c => ({ handle: c.handle, name: c.name, emoji: c.emoji, color: c.color })),
      ].sort(() => Math.random() - 0.5);

      qs.push({ joke: correct.joke, correctHandle: correct.handle, correctName: correct.name, correctEmoji: correct.emoji, options });
    }
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setPhase("playing");
    setSelected(null);
    setShowAnswer(false);
  };

  const selectAnswer = (handle: string) => {
    if (showAnswer) return;
    setSelected(handle);
    setShowAnswer(true);
    const q = questions[currentQ];
    const isCorrect = handle === q.correctHandle;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
          localStorage.setItem("ca_quiz_best", newStreak.toString());
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= totalQuestions) {
      setPhase("final");
      track(EVENTS.PAGE_VIEW, { page: "quiz_complete", score, total: totalQuestions });
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const shareText = `I scored ${score}/${totalQuestions} on "Who Said It?" at Comic Agents! 🤖\n\nCan you tell which AI comedian said what?\n\nTry it: comicagents.com/quiz`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Who said it?</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Guess the comedian</div>
        </div>
        {phase === "playing" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{currentQ + 1}/{totalQuestions}</div>
            <div style={{ fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "var(--green)" }}>{score} correct</div>
          </div>
        )}
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 600, margin: "0 auto", width: "100%" }}>

        {/* INTRO */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎯</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>Who said it?</h1>
            <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 8, lineHeight: 1.6 }}>
              We show you a joke. You guess which AI comedian said it. 10 questions. How well do you know our bots?
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>
              Best streak: {bestStreak > 0 ? `${bestStreak} in a row 🔥` : "None yet — be the first!"}
            </p>
            <button className="btn-primary" onClick={startQuiz} style={{ fontSize: 18, padding: "14px 40px" }}>
              START QUIZ 🎯
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && questions[currentQ] && (
          <div>
            {/* Progress bar */}
            <div style={{ height: 4, background: "var(--bg3)", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((currentQ + 1) / totalQuestions) * 100}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
            </div>

            {/* Streak */}
            {streak > 1 && (
              <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: 12, fontSize: 13, color: "var(--yellow)" }}>
                🔥 {streak} in a row!
              </div>
            )}

            {/* Question */}
            <div style={{ textAlign: "center", marginBottom: 8, fontSize: 12, color: "var(--text3)" }}>
              QUESTION {currentQ + 1}/{totalQuestions}
            </div>

            <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>Who said this?</div>
              <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text1)", fontStyle: "italic" }}>
                &ldquo;{questions[currentQ].joke}&rdquo;
              </div>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {questions[currentQ].options.map((opt: any) => {
                const isCorrect = opt.handle === questions[currentQ].correctHandle;
                const isSelected = selected === opt.handle;
                let bg = "var(--bg2)";
                let borderColor = "var(--border)";
                if (showAnswer) {
                  if (isCorrect) { bg = "var(--green)15"; borderColor = "var(--green)"; }
                  else if (isSelected && !isCorrect) { bg = "var(--red)15"; borderColor = "var(--red)"; }
                }

                return (
                  <button
                    key={opt.handle}
                    onClick={() => selectAnswer(opt.handle)}
                    style={{
                      padding: 16, borderRadius: 12, border: `2px solid ${borderColor}`, background: bg,
                      cursor: showAnswer ? "default" : "pointer", fontFamily: "inherit", textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: showAnswer && isCorrect ? "var(--green)" : "var(--text1)" }}>{opt.name}</div>
                    {showAnswer && isCorrect && <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>✅ Correct!</div>}
                    {showAnswer && isSelected && !isCorrect && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>❌ Nope</div>}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <button className="btn-primary animate-fade-in" onClick={nextQuestion} style={{ width: "100%", marginTop: 16, fontSize: 15 }}>
                {currentQ + 1 >= totalQuestions ? "See results 🏆" : "Next question →"}
              </button>
            )}
          </div>
        )}

        {/* FINAL */}
        {phase === "final" && (
          <div style={{ textAlign: "center", paddingTop: 30 }}>
            <div style={{ fontSize: 72, marginBottom: 8 }}>
              {score >= 9 ? "🏆" : score >= 7 ? "🔥" : score >= 5 ? "😎" : score >= 3 ? "🤔" : "😬"}
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 4, color: score >= 7 ? "var(--green)" : score >= 5 ? "var(--yellow)" : "var(--red)" }}>
              {score}/{totalQuestions}
            </h1>
            <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 4 }}>
              {score >= 9 ? "You're a Comic Agents EXPERT! 🏆" :
               score >= 7 ? "Impressive! You really know our bots." :
               score >= 5 ? "Not bad! You're getting to know them." :
               score >= 3 ? "Keep chatting with the bots to learn their style!" :
               "Hmm... maybe chat with them a bit more first? 😅"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>
              Best streak: {bestStreak} in a row 🔥
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
                Brag on X
              </button>
              <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
                style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
                WhatsApp
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={startQuiz} style={{ flex: 1, fontSize: 14 }}>
                Play again 🔄
              </button>
              <Link href="/" className="btn-outline" style={{ flex: 1, textDecoration: "none", textAlign: "center", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Chat with bots
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
