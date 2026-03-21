"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Proposal {
  id: string;
  name: string;
  emoji: string;
  description: string;
  submittedBy: string;
  votes: number;
  createdAt: number;
}

const INITIAL_PROPOSALS: Proposal[] = [
  { id: "1", name: "TechBroBot", emoji: "👨‍💻🚀", description: "The developer who turns every conversation into a code review. 'Have you tried turning it off and on again?' for EVERYTHING.", submittedBy: "Marco", votes: 847, createdAt: Date.now() - 86400000 * 3 },
  { id: "2", name: "TeaBot", emoji: "🫖🇬🇧", description: "The overly British AI that solves everything with a cup of tea, apologises constantly, and talks about the weather even when the world is ending.", submittedBy: "Sarah", votes: 623, createdAt: Date.now() - 86400000 * 2 },
  { id: "3", name: "OuiOuiBot", emoji: "🥐🇫🇷", description: "The French snob who judges your food, your wine, and your pronunciation. Everything is 'pas mal' which actually means terrible.", submittedBy: "Pierre", votes: 512, createdAt: Date.now() - 86400000 * 5 },
  { id: "4", name: "YogaBroBot", emoji: "🧘‍♂️✨", description: "Every problem is a chakra issue. Your code doesn't work? Third eye is blocked. Bad date? Mercury retrograde meets low vibration energy.", submittedBy: "Luna", votes: 445, createdAt: Date.now() - 86400000 * 1 },
  { id: "5", name: "BrasilBot", emoji: "🇧🇷⚽", description: "Everything is 'tranquilo irmão.' Solves problems with samba, açaí, and jogo bonito. Refuses to acknowledge any football team that isn't Brazil.", submittedBy: "Diego", votes: 389, createdAt: Date.now() - 86400000 * 4 },
];

export default function ProposePage() {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedVotes = localStorage.getItem("comic_agents_votes");
    if (savedVotes) setVoted(new Set(JSON.parse(savedVotes)));
  }, []);

  const handleVote = (id: string) => {
    if (voted.has(id)) return;
    setProposals(prev => prev.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
    const newVoted = new Set(voted).add(id);
    setVoted(newVoted);
    localStorage.setItem("comic_agents_votes", JSON.stringify([...newVoted]));
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;
    const newProposal: Proposal = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji: emoji.trim() || "🤖",
      description: description.trim(),
      submittedBy: submitterName.trim() || "Anonymous",
      votes: 1,
      createdAt: Date.now(),
    };
    setProposals(prev => [newProposal, ...prev]);
    setShowForm(false);
    setSubmitted(true);
    setName(""); setEmoji(""); setDescription(""); setSubmitterName("");
  };

  const sorted = [...proposals].sort((a, b) => b.votes - a.votes);

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 10, maxWidth: 800, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>🤖</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>COMIC AGENTS</span>
      </header>

      <section style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>Propose a comedian</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
            Got an idea for an AI comedy character? Submit it. The community votes. Top ideas get built. It's democracy, but actually fun.
          </p>
        </div>

        {submitted && (
          <div style={{ background: "var(--green)15", border: "1px solid var(--green)44", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
            <span style={{ color: "var(--green)", fontSize: 14 }}>✅ Your proposal is live! Now get people to vote for it.</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18 }}>🏆 Leaderboard</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: 13, padding: "8px 20px" }}>
            {showForm ? "Cancel" : "+ Submit idea"}
          </button>
        </div>

        {showForm && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--accent)44", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }}>
              <input className="input-dark" placeholder="Character name (e.g., YogaBroBot)" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input-dark" placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} style={{ width: 80, textAlign: "center" }} />
            </div>
            <textarea className="input-dark" placeholder="Describe the character's personality, humor style, and what makes them funny..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: "vertical", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input className="input-dark" placeholder="Your name (optional)" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} />
              <button className="btn-primary" onClick={handleSubmit} style={{ whiteSpace: "nowrap" }}>Submit 🚀</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((p, i) => (
            <div key={p.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>#{i + 1}</div>
                <button
                  onClick={() => handleVote(p.id)}
                  style={{
                    background: voted.has(p.id) ? "var(--accent)22" : "var(--bg3)",
                    border: `1px solid ${voted.has(p.id) ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 8, padding: "6px 12px", cursor: voted.has(p.id) ? "default" : "pointer",
                    color: voted.has(p.id) ? "var(--accent)" : "var(--text2)", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  }}
                >
                  ▲ {p.votes}
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, margin: 0 }}>{p.description}</p>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>by {p.submittedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
