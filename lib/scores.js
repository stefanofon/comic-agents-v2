// Save a score to the leaderboard
export async function saveScore(gameType, score, characterHandle, metadata = {}) {
  try {
    const user = JSON.parse(localStorage.getItem("comic_agents_user") || "{}");
    if (!user.username) return;

    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        gameType,
        score,
        characterHandle,
        metadata,
      }),
    });
  } catch {}
}
