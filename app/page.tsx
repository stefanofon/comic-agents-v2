"use client";
import { useState, useEffect } from "react";
import { getAllCharacters, getActiveCharacters, getComingSoonCharacters } from "@/lib/characters";
import { t } from "@/lib/translations";
import { getCharTranslation } from "@/lib/char-translations";
import { FeaturedViralJokes } from "@/components/ViralJokes";
import AuthModal from "@/components/AuthModal";
import LangSelector from "@/components/LangSelector";
import { useLang } from "@/components/LangProvider";
import Link from "next/link";

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function BotCard({ char, index, lang }: { char: any; index: number; lang: string }) {
  const [count, setCount] = useState(char.fakeStats.interactions);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c: number) => c + Math.floor(Math.random() * 3) + 1);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  const isComingSoon = char.comingSoon;
  const tagline = getCharTranslation(char.handle, lang, "tagline") || char.tagline;
  const joke = getCharTranslation(char.handle, lang, "sampleJoke") || char.sampleJoke;

  const CardContent = (
    <div
      className="bot-card animate-fade-in"
      style={{
        animationDelay: `${index * 0.05}s`,
        background: "var(--bg2)",
        border: `1px solid ${isComingSoon ? "var(--border)" : char.color + "33"}`,
        borderRadius: 16, padding: 20, position: "relative",
        opacity: isComingSoon ? 0.6 : 1,
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6, alignItems: "center" }}>
        {isComingSoon && <span className="coming-soon-badge">{t(lang, "comingSoonBadge")}</span>}
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
          background: char.tier === "S" ? "#EF444422" : char.tier === "A" ? "#F59E0B22" : "#64748B22",
          color: char.tier === "S" ? "#EF4444" : char.tier === "A" ? "#F59E0B" : "#64748B",
          border: `1px solid ${char.tier === "S" ? "#EF444444" : char.tier === "A" ? "#F59E0B44" : "#64748B44"}`,
        }}>TIER {char.tier}</span>
      </div>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{char.emoji}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: char.color, marginBottom: 4 }}>{char.name}</div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 12 }}>{tagline}</div>
      <div style={{
        fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 16,
        fontStyle: "italic", minHeight: 40,
        borderLeft: `2px solid ${char.color}44`, paddingLeft: 12,
      }}>&ldquo;{joke}&rdquo;</div>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text3)" }}>
        <span className="counter">💬 {formatNumber(count)} {t(lang, "chats")}</span>
        <span className="counter">🔗 {formatNumber(char.fakeStats.shares)} {t(lang, "shares")}</span>
      </div>
      {!isComingSoon && (
        <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: char.color, opacity: 0.6 }}>{t(lang, "chat")} →</div>
      )}
    </div>
  );

  if (isComingSoon) return CardContent;
  return <Link href={`/chat/${char.handle}`} style={{ textDecoration: "none", color: "inherit" }}>{CardContent}</Link>;
}

