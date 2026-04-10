import { NextRequest, NextResponse } from "next/server";
import { getCharacterByHandle, getActiveCharacters } from "@/lib/characters";

const RANDOM_TOPICS = [
  "the fact that the user is talking to a bot at this hour",
  "Monday mornings and the lie that weekends are long enough",
  "people who say 'I'm not a morning person' every single day",
  "the user's decision to click on a 'roast me' button voluntarily",
  "people who reply 'haha' but aren't actually laughing",
  "spending 45 minutes choosing a Netflix show then watching nothing",
  "people who set 12 alarms and snooze all of them",
  "the concept of 'adulting' as if it's optional",
  "people who say they'll go to the gym 'tomorrow' for 3 years",
  "doomscrolling at 2am then wondering why you're tired",
  "being on a diet that starts every Monday",
  "people who say 'let me think about it' and never think about it",
  "having 847 unread emails and calling yourself organized",
  "saying 'I should learn to cook' while ordering delivery",
  "the audacity of someone talking to an AI comedian for fun",
  "people who take 40 selfies to post 'the candid one'",
  "having strong opinions about fonts",
  "people who say 'I'm fine' in a tone that clearly means war",
  "the user's screen time being higher than their credit score",
  "treating online shopping as a personality trait",
];

export async function POST(req: NextRequest) {
  try {
    const { characterHandle } = await req.json();

    let char;
    if (characterHandle) {
      char = getCharacterByHandle(characterHandle);
    }
    if (!char) {
      const active = getActiveCharacters();
      char = active[Math.floor(Math.random() * active.length)];
    }

    const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];

    const roastPrompt = `${char.systemPrompt}\n\nSPECIAL MODE: ROAST ROULETTE. You're doing a random roast about: "${topic}". Be hilarious, unexpected, and creative. Under 60 words. Stay in character. End with something warm or funny. Roast the TOPIC/SITUATION, not any specific person.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 200, system: roastPrompt,
        messages: [{ role: "user", content: `Do a random roast about: ${topic}` }],
      }),
    });

    const data = await response.json();
    return NextResponse.json({
      roast: data.content?.[0]?.text || "My roast circuits overloaded. Try again.",
      topic,
      character: { handle: char.handle, name: char.name, emoji: char.emoji, color: char.color },
    });
  } catch {
    return NextResponse.json({ error: "Roast failed" }, { status: 500 });
  }
}
