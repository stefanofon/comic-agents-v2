"use client";
import Link from "next/link";

export default function GameButtons({ handle, charName, charEmoji, charColor }: { handle: string; charName: string; charEmoji: string; charColor: string }) {
  return (
    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
        Play with {charName}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
        <Link href={`/roastme/${handle}`} style={{
          flex: 1, padding: "12px 16px", borderRadius: 14, fontSize: 14, fontWeight: 700,
          background: "#EF444418", border: "2px solid #EF444444", color: "#EF4444",
          textDecoration: "none", textAlign: "center", fontFamily: "inherit",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <span>Get roasted</span>
        </Link>
        <Link href={`/battle/${handle}`} style={{
          flex: 1, padding: "12px 16px", borderRadius: 14, fontSize: 14, fontWeight: 700,
          background: "#A855F718", border: "2px solid #A855F744", color: "#A855F7",
          textDecoration: "none", textAlign: "center", fontFamily: "inherit",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 24 }}>🥊</span>
          <span>Comedy battle</span>
        </Link>
        <Link href="/quiz" style={{
          flex: 1, padding: "12px 16px", borderRadius: 14, fontSize: 14, fontWeight: 700,
          background: "#F59E0B18", border: "2px solid #F59E0B44", color: "#F59E0B",
          textDecoration: "none", textAlign: "center", fontFamily: "inherit",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <span>Who said it?</span>
        </Link>
      </div>
    </div>
  );
}
