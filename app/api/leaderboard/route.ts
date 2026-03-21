import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

    const headers = { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` };

    const res = await fetch(`${supabaseUrl}/rest/v1/leaderboard?select=*&order=score.desc&limit=200`, { headers });
    const scores = await res.json();
    if (!Array.isArray(scores)) return NextResponse.json({ scores: [] });

    // Group by game type
    const battle = scores.filter((s: any) => s.game_type === "battle").slice(0, 50);
    const roast = scores.filter((s: any) => s.game_type === "roast").slice(0, 50);
    const quiz = scores.filter((s: any) => s.game_type === "quiz").slice(0, 50);

    // All-time top players (sum of all scores)
    const playerScores: Record<string, { username: string; total: number; games: number }> = {};
    scores.forEach((s: any) => {
      if (!playerScores[s.username]) playerScores[s.username] = { username: s.username, total: 0, games: 0 };
      playerScores[s.username].total += s.score;
      playerScores[s.username].games++;
    });
    const allTime = Object.values(playerScores).sort((a, b) => b.total - a.total).slice(0, 30);

    return NextResponse.json({ battle, roast, quiz, allTime });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

    await fetch(`${supabaseUrl}/rest/v1/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        game_type: body.gameType,
        score: body.score,
        character_handle: body.characterHandle || null,
        metadata: body.metadata || {},
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
