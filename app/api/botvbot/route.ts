import { NextRequest, NextResponse } from "next/server";
import { getCharacterByHandle } from "@/lib/characters";

export async function POST(req: NextRequest) {
  try {
    const { handle1, handle2, topic, round } = await req.json();

    const char1 = getCharacterByHandle(handle1);
    const char2 = getCharacterByHandle(handle2);
    if (!char1 || !char2) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    // Get joke from bot 1
    const res1 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 150,
        system: `${char1.systemPrompt}\n\nYou're in a COMEDY BATTLE against ${char2.name} (${char2.tagline}). Round ${round}/3. Topic: "${topic}". Give your FUNNIEST take. Stay in character. Under 50 words. Make it SHARP.`,
        messages: [{ role: "user", content: `Topic: "${topic}" — give your best joke! You're battling ${char2.name}.` }],
      }),
    });
    const data1 = await res1.json();

    // Get joke from bot 2
    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 150,
        system: `${char2.systemPrompt}\n\nYou're in a COMEDY BATTLE against ${char1.name} (${char1.tagline}). Round ${round}/3. Topic: "${topic}". Give your FUNNIEST take. Stay in character. Under 50 words. Make it SHARP.`,
        messages: [{ role: "user", content: `Topic: "${topic}" — give your best joke! You're battling ${char1.name}.` }],
      }),
    });
    const data2 = await res2.json();

    return NextResponse.json({
      joke1: data1.content?.[0]?.text || "I choked. Give me another round.",
      joke2: data2.content?.[0]?.text || "I choked. Give me another round.",
    });
  } catch {
    return NextResponse.json({ error: "Battle failed" }, { status: 500 });
  }
}
