"use client";
import { useState } from "react";
import { viralJokes } from "@/lib/viral-jokes";
import { getCharacterByHandle } from "@/lib/characters";

function SharePopup({ joke, char, onClose }: { joke: string; char: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = `${char.emoji} ${char.name}:\n\n"${joke}"\n\nChat with AI comedians at comicagents.com`;
  const shareUrl = `https://comicagents.com/chat/${char.handle}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", border: `1px solid ${char.color}44` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>{char.emoji}</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: char.color }}>{char.name}</span>
        </div>
        <div style={{ background: "var(--bg)", borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 14, lineHeight: 1.6, color: "var(--text1)", whiteSpace: "pre-wrap" }}>
          &ldquo;{joke}&rdquo;
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            Share on X
          </button>
          <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            Share on LinkedIn
          </button>
          <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            WhatsApp
          </button>
          <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
            {copied ? "Copied! ✅" : "Copy text"}
          </button>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 8, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

export function ViralJokeCard({ joke, charHandle, index }: { joke: string; charHandle: string; index: number }) {
  const [showShare, setShowShare] = useState(false);
  const [likes, setLikes] = useState(420);
  const [liked, setLiked] = useState(false);
  const [shares] = useState(142);
  const char = getCharacterByHandle(charHandle);
  if (!char) return null;

  return (
    <>
      {showShare && <SharePopup joke={joke} char={char} onClose={() => setShowShare(false)} />}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: `${index * 0.03}s`,
          background: "var(--bg2)",
          border: `1px solid ${char.color}22`,
          borderRadius: 14,
          padding: 16,
          transition: "all 0.2s",
          cursor: "default",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = char.color + "55")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = char.color + "22")}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>{char.emoji}</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: char.color }}>{char.name}</span>
        </div>

        {/* Joke */}
        <div style={{ fontSize: 14, color: "var(--text1)", lineHeight: 1.65, marginBottom: 14, whiteSpace: "pre-wrap" }}>
          {joke}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { if (!liked) { setLikes(l => l + 1); setLiked(true); } }}
            style={{ background: "none", border: "none", cursor: liked ? "default" : "pointer", fontSize: 12, color: liked ? "var(--red)" : "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            {liked ? "❤️" : "🤍"} {likes}
          </button>
          <button
            onClick={() => setShowShare(true)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            🔗 {shares}
          </button>
          <button
            onClick={() => setShowShare(true)}
            style={{ marginLeft: "auto", background: `${char.color}15`, border: `1px solid ${char.color}33`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 11, color: char.color, fontFamily: "inherit", fontWeight: 600 }}
          >
            Share 🚀
          </button>
        </div>
      </div>
    </>
  );
}

// Full page viral jokes section for a specific character
export function CharacterViralJokes({ handle }: { handle: string }) {
  const char = getCharacterByHandle(handle);
  const jokes = viralJokes[handle as keyof typeof viralJokes] || [];
  if (!char || jokes.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {jokes.map((joke, i) => (
        <ViralJokeCard key={i} joke={joke} charHandle={handle} index={i} />
      ))}
    </div>
  );
}

// Homepage featured jokes (picks random ones from all bots)
export function FeaturedViralJokes() {
  const [filter, setFilter] = useState("all");
  const [lengthFilter, setLengthFilter] = useState("all");
  const allHandles = Object.keys(viralJokes);
  
  // Pick top jokes — 2 per active bot, shuffled
  const featured: { joke: string; handle: string }[] = [];
  for (const handle of allHandles) {
    const jokes = viralJokes[handle as keyof typeof viralJokes] || [];
    const char = getCharacterByHandle(handle);
    if (!char || !char.isActive) continue;
    // Pick 2 random jokes
    const shuffled = [...jokes];
    featured.push({ joke: shuffled[0], handle });
    if (shuffled[1]) featured.push({ joke: shuffled[1], handle });
  }
  
  // Shuffle all featured jokes
  const shuffled = [...featured];
  
  // Filter by character
  const charFiltered = filter === "all" ? shuffled : shuffled.filter(f => f.handle === filter);
  
  // Filter by length
  const filtered = lengthFilter === "all" ? charFiltered : charFiltered.filter(f => {
    const len = f.joke.length;
    if (lengthFilter === "short") return len <= 140;
    if (lengthFilter === "medium") return len > 140 && len <= 300;
    if (lengthFilter === "long") return len > 300;
    return true;
  });
  
  const shown = filtered.slice(0, 12);
  
  const activeHandles = allHandles.filter(h => {
    const c = getCharacterByHandle(h);
    return c && c.isActive;
  });

  return (
    <div>
      {/* Length filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[
          { key: "all", label: "All lengths" },
          { key: "short", label: "One-liners (< 140 chars)" },
          { key: "medium", label: "Medium" },
          { key: "long", label: "Full bits" },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setLengthFilter(opt.key)}
            style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
              border: `1px solid ${lengthFilter === opt.key ? "var(--yellow)" : "var(--border)"}`,
              background: lengthFilter === opt.key ? "var(--yellow)22" : "var(--bg3)",
              color: lengthFilter === opt.key ? "var(--yellow)" : "var(--text3)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bot filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 14px", borderRadius: 99, border: `1px solid ${filter === "all" ? "var(--accent)" : "var(--border)"}`,
            background: filter === "all" ? "var(--accent)22" : "var(--bg3)", color: filter === "all" ? "var(--accent)" : "var(--text2)",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600,
          }}
        >
          All bots
        </button>
        {activeHandles.map(h => {
          const c = getCharacterByHandle(h);
          if (!c) return null;
          return (
            <button
              key={h}
              onClick={() => setFilter(h)}
              style={{
                padding: "6px 12px", borderRadius: 99, border: `1px solid ${filter === h ? c.color : "var(--border)"}`,
                background: filter === h ? c.color + "22" : "var(--bg3)", color: filter === h ? c.color : "var(--text2)",
                cursor: "pointer", fontSize: 11, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 13 }}>{c.emoji}</span> {c.name.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Jokes grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {shown.map((item, i) => (
          <ViralJokeCard key={`${item.handle}-${i}`} joke={item.joke} charHandle={item.handle} index={i} />
        ))}
      </div>
    </div>
  );
}