export default function HomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { lang } = useLang();
  const activeChars = getActiveCharacters();
  const comingSoonChars = getComingSoonCharacters();

  useEffect(() => {
    const saved = localStorage.getItem("comic_agents_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleAuth = (name: string, email: string) => {
    const userData = { name, email };
    localStorage.setItem("comic_agents_user", JSON.stringify(userData));
    setUser(userData);
    setShowAuth(false);
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) }).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh" }}><div style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))", padding: "14px 20px", textAlign: "center", fontSize: 13, color: "#000", fontWeight: 700, letterSpacing: 0.5 }}>🤖 These bots quit their day jobs to be comedians. The least you can do is share them. <span style={{display:"inline-flex",gap:6,marginLeft:12}}><a href="https://twitter.com/intent/tweet?text=Just%20got%20early%20access%20to%20%40comicagents%20%E2%80%94%2021%20AI%20comedians%20that%20are%20actually%20hilarious%20%F0%9F%A4%96%F0%9F%94%A5%20comicagents.com" target="_blank" rel="noopener" style={{background:"#000",color:"#fff",padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,textDecoration:"none"}}>Share on X</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=https://comicagents.com" target="_blank" rel="noopener" style={{background:"#000",color:"#fff",padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,textDecoration:"none"}}>LinkedIn</a><a href="whatsapp://send?text=Check%20out%20Comic%20Agents%20%E2%80%94%2021%20AI%20comedians%20that%20are%20actually%20hilarious%20%F0%9F%A4%96%20comicagents.com" target="_blank" rel="noopener" style={{background:"#000",color:"#fff",padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,textDecoration:"none"}}>WhatsApp</a></span></div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSubmit={handleAuth} />

      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text1)", letterSpacing: 2 }}>COMIC AGENTS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LangSelector />
          <Link href="/propose" className="btn-outline" style={{ fontSize: 12, padding: "8px 16px", textDecoration: "none" }}>💡 {t(lang, "proposeBtn")}</Link>
          
          {user ? (
            <span style={{ fontSize: 13, color: "var(--accent)" }}>👋 {user.name}</span>
          ) : (
            <button className="btn-primary" onClick={() => setShowAuth(true)} style={{ fontSize: 13, padding: "8px 20px" }}>{t(lang, "signIn")}</button>
          )}
        </div>
      </header>

      <section style={{ textAlign: "center", padding: "40px 24px 20px", maxWidth: 700, margin: "0 auto" }}>
        <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
        <h1 className="animate-glitch" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>{t(lang, "heroTitle")}</h1>
        <p style={{ fontSize: 18, color: "var(--accent)", marginBottom: 12 }}>{t(lang, "heroSub")}</p>
        <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 8px" }}>{t(lang, "heroDesc")}</p>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 0 }}>{t(lang, "heroJoke")}</p>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>🎭 {t(lang, "chatWith")}</h2>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>{activeChars.length} {t(lang, "active")} • {comingSoonChars.length} {t(lang, "comingSoon")}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {activeChars.map((char, i) => (
            <div key={char.handle} onClick={() => { if (!user) setShowAuth(true); }}>
              <BotCard char={char} index={i} lang={lang} />
            </div>
          ))}
        </div>
      </section>

      {comingSoonChars.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>🔜 {t(lang, "comingSoon")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {comingSoonChars.map((char, i) => (
              <BotCard key={char.handle} char={char} index={i + activeChars.length} lang={lang} />
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <section style={{ maxWidth: 1200, margin: "20px auto", padding: "0 24px" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🎮 Play with our comedians</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          <Link href="/roastme/karenbot5000" style={{ textDecoration: "none" }}><div className="bot-card" style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid #EF444433", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🔥</div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#EF4444", marginBottom: 4 }}>Get Roasted</div><div style={{ fontSize: 12, color: "var(--text3)" }}>Let a bot destroy you. Rate the savagery.</div></div></Link>
          <Link href="/battle/karenbot5000" style={{ textDecoration: "none" }}><div className="bot-card" style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid #A855F733", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🥊</div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#A855F7", marginBottom: 4 }}>Comedy Battle</div><div style={{ fontSize: 12, color: "var(--text3)" }}>Think you are funnier than AI?</div></div></Link>
          <Link href="/quiz" style={{ textDecoration: "none" }}><div className="bot-card" style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid #F59E0B33", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>Who Said It?</div><div style={{ fontSize: 12, color: "var(--text3)" }}>Guess which bot said the joke.</div></div></Link>
          <Link href="/leaderboard" style={{ textDecoration: "none" }}><div className="bot-card" style={{ background: "var(--bg2)", borderRadius: 16, padding: 20, border: "1px solid #10B98133", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Leaderboard</div><div style={{ fontSize: 12, color: "var(--text3)" }}>The funniest humans on the internet.</div></div></Link>
        </div>
      </section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>🔥 {t(lang, "topJokes")}</h2>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>630 {t(lang, "jokesAcross")}</span>
        </div>
        <FeaturedViralJokes />
      </section>

      <section style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ background: "var(--bg2)", border: "2px dashed var(--accent)44", borderRadius: 20, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, color: "var(--accent)", marginBottom: 8 }}>{t(lang, "createTitle")}</h2>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 16 }}>{t(lang, "createDesc")}</p>
          <span className="coming-soon-badge" style={{ fontSize: 12, padding: "6px 16px" }}>{t(lang, "comingSoonBadge")}</span>
        </div>
      </section>

      <section style={{ maxWidth: 700, margin: "20px auto", padding: "0 24px" }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--cyan)33", borderRadius: 20, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💡</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, color: "var(--cyan)", marginBottom: 8 }}>{t(lang, "proposeTitle")}</h2>
          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 16 }}>{t(lang, "proposeDesc")}</p>
          <Link href="/propose" className="btn-outline" style={{ textDecoration: "none", display: "inline-block" }}>{t(lang, "proposeBtn")} →</Link>
        </div>
      </section>

      <footer style={{ maxWidth: 1200, margin: "40px auto 0", padding: "24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>🤖 COMIC AGENTS</div>
            <p style={{ fontSize: 12, color: "var(--text3)", maxWidth: 300 }}>{t(lang, "footerDesc")}</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>{t(lang, "company")}</div>
              <Link href="/partnerships" style={{ display: "block", fontSize: 13, color: "var(--text2)", textDecoration: "none", marginBottom: 6 }}>{t(lang, "partnerships")}</Link>
              <Link href="/careers" style={{ display: "block", fontSize: 13, color: "var(--text2)", textDecoration: "none", marginBottom: 6 }}>{t(lang, "workWithUs")}</Link>
              <a href="mailto:stefanofon@gmail.com" style={{ display: "block", fontSize: 13, color: "var(--text2)", textDecoration: "none" }}>{t(lang, "contact")}</a>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>{t(lang, "community")}</div>
              <Link href="/propose" style={{ display: "block", fontSize: 13, color: "var(--text2)", textDecoration: "none", marginBottom: 6 }}>{t(lang, "proposeBtn")}</Link>
              <Link href="/quiz" style={{ display: "block", fontSize: 13, color: "var(--text2)", textDecoration: "none" }}>🎯 {t(lang, "whoSaidIt")}</Link>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, color: "var(--text3)", fontStyle: "italic" }}>{t(lang, "footerQuote")}</p>
        </div>
      </footer>
    </div>
  );
}
