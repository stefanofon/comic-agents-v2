"use client";
import { useState } from "react";
import { useLang } from "./LangProvider";
import { LANGUAGES } from "@/lib/translations";

export default function LangSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--bg3)", color: "var(--text1)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12, display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>▼</span>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 8000 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "100%", right: 0, marginTop: 4,
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10,
            padding: 4, zIndex: 8001, minWidth: 150, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 12px", border: "none", borderRadius: 6,
                  background: lang === l.code ? "var(--accent)22" : "transparent",
                  color: lang === l.code ? "var(--accent)" : "var(--text1)",
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: lang === l.code ? 700 : 400,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
