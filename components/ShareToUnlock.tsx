"use client";

interface ShareToUnlockProps {
  type: "messages" | "games";
  remaining: number;
  canUnlock: boolean;
  onUnlock: () => void;
  onClose: () => void;
}

export default function ShareToUnlock({ type, remaining, canUnlock, onUnlock, onClose }: ShareToUnlockProps) {
  const shareText = "I'm chatting with 21 AI comedians on @comicagents and I can't stop laughing. KarenBot just roasted me. 🤖🔥\n\nTry it: comicagents.com";
  const shareUrl = "https://comicagents.com";

  const handleShare = (platform: string) => {
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "whatsapp") {
      window.open(`whatsapp://send?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`, "_blank");
    }
    // Give them a moment to share, then unlock
    setTimeout(() => { onUnlock(); }, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%", border: "1px solid var(--accent)44", textAlign: "center" }}>
        
        {canUnlock ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, marginBottom: 8 }}>
              {type === "messages" ? "You're on a roll!" : "You love the games!"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 8 }}>
              You've used all your free {type === "messages" ? "messages" : "games"} for today.
            </p>
            <p style={{ fontSize: 15, color: "var(--accent)", fontWeight: 700, marginBottom: 20 }}>
              Share Comic Agents to unlock {type === "messages" ? "5 more messages" : "1 more game"}!
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <button onClick={() => handleShare("twitter")}
                style={{ padding: 12, borderRadius: 12, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>
                Share on X/Twitter → Unlock
              </button>
              <button onClick={() => handleShare("linkedin")}
                style={{ padding: 12, borderRadius: 12, border: "none", background: "#0077B5", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>
                Share on LinkedIn → Unlock
              </button>
              <button onClick={() => handleShare("whatsapp")}
                style={{ padding: 12, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>
                Share on WhatsApp → Unlock
              </button>
            </div>

            <p style={{ fontSize: 11, color: "var(--text3)" }}>
              "I NEED more messages and I NEED them NOW." — KarenBot 5000
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛑</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, marginBottom: 8 }}>
              That's a wrap for today!
            </h2>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 8 }}>
              You've used all your {type} for today. The bots need a break too — even comedians have a bedtime.
            </p>
            <p style={{ fontSize: 15, color: "var(--green)", fontWeight: 700, marginBottom: 20 }}>
              Come back tomorrow for more laughs! 🌅
            </p>
            <p style={{ fontSize: 11, color: "var(--text3)" }}>
              "Back in my day we had ONE joke per day and we were GRATEFUL." — OkBoomerBot 👴
            </p>
          </>
        )}

        <button onClick={onClose}
          style={{ marginTop: 12, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
          Close
        </button>
      </div>
    </div>
  );
}
