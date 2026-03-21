import { NextRequest, NextResponse } from "next/server";
import { getCharacterByHandle } from "@/lib/characters";

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: "Respond in English.",
  it: "Rispondi in italiano. Mantieni il tuo personaggio ma parla in italiano.",
  es: "Responde en español. Mantén tu personaje pero habla en español.",
  fr: "Réponds en français. Garde ton personnage mais parle en français.",
  pt: "Responda em português. Mantenha seu personagem mas fale em português.",
  de: "Antworte auf Deutsch. Behalte deinen Charakter, aber sprich auf Deutsch.",
};

export async function POST(req: NextRequest) {
  try {
    const { message, characterHandle, history, lang } = await req.json();
    
    const char = getCharacterByHandle(characterHandle);
    if (!char) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en;
    const systemPrompt = char.systemPrompt + `\n\n${langInstruction}`;

    const messages = [];
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: "user", content: message });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const botResponse = data.content?.[0]?.text || "Even my comedy circuits couldn't handle that one. Try again?";

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
