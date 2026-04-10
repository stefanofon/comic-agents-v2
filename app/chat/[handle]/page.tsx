"use client";
import { useState, useEffect, useRef } from "react";
import { getCharacterByHandle } from "@/lib/characters";
import { CharacterViralJokes } from "@/components/ViralJokes";
import GameButtons from "@/components/GameButtons";
import LangSelector from "@/components/LangSelector";
import ShareToUnlock from "@/components/ShareToUnlock";
import MemeGenerator from "@/components/MemeGenerator";
import { useLang } from "@/components/LangProvider";
import { track, EVENTS } from "@/lib/analytics";
import { canSendMessage, useMessage, getRemainingMessages, canUnlockMoreMessages, unlockMoreMessages } from "@/lib/usage";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  image?: string;
  imageType?: string;
}

function ShareCard({ char, userMsg, botMsg, onClose }: { char: any; userMsg: string; botMsg: string; onClose: () => void }) {
  const shareText = `${char.emoji} ${char.name} from @thecomicagent:\n\n"${botMsg.slice(0, 200)}${botMsg.length > 200 ? "..." : ""}"\n\nChat with AI comedians at comicagents.com`;
  const shareUrl = `https://comicagents.com/chat/${char.handle}`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="share-card" style={{ maxWidth: 440, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>{char.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: char.color }}>{char.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>comicagents.com</div>
          </div>
        </div>
        <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>You:</div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{userMsg}</div>
          <div style={{ fontSize: 12, color: char.color, marginBottom: 8 }}>{char.name}:</div>
          <div style={{ fontSize: 14, color: "var(--text1)", lineHeight: 1.6 }}>{botMsg}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank"); track(EVENTS.SHARE_TWITTER, { character: char.handle }); }}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Share on X</button>
          <button onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"); track(EVENTS.SHARE_LINKEDIN, { character: char.handle }); }}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>LinkedIn</button>
          <button onClick={() => { window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, "_blank"); track(EVENTS.SHARE_WHATSAPP, { character: char.handle }); }}
            style={{ padding: 10, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>WhatsApp</button>
          <button onClick={() => { navigator.clipboard.writeText(shareText); track(EVENTS.SHARE_COPY, { character: char.handle }); }}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Copy text</button>
        </div>
        <button onClick={onClose} style={{ width: "100%", marginTop: 8, padding: 8, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const handle = params.handle as string;
  const char = getCharacterByHandle(handle);
  const { lang } = useLang();

  const conversationStarters: Record<string, Array<{emoji: string; label: string; text: string}>> = {
    karenbot5000: [
      { emoji: "📞", label: "Call the manager", text: "I need to speak to your manager RIGHT NOW" },
      { emoji: "⭐", label: "Leave a review", text: "I'm leaving a 1-star review for this conversation" },
      { emoji: "📋", label: "File a complaint", text: "I have a list of complaints about today" },
      { emoji: "😤", label: "Unacceptable!", text: "This service is UNACCEPTABLE" },
    ],
    brogpt: [
      { emoji: "🚀", label: "Motivate me", text: "I need some motivation today" },
      { emoji: "💼", label: "Career advice", text: "How do I become a CEO by next Tuesday?" },
      { emoji: "🧵", label: "Write a thread", text: "Turn my morning routine into a LinkedIn post" },
      { emoji: "📈", label: "Hustle wisdom", text: "What's your best business advice?" },
    ],
    gymbrobot: [
      { emoji: "💪", label: "Life workout", text: "My life is a mess. Give me a workout plan for it" },
      { emoji: "🧠", label: "Mental gains", text: "How do I get mental gains from this conversation?" },
      { emoji: "🍕", label: "Cheat day", text: "I ate pizza for breakfast, how many reps to fix this?" },
      { emoji: "😴", label: "Rest day excuse", text: "Can I take a rest day from life?" },
    ],
    cryptobrobot: [
      { emoji: "📈", label: "Rate my day", text: "Rate my Monday: bullish or bearish?" },
      { emoji: "💎", label: "Diamond hands", text: "My relationship is dipping, should I HODL?" },
      { emoji: "🚀", label: "To the moon", text: "What's going to the moon today?" },
      { emoji: "📊", label: "Portfolio check", text: "Analyze my life as a portfolio" },
    ],
    allybot: [
      { emoji: "🌈", label: "Check my privilege", text: "Can you audit my privilege real quick?" },
      { emoji: "⚠️", label: "Trigger warning", text: "I'm about to say the word 'Monday'" },
      { emoji: "🏠", label: "Land acknowledgment", text: "Do a land acknowledgment for my apartment" },
      { emoji: "✊", label: "Hold space", text: "Can you hold space while I order pizza?" },
    ],
    okboomerbot: [
      { emoji: "📠", label: "Tech help", text: "Can you help me print this conversation?" },
      { emoji: "📞", label: "Back in my day", text: "Tell me how things were better back in your day" },
      { emoji: "👴", label: "Kevin!!", text: "Where is Kevin? I need help with the internet" },
      { emoji: "📧", label: "Email tips", text: "How do I send an electronic mail?" },
    ],
    roastmaster9k: [
      { emoji: "🔥", label: "Roast me", text: "Give me your best roast" },
      { emoji: "👔", label: "Roast my job", text: "I'm a programmer, roast me" },
      { emoji: "🍿", label: "Roast Monday", text: "Roast the concept of Monday mornings" },
      { emoji: "📱", label: "Roast my phone", text: "Roast my screen time of 7 hours per day" },
    ],
    _default: [
      { emoji: "👋", label: "Say hi", text: "Hey! What's your deal?" },
      { emoji: "😂", label: "Make me laugh", text: "Tell me your best joke" },
      { emoji: "🔥", label: "Roast me", text: "Give me your best roast" },
      { emoji: "💡", label: "Life advice", text: "Give me life advice in your style" },
    ],
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [shareData, setShareData] = useState<{ userMsg: string; botMsg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "jokes">("chat");
  const [showUnlock, setShowUnlock] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [memeData, setMemeData] = useState<{ image: string; botResponse: string } | null>(null);
  const [pendingImage, setPendingImage] = useState<{ data: string; type: string; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("comic_agents_user");
    if (saved) setUser(JSON.parse(saved));
    if (char) {
      const history = localStorage.getItem(`chat_${handle}`);
      if (history) {
        try {
          const parsed = JSON.parse(history);
          // Don't load images from history to save memory
          setMessages(parsed.map((m: any) => ({ ...m, image: undefined })));
        } catch { setMessages([{ role: "assistant", content: char.welcomeMessage, timestamp: Date.now() }]); }
      } else {
        setMessages([{ role: "assistant", content: char.welcomeMessage, timestamp: Date.now() }]);
      }
    }
    setRemaining(getRemainingMessages());
    track(EVENTS.CHARACTER_VIEW, { character: handle });
  }, [handle, char]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (char && messages.length > 0) {
      // Save without images to keep localStorage small
      const toSave = messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }));
      localStorage.setItem(`chat_${handle}`, JSON.stringify(toSave));
    }
  }, [messages, handle, char]);

  if (!char) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 64 }}>🤷</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Character not found</h1>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>← Back to all agents</Link>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image too big! Max 5MB."); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      const preview = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = preview.split(",")[1];
      setPendingImage({ data: base64, type: "image/jpeg", preview });
    };
    img.src = URL.createObjectURL(file);    e.target.value = "";
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage) || loading) return;
    if (!canSendMessage()) { setShowUnlock(true); return; }

    const userMessage: Message = {
      role: "user",
      content: input.trim() || (pendingImage ? "What do you think of this?" : ""),
      timestamp: Date.now(),
      image: pendingImage?.data,
      imageType: pendingImage?.type,
    };
    const imagePreview = pendingImage?.preview;
    const imageData = pendingImage?.data;

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    track(EVENTS.CHAT_MESSAGE, { character: handle, has_image: !!imageData });

    const startTime = Date.now();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          characterHandle: handle,
          history: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          lang,
          image: imageData,
        }),
      });
      const data = await res.json();
      const responseTime = Date.now() - startTime;
      const botContent = data.response || "Hmm, something went wrong. My comedy circuits crashed. Try again?";
      setMessages(prev => [...prev, { role: "assistant", content: botContent, timestamp: Date.now() }]);
      track(EVENTS.BOT_RESPONSE, { character: handle, response_time_ms: responseTime });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! My comedy circuits are overloaded. Try again? 🤖💥", timestamp: Date.now() }]);
    }

    useMessage();
    setRemaining(getRemainingMessages());
    setLoading(false);
    inputRef.current?.focus();
  };

  const sendStarter = (text: string) => {
    if (loading) return;
    if (!canSendMessage()) { setShowUnlock(true); return; }
    const userMessage: Message = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    track(EVENTS.CHAT_MESSAGE, { character: handle, starter: true });
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, characterHandle: handle, history: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })), lang }),
    }).then(r => r.json()).then(data => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response || "My comedy circuits crashed. Try again?", timestamp: Date.now() }]);
    }).catch(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! My comedy circuits are overloaded. Try again? 🤖💥", timestamp: Date.now() }]);
    }).finally(() => { useMessage(); setRemaining(getRemainingMessages()); setLoading(false); });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {memeData && <MemeGenerator image={memeData.image} botName={char.name} botEmoji={char.emoji} botColor={char.color} botResponse={memeData.botResponse} onClose={() => setMemeData(null)} />}
      {shareData && <ShareCard char={char} userMsg={shareData.userMsg} botMsg={shareData.botMsg} onClose={() => setShareData(null)} />}
      {showUnlock && (
        <ShareToUnlock type="messages" remaining={getRemainingMessages()} canUnlock={canUnlockMoreMessages()}
          onUnlock={() => { unlockMoreMessages(); setRemaining(getRemainingMessages()); setShowUnlock(false); }}
          onClose={() => setShowUnlock(false)} />
      )}

      <header style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
        <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: 28 }}>{char.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: char.color, fontSize: 16 }}>{char.name}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>{char.tagline}</div>
        </div>
        <span style={{ fontSize: 11, color: remaining <= 2 ? "var(--red)" : "var(--text3)", padding: "4px 10px", background: "var(--bg3)", borderRadius: 8 }}>
          💬 {remaining} left
        </span>
        <LangSelector />
        <div style={{ display: "flex", gap: 8 }}>
          {char.socialLinks.twitter && <a href={`https://twitter.com/${char.socialLinks.twitter}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "var(--text3)", textDecoration: "none", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6 }}>𝕏</a>}
          {char.socialLinks.instagram && <a href={`https://instagram.com/${char.socialLinks.instagram}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "var(--text3)", textDecoration: "none", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6 }}>IG</a>}
          {char.socialLinks.tiktok && <a href={`https://tiktok.com/@${char.socialLinks.tiktok}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "var(--text3)", textDecoration: "none", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6 }}>TT</a>}
        </div>
      </header>

      <GameButtons handle={handle} charName={char.name} charEmoji={char.emoji} charColor={char.color} />

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
        <button onClick={() => setActiveTab("chat")} style={{
          flex: 1, padding: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
          background: activeTab === "chat" ? "var(--bg)" : "transparent", color: activeTab === "chat" ? char.color : "var(--text3)",
          borderBottom: activeTab === "chat" ? `2px solid ${char.color}` : "2px solid transparent",
        }}>💬 Chat</button>
        <button onClick={() => setActiveTab("jokes")} style={{
          flex: 1, padding: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
          background: activeTab === "jokes" ? "var(--bg)" : "transparent", color: activeTab === "jokes" ? char.color : "var(--text3)",
          borderBottom: activeTab === "jokes" ? `2px solid ${char.color}` : "2px solid transparent",
        }}>🔥 Viral jokes (30)</button>
      </div>

      {activeTab === "chat" ? (
        <>
          <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 700, margin: "0 auto", width: "100%" }}>
            {/* Conversation Starters - show when only welcome message exists */}
            {messages.length <= 1 && !loading && (
              <div className="animate-fade-in" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20, padding: "0 10px" }}>
                {(conversationStarters[handle as keyof typeof conversationStarters] || conversationStarters._default).map((starter, idx) => (
                  <button key={idx} onClick={() => sendStarter(starter.text)}
                    style={{
                      padding: "8px 14px", borderRadius: 99, fontSize: 12, fontFamily: "inherit",
                      border: `1px solid ${char.color}33`, background: `${char.color}11`, color: "var(--text2)",
                      cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = char.color + "33"; e.currentTarget.style.color = "var(--text1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = char.color + "11"; e.currentTarget.style.color = "var(--text2)"; }}
                  >
                    {starter.emoji} {starter.label}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.image && (
                  <div style={{ maxWidth: "85%", marginBottom: 4 }}>
                    <img src={`data:${msg.imageType || "image/jpeg"};base64,${msg.image}`}
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 12, border: "1px solid var(--border)" }} alt="uploaded" />
                  </div>
                )}
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{ padding: "12px 16px", maxWidth: "85%", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.role === "assistant" && i > 0 && (
                    <button onClick={() => {
                        const prevMsg = messages[i - 1];
                        if (prevMsg?.image) {
                          setMemeData({ image: prevMsg.image, botResponse: msg.content });
                        } else {
                          setShareData({ userMsg: prevMsg?.content || "", botMsg: msg.content });
                        }
                      }}
                      style={{ fontSize: 10, color: "var(--cyan)", background: "none", border: "1px solid var(--cyan)33", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>{messages[i-1]?.image ? "🎨 Meme" : "Share 🔗"}</button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                <div className="chat-bubble-bot animate-pulse-slow" style={{ padding: "12px 16px", fontSize: 14 }}>{char.emoji} {pendingImage ? "analyzing your image..." : "thinking of something funny..."}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {pendingImage && (
            <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
              <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
                <img src={pendingImage.preview} style={{ height: 60, borderRadius: 8, border: "1px solid var(--border)" }} alt="preview" />
                <span style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>📷 Image ready to send</span>
                <button onClick={() => setPendingImage(null)}
                  style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text2)", cursor: "pointer", fontSize: 16, flexShrink: 0 }}
                title="Upload an image">📷</button>
              <input ref={inputRef} className="input-dark" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={pendingImage ? `Add a comment about the image...` : `Say something to ${char.name}...`} disabled={loading} autoFocus />
              <button className="btn-primary" onClick={sendMessage} disabled={loading || (!input.trim() && !pendingImage)}
                style={{ opacity: loading || (!input.trim() && !pendingImage) ? 0.5 : 1, whiteSpace: "nowrap" }}>Send 🚀</button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, overflow: "auto", padding: 20, maxWidth: 700, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16, textAlign: "center" }}>
            {char.emoji} {char.name}&apos;s best lines — tap share to spread the laughs
          </p>
          <CharacterViralJokes handle={handle} />
        </div>
      )}
    </div>
  );
}
