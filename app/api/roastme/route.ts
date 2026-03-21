import { NextRequest, NextResponse } from "next/server";
import { getCharacterByHandle } from "@/lib/characters";

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: "Respond in English.",
  it: "Rispondi in italiano.",
  es: "Responde en español.",
  fr: "Réponds en français.",
  pt: "Responda em português.",
  de: "Antworte auf Deutsch.",
};

export async function POST(req: NextRequest) {
  try {
    const { characterHandle, targetName, targetContext, lang } = await req.json();
    
    const char = getCharacterByHandle(characterHandle);
    if (!char) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    const langInstruction = LANG_INSTRUCTIONS[lang || "en"] || "";
    const roastPrompt = `${char.systemPrompt}\n\nSPECIAL MODE: ROAST ME. A user named "${targetName}" has asked to be roasted. ${targetContext ? `They said: "${targetContext}"` : ""}\n\nGive your ABSOLUTE BEST roast. Be creative, unexpected, hilarious. Under 60 words. End with something warm. Roast CHOICES not identity.\n\n${langInstruction}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 200, system: roastPrompt,
        messages: [{ role: "user", content: `Roast me! My name is ${targetName}. ${targetContext || "Do your worst!"}` }],
      }),
    });

    const data = await response.json();
    return NextResponse.json({ roast: data.content?.[0]?.text || "I crashed trying to roast you." });
  } catch (error) {
    return NextResponse.json({ error: "Roast failed" }, { status: 500 });
  }
}
