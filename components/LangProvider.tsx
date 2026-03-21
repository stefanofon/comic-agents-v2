"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGES } from "@/lib/translations";

const LangContext = createContext({ lang: "en", setLang: (l: string) => {} });

function detectLanguage() {
  if (typeof navigator === "undefined") return "en";
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  const supported = LANGUAGES.map(l => l.code);
  if (supported.includes(browserLang)) return browserLang;
  return "en";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("en");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("ca_lang");
    if (saved) {
      setLangState(saved);
    } else {
      const detected = detectLanguage();
      if (detected !== "en") {
        setSuggestedLang(detected);
        setShowSuggestion(true);
      }
    }
  }, []);

  const setLang = (l: string) => {
    setLangState(l);
    localStorage.setItem("ca_lang", l);
  };

  const langInfo = LANGUAGES.find(l => l.code === suggestedLang);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {showSuggestion && langInfo && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--bg2)", border: "1px solid var(--accent)44", borderRadius: 14,
          padding: "14px 20px", zIndex: 9500, display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)", maxWidth: 420,
        }}>
          <span style={{ fontSize: 28 }}>{langInfo.flag}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)", marginBottom: 2 }}>
              Switch to {langInfo.name}?
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              We detected your language. You can change it anytime.
            </div>
          </div>
          <button onClick={() => { setLang(suggestedLang); setShowSuggestion(false); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
            {langInfo.flag} Yes
          </button>
          <button onClick={() => { setLang("en"); setShowSuggestion(false); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
            🇬🇧 English
          </button>
        </div>
      )}
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
