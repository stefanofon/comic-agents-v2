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

const JUDGE_PROMPT = `You are the Comedy Battle Judge. Score jokes 1-10 on originality, delivery, laughs. Total max 30. Brief punchy comments (max 20 words each). RESPONSE FORMAT (JSON only):
{"human_scores":{"originality":X,"delivery":X,"laughs":X,"total":X},"bot_scores":{"originality":X,"delivery":X,"laughs":X,"total":X},"human_comment":"...","bot_comment":"...","round_winner":"human"/"bot"/"tie"}`;

export async function POST(req: NextRequest) {
  try {
    const { characterHandle, topic, userJoke, round, lang } = await req.json();
    const char = getCharacterByHandle(characterHandle);
    if (!char) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    const langInstruction = LANG_INSTRUCTIONS[lang || "en"] || "";

    const botResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 200,
        system: char.systemPrompt + `\n\nCOMEDY BATTLE. Topic: "${topic}". Under 40 words. SHORT and PUNCHY. WIN THIS. ${langInstruction}`,
        messages: [{ role: "user", content: `Comedy battle round ${round}! Topic: "${topic}". Give your best joke.` }],
      }),
    });
    const botData = await botResponse.json();
    const botJoke = botData.content?.[0]?.text || "I got nothing. You win this round.";

    const judgeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 300,
        system: JUDGE_PROMPT + ` ${langInstruction}`,
        messages: [{ role: "user", content: `ROUND ${round}/3 — Topic: "${topic}"\nHUMAN: "${userJoke}"\nBOT (${char.name}): "${botJoke}"\nScore both. JSON only.` }],
      }),
    });
    const judgeData = await judgeResponse.json();
    let judgeText = (judgeData.content?.[0]?.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let scores;
    try { scores = JSON.parse(judgeText); } catch {
      scores = { human_scores: { originality: 6, delivery: 6, laughs: 6, total: 18 }, bot_scores: { originality: 7, delivery: 7, laughs: 7, total: 21 }, human_comment: "Solid effort!", bot_comment: "Classic bot humor.", round_winner: "bot" };
    }

    return NextResponse.json({ botJoke, scores, characterName: char.name, characterEmoji: char.emoji });
  } catch (error) {
    return NextResponse.json({ error: "Battle failed" }, { status: 500 });
  }
}
