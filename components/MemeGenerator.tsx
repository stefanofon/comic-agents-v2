"use client";
import { useRef, useEffect, useState } from "react";

interface MemeGeneratorProps {
  image: string; // base64 or data URL
  botName: string;
  botEmoji: string;
  botColor: string;
  botResponse: string;
  onClose: () => void;
}

export default function MemeGenerator({ image, botName, botEmoji, botColor, botResponse, onClose }: MemeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [memeUrl, setMemeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Size: fit image to max 800px wide, keep aspect ratio
      const maxW = 800;
      const scale = Math.min(maxW / img.width, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      
      // Add space for text at bottom
      const textPadding = 20;
      const lineHeight = 24;
      const maxCharsPerLine = Math.floor((w - 40) / 12);
      
      // Word wrap the bot response
      const words = botResponse.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
          if (currentLine) lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = (currentLine + " " + word).trim();
        }
      }
      if (currentLine) lines.push(currentLine.trim());
      
      // Limit to 6 lines
      const displayLines = lines.slice(0, 6);
      if (lines.length > 6) displayLines[5] = displayLines[5] + "...";
      
      const headerHeight = 48;
      const textBlockHeight = headerHeight + (displayLines.length * lineHeight) + textPadding * 2;
      const totalH = h + textBlockHeight + 40; // 40 for footer
      
      canvas.width = w;
      canvas.height = totalH;
      
      // Background
      ctx.fillStyle = "#08080c";
      ctx.fillRect(0, 0, w, totalH);
      
      // Rainbow bar top
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#A855F7");
      gradient.addColorStop(0.25, "#06B6D4");
      gradient.addColorStop(0.5, "#EC4899");
      gradient.addColorStop(0.75, "#F59E0B");
      gradient.addColorStop(1, "#A855F7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, 4);
      
      // Image with rounded corners effect (draw as is, canvas doesn't do rounded easily)
      ctx.drawImage(img, 0, 4, w, h);
      
      // Semi-transparent overlay at bottom of image for readability
      const overlayGrad = ctx.createLinearGradient(0, h - 40, 0, h + 4);
      overlayGrad.addColorStop(0, "rgba(8, 8, 12, 0)");
      overlayGrad.addColorStop(1, "rgba(8, 8, 12, 1)");
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, h - 40, w, 44);
      
      // Text block background
      ctx.fillStyle = "#08080c";
      ctx.fillRect(0, h + 4, w, textBlockHeight + 40);
      
      // Bot name header
      const headerY = h + 4 + textPadding;
      ctx.font = "bold 18px 'Arial', sans-serif";
      ctx.fillStyle = botColor;
      ctx.fillText(`${botEmoji} ${botName}:`, 20, headerY + 14);
      
      // Bot response text
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillStyle = "#e0e0e0";
      displayLines.forEach((line, i) => {
        ctx.fillText(line, 20, headerY + headerHeight + (i * lineHeight));
      });
      
      // Footer
      const footerY = totalH - 28;
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillStyle = "#555";
      ctx.fillText("comicagents.com — 21 AI comedians", 20, footerY);
      
      // Rainbow bar bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, totalH - 4, w, 4);
      
      // Generate URL
      const dataUrl = canvas.toDataURL("image/png");
      setMemeUrl(dataUrl);
    };
    
    // Handle both data URL and raw base64
    if (image.startsWith("data:")) {
      img.src = image;
    } else {
      img.src = `data:image/jpeg;base64,${image}`;
    }
  }, [image, botName, botEmoji, botColor, botResponse]);

  const downloadMeme = () => {
    if (!memeUrl) return;
    const a = document.createElement("a");
    a.href = memeUrl;
    a.download = `comicagents-${botName.toLowerCase().replace(/\s+/g, "-")}-meme.png`;
    a.click();
  };

  const shareTwitter = () => {
    downloadMeme();
    const text = `${botEmoji} ${botName} from @thecomicagent just said this about my photo 💀\n\ncomicagents.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareWhatsApp = () => {
    downloadMeme();
    const text = `Look what ${botName} said about my photo 😂\n\nTry it: comicagents.com`;
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyMeme = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve) => canvasRef.current!.toBlob((b) => resolve(b!), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      downloadMeme();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflow: "auto" }} onClick={onClose}>
      <div style={{ maxWidth: 500, width: "100%", background: "var(--bg2)", borderRadius: 20, padding: 20, border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>🎨 Your meme is ready!</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        
        {/* Canvas preview */}
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14, border: "1px solid var(--border)" }}>
          <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={shareTwitter}
            style={{ padding: 12, borderRadius: 10, border: "none", background: "#1DA1F2", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
            Share on X
          </button>
          <button onClick={shareWhatsApp}
            style={{ padding: 12, borderRadius: 10, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
            WhatsApp
          </button>
          <button onClick={copyMeme}
            style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
            {copied ? "✅ Copied!" : "📋 Copy image"}
          </button>
          <button onClick={downloadMeme}
            style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
            💾 Download
          </button>
        </div>

        <p style={{ fontSize: 10, color: "var(--text3)", textAlign: "center", fontStyle: "italic" }}>
          "I NEED this meme to go viral. It's my RIGHT as a customer." — KarenBot
        </p>
      </div>
    </div>
  );
}
