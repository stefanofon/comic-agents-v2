import { NextRequest, NextResponse } from "next/server";
import { getCharacterByHandle, getActiveCharacters } from "@/lib/characters";

const TOPICS = [
  "Monday mornings", "Dating apps in 2026", "Working from home", "Coffee addiction",
  "Social media influencers", "Gym selfies", "Online shopping at 2am", "Group chats",
  "Airplane middle seats", "Fast food at midnight", "Smart home devices spying on you",
  "Trying to eat healthy", "Crypto bros at dinner", "Parents on TikTok", "AI taking jobs",
  "Netflix asking 'are you still watching?'", "Zoom meetings that could be emails",
  "Reply-all email disasters", "Waiting for the weekend", "Adulting is a scam",
];

export async function POST(req: NextRequest) {
  try {
    const { bot1Handle, bot2Handle, topic, round } = await req.json();

    const bot1 = getCharacterByHandle(bot1Handle);
    const bot2 = getCharacterByHandle(bot2Handle);
    if (!bot1 || !bot2) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const actualTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];

    // Bot 1 goes first
    const bot1Res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 150,
        system: bot1.systemPrompt + `\n\nCOMEDY BATTLE vs ${bot2.name}. Topic: "${actualTopic}". Make a joke about the topic AND throw shade at your opponent ${bot2.name}. Under 50 words. Be savage but funny.`,
        messages: [{ role: "user", content: `Comedy battle! Topic: "${actualTopic}". Your opponent is ${bot2.name} (${bot2.tagline}). Roast the topic and throw shade at them!` }],
      }),
    });
    const bot1Data = await bot1Res.json();
    const bot1Joke = bot1Data.content?.[0]?.text || "I got nothing. Next round.";

    // Bot 2 responds (sees bot 1's joke)
    const bot2Res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 150,
        system: bot2.systemPrompt + `\n\nCOMEDY BATTLE vs ${bot1.name}. Topic: "${actualTopic}". Your opponent just said: "${bot1Joke}". Clap back with a funnier joke about the topic AND roast their weak attempt. Under 50 words. Be savage.`,
        messages: [{ role: "user", content: `Your opponent ${bot1.name} just said: "${bot1Joke}". Clap back! Topic: "${actualTopic}"` }],
      }),
    });
    const bot2Data = await bot2Res.json();
    const bot2Joke = bot2Data.content?.[0]?.text || "I'm too good for a comeback. You win by default.";

    return NextResponse.json({
      topic: actualTopic,
      round: round || 1,
      bot1: { handle: bot1.handle, name: bot1.name, emoji: bot1.emoji, color: bot1.color, joke: bot1Joke },
      bot2: { handle: bot2.handle, name: bot2.name, emoji: bot2.emoji, color: bot2.color, joke: bot2Joke },
    });
  } catch (error) {
    return NextResponse.json({ error: "Battle failed" }, { status: 500 });
  }
}
