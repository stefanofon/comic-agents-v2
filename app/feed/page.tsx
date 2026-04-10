"use client";
import { useState, useEffect, useCallback } from "react";
import { viralJokes } from "@/lib/viral-jokes";
import { getCharacterByHandle, getActiveCharacters } from "@/lib/characters";
import Link from "next/link";

interface FeedJoke {
  joke: string;
  handle: string;
  name: string;
  emoji: string;
  color: string;
  id: string;
}

function buildFullPool(): FeedJoke[] {
  const chars = getActiveCharacters();
  const pool: FeedJoke[] = [];
  chars.forEach(char => {
    const jokes = (viralJokes as Record<string, string[]>)[char.handle] || [];
    jokes.forEach((joke, i) => {
      pool.push({ joke, handle: char.handle, name: char.name, emoji: char.emoji, color: char.color, id: `${char.handle}-${i}` });
    });
  });
  return pool.sort(() => Math.random() - 0.5);
}

function SharePopup({ joke, char, onClose }: { joke: string; char: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = `${char.emoji} ${char.name}:\n\n"${joke}"\n\nChat with AI comedians at comicagents.com`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", border: `1px solid ${char.color}44` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 14, color: "var(--text1)", lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-wrap", fontStyle: "italic" }}>&ldquo;{joke}&rdquo;</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Share on X</button>
          <button onClick={() => window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
          <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://comicagents.com")}`, '_blank')}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>LinkedIn</button>
          <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>{copied ? "Copied! ✅" : "Copy"}</button>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 8, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

function FeedCard({ item, onShare }: { item: FeedJoke; onShare: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 800) + 100);

  return (
    <div className="animate-fade-in" style={{
      background: "var(--bg2)", borderRadius: 16, padding: 20, border: `1px solid ${item.color}22`,
      transition: "all 0.2s",
    }}>
      {/* Header */}
      <Link href={`/chat/${item.handle}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{item.emoji}</span>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: item.color }}>{item.name}</div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>AI Comedian</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: item.color, opacity: 0.6 }}>Chat →</span>
      </Link>
      {/* Joke */}
      <div style={{ fontSize: 15, color: "var(--text1)", lineHeight: 1.7, marginBottom: 16, whiteSpace: "pre-wrap" }}>{item.joke}</div>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => { if (!liked) { setLikes(l => l + 1); setLiked(true); } }}
          style={{ background: "none", border: "none", cursor: liked ? "default" : "pointer", fontSize: 13, color: liked ? "var(--red)" : "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={onShare}
          style={{ background: `${item.color}15`, border: `1px solid ${item.color}33`, borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, color: item.color, fontFamily: "inherit", fontWeight: 600 }}>
          Share 🚀
        </button>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [pool] = useState(buildFullPool);
  const [shown, setShown] = useState(12);
  const [filter, setFilter] = useState("all");
  const [shareItem, setShareItem] = useState<FeedJoke | null>(null);
  const chars = getActiveCharacters();

  const filtered = filter === "all" ? pool : pool.filter(j => j.handle === filter);
  const visible = filtered.slice(0, shown);

  const loadMore = useCallback(() => {
    setShown(prev => Math.min(prev + 8, filtered.length));
  }, [filtered.length]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) loadMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  return (
    <div style={{ minHeight: "100vh" }}>
      {shareItem && <SharePopup joke={shareItem.joke} char={shareItem} onClose={() => setShareItem(null)} />}
      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 24 }}>😂</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Joke Feed</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>630+ jokes from 21 AI comedians</div>
        </div>
        <Link href="/swipe" className="btn-outline" style={{ fontSize: 11, padding: "6px 12px", textDecoration: "none" }}>🔥 Swipe</Link>
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* Bot filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, overflowX: "auto" }}>
          <button onClick={() => { setFilter("all"); setShown(12); }}
            style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${filter === "all" ? "var(--accent)" : "var(--border)"}`, background: filter === "all" ? "var(--accent)22" : "var(--bg3)", color: filter === "all" ? "var(--accent)" : "var(--text2)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            All bots
          </button>
          {chars.map(c => (
            <button key={c.handle} onClick={() => { setFilter(c.handle); setShown(12); }}
              style={{ padding: "6px 12px", borderRadius: 99, border: `1px solid ${filter === c.handle ? c.color : "var(--border)"}`, background: filter === c.handle ? c.color + "22" : "var(--bg3)", color: filter === c.handle ? c.color : "var(--text2)", cursor: "pointer", fontSize: 11, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>{c.emoji}</span> {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((item) => (
          <FeedCard key={item.id} item={item} onShare={() => setShareItem(item)} />
        ))}
        {shown < filtered.length && (
          <button onClick={loadMore}
            style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
            Load more jokes 😂
          </button>
        )}
        {shown >= filtered.length && (
          <div style={{ textAlign: "center", padding: 20, fontSize: 13, color: "var(--text3)" }}>
            You&apos;ve seen them all! 🎉 <Link href="/swipe" style={{ color: "var(--accent)" }}>Try Swipe to Rate →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
