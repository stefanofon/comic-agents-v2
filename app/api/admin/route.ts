import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const userId = req.nextUrl.searchParams.get("user");
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const headers = { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` };
    const res = await fetch(`${supabaseUrl}/rest/v1/analytics_events?select=*&order=created_at.desc&limit=10000`, { headers });
    const events = await res.json();
    if (!Array.isArray(events)) return NextResponse.json({ events: [], metrics: {} });

    // ── Per-user detail ──
    if (userId) {
      const ue = events.filter((e: any) => e.user_email === userId || e.user_name === userId);
      const chats = ue.filter((e: any) => e.event_type === "chat_message").length;
      const shares = ue.filter((e: any) => e.event_type?.startsWith("share")).length;
      const battles = ue.filter((e: any) => e.event_type === "battle_start").length;
      const roasts = ue.filter((e: any) => e.event_type === "like" && e.metadata?.type === "roast_rating").length;
      const quizzes = ue.filter((e: any) => e.event_type === "page_view" && e.metadata?.page === "/quiz").length;
      const sessions = ue.filter((e: any) => e.event_type === "session_start").length;
      const pageViews = ue.filter((e: any) => e.event_type === "page_view").length;
      
      const sessionDurations = ue.filter((e: any) => e.event_type === "session_end" && e.metadata?.session_duration_seconds).map((e: any) => e.metadata.session_duration_seconds);
      const avgSession = sessionDurations.length > 0 ? Math.round(sessionDurations.reduce((a: number, b: number) => a + b, 0) / sessionDurations.length) : 0;

      const botCounts: Record<string, number> = {};
      ue.forEach((e: any) => { const c = e.metadata?.character; if (c) botCounts[c] = (botCounts[c] || 0) + 1; });

      const gameCounts = { battles, roasts, quizzes };
      const favoriteGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0];

      return NextResponse.json({
        user: {
          email: userId,
          name: ue.find((e: any) => e.user_name)?.user_name || userId,
          firstSeen: ue.length > 0 ? ue[ue.length - 1].created_at : null,
          lastSeen: ue.length > 0 ? ue[0].created_at : null,
          totalEvents: ue.length,
          totalSessions: sessions,
          totalChats: chats,
          totalShares: shares,
          totalBattles: battles,
          totalRoasts: roasts,
          totalQuizzes: quizzes,
          totalPageViews: pageViews,
          avgSessionSeconds: avgSession,
          favoriteBot: Object.entries(botCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none",
          favoriteGame: favoriteGame && favoriteGame[1] > 0 ? favoriteGame[0] : "none",
          msgsPerSession: sessions > 0 ? (chats / sessions).toFixed(1) : "0",
          botInteractions: Object.entries(botCounts).sort((a, b) => b[1] - a[1]).map(([bot, count]) => ({ bot, count })),
          country: ue.find((e: any) => e.country)?.country || "??",
          device: ue.find((e: any) => e.device_type)?.device_type || "unknown",
          recentEvents: ue.slice(0, 30).map((e: any) => ({
            type: e.event_type, time: e.created_at,
            detail: e.metadata?.character || e.metadata?.page || "",
          })),
        }
      });
    }

    // ── Global analytics ──
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 86400000);

    const todayEvents = events.filter((e: any) => new Date(e.created_at) >= today);
    const yesterdayEvents = events.filter((e: any) => { const d = new Date(e.created_at); return d >= yesterday && d < today; });
    const weekEvents = events.filter((e: any) => new Date(e.created_at) >= weekAgo);
    const prevWeekEvents = events.filter((e: any) => { const d = new Date(e.created_at); return d >= twoWeeksAgo && d < weekAgo; });

    // Unique users
    const allEmails = [...new Set(events.map((e: any) => e.user_email).filter(Boolean))];
    const todayEmails = new Set(todayEvents.map((e: any) => e.user_email).filter(Boolean));
    const yesterdayEmails = new Set(yesterdayEvents.map((e: any) => e.user_email).filter(Boolean));
    const weekEmails = new Set(weekEvents.map((e: any) => e.user_email).filter(Boolean));
    const prevWeekEmails = new Set(prevWeekEvents.map((e: any) => e.user_email).filter(Boolean));

    // Retention: users who came back more than once
    const userSessionCounts: Record<string, number> = {};
    events.filter((e: any) => e.event_type === "session_start" && e.user_email).forEach((e: any) => {
      userSessionCounts[e.user_email] = (userSessionCounts[e.user_email] || 0) + 1;
    });
    const returningUsers = Object.values(userSessionCounts).filter(c => c > 1).length;
    const retentionRate = allEmails.length > 0 ? Math.round((returningUsers / allEmails.length) * 100) : 0;

    // WoW growth
    const wowGrowth = prevWeekEmails.size > 0 ? Math.round(((weekEmails.size - prevWeekEmails.size) / prevWeekEmails.size) * 100) : weekEmails.size > 0 ? 100 : 0;

    // Event counts
    const pageViews = events.filter((e: any) => e.event_type === "page_view");
    const chatMessages = events.filter((e: any) => e.event_type === "chat_message");
    const shares = events.filter((e: any) => e.event_type?.startsWith("share"));
    const battles = events.filter((e: any) => e.event_type === "battle_start");
    const battleCompletes = events.filter((e: any) => e.event_type === "battle_complete");
    const roasts = events.filter((e: any) => e.event_type === "like" && e.metadata?.type === "roast_rating");
    const quizPageViews = events.filter((e: any) => e.event_type === "page_view" && (e.metadata?.page === "/quiz" || e.url === "/quiz"));

    // Game popularity comparison
    const gamePopularity = [
      { name: "Roast me", count: roasts.length, emoji: "🔥" },
      { name: "Comedy battle", count: battles.length, emoji: "🥊" },
      { name: "Who said it?", count: quizPageViews.length, emoji: "🎯" },
    ].sort((a, b) => b.count - a.count);

    // Avg session duration
    const sessionEnds = events.filter((e: any) => e.event_type === "session_end" && e.metadata?.session_duration_seconds);
    const avgDuration = sessionEnds.length > 0
      ? Math.round(sessionEnds.reduce((s: number, e: any) => s + e.metadata.session_duration_seconds, 0) / sessionEnds.length) : 0;

    // Messages per session
    const totalSessions = events.filter((e: any) => e.event_type === "session_start").length;
    const msgsPerSession = totalSessions > 0 ? (chatMessages.length / totalSessions).toFixed(1) : "0";

    // Messages per user
    const msgsPerUser = allEmails.length > 0 ? (chatMessages.length / allEmails.length).toFixed(1) : "0";
    const sharesPerUser = allEmails.length > 0 ? (shares.length / allEmails.length).toFixed(1) : "0";

    // Peak hours (0-23)
    const hourCounts: number[] = new Array(24).fill(0);
    events.forEach((e: any) => {
      const hour = new Date(e.created_at).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHourFormatted = `${peakHour.toString().padStart(2, "0")}:00 - ${((peakHour + 1) % 24).toString().padStart(2, "0")}:00`;

    // Hourly distribution for chart
    const hourlyDistribution = hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
    }));

    // Bot popularity
    const botCounts: Record<string, number> = {};
    events.forEach((e: any) => { const c = e.metadata?.character; if (c) botCounts[c] = (botCounts[c] || 0) + 1; });
    const topBots = Object.entries(botCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([handle, count]) => ({ handle, count }));

    // Bot chat counts specifically
    const botChatCounts: Record<string, number> = {};
    chatMessages.forEach((e: any) => { const c = e.metadata?.character; if (c) botChatCounts[c] = (botChatCounts[c] || 0) + 1; });
    const topChatBots = Object.entries(botChatCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([handle, count]) => ({ handle, count }));

    // Bot share counts
    const botShareCounts: Record<string, number> = {};
    shares.forEach((e: any) => { const c = e.metadata?.character; if (c) botShareCounts[c] = (botShareCounts[c] || 0) + 1; });
    const topSharedBots = Object.entries(botShareCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([handle, count]) => ({ handle, count }));

    // Countries
    const countryCounts: Record<string, number> = {};
    events.forEach((e: any) => { if (e.country) countryCounts[e.country] = (countryCounts[e.country] || 0) + 1; });
    const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }));

    // Devices
    const deviceCounts: Record<string, number> = {};
    events.forEach((e: any) => { if (e.device_type) deviceCounts[e.device_type] = (deviceCounts[e.device_type] || 0) + 1; });

    // Top pages
    const pageCounts: Record<string, number> = {};
    pageViews.forEach((e: any) => { const u = e.metadata?.page || e.url || "/"; pageCounts[u] = (pageCounts[u] || 0) + 1; });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }));

    // Share platforms
    const sharePlatforms: Record<string, number> = {};
    shares.forEach((e: any) => { const p = e.event_type?.replace("share_", "") || "other"; sharePlatforms[p] = (sharePlatforms[p] || 0) + 1; });

    // Referrers
    const referrerCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const ref = e.referrer || e.metadata?.referrer;
      if (ref && ref !== "" && ref !== "null") {
        try { const host = new URL(ref).hostname; referrerCounts[host] = (referrerCounts[host] || 0) + 1; } catch {}
      }
    });
    const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count }));

    // Daily trends (14 days)
    const dailyTrends = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 86400000);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const de = events.filter((e: any) => { const d = new Date(e.created_at); return d >= dayStart && d < dayEnd; });
      const dayUsers = new Set(de.map((e: any) => e.user_email).filter(Boolean));
      dailyTrends.push({
        date: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: dayUsers.size,
        events: de.length,
        chats: de.filter((e: any) => e.event_type === "chat_message").length,
        shares: de.filter((e: any) => e.event_type?.startsWith("share")).length,
        battles: de.filter((e: any) => e.event_type === "battle_start").length,
        roasts: de.filter((e: any) => e.event_type === "like" && e.metadata?.type === "roast_rating").length,
        pageViews: de.filter((e: any) => e.event_type === "page_view").length,
      });
    }

    // User summaries
    const userSummaries = allEmails.map((email) => {
      const ue = events.filter((e: any) => e.user_email === email);
      const uChats = ue.filter((e: any) => e.event_type === "chat_message").length;
      const uShares = ue.filter((e: any) => e.event_type?.startsWith("share")).length;
      const uBattles = ue.filter((e: any) => e.event_type === "battle_start").length;
      const uRoasts = ue.filter((e: any) => e.event_type === "like" && e.metadata?.type === "roast_rating").length;
      const uSessions = ue.filter((e: any) => e.event_type === "session_start").length;
      const uSessionDurations = ue.filter((e: any) => e.event_type === "session_end" && e.metadata?.session_duration_seconds).map((e: any) => e.metadata.session_duration_seconds);
      const uAvgSession = uSessionDurations.length > 0 ? Math.round(uSessionDurations.reduce((a: number, b: number) => a + b, 0) / uSessionDurations.length) : 0;

      const bc: Record<string, number> = {};
      ue.forEach((e: any) => { const c = e.metadata?.character; if (c) bc[c] = (bc[c] || 0) + 1; });
      const favBot = Object.entries(bc).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      const favGame = [{ n: "battle", c: uBattles }, { n: "roast", c: uRoasts }].sort((a, b) => b.c - a.c)[0];

      return {
        email, name: ue.find((e: any) => e.user_name)?.user_name || email?.split("@")[0] || "—",
        country: ue.find((e: any) => e.country)?.country || "??",
        device: ue.find((e: any) => e.device_type)?.device_type || "?",
        totalEvents: ue.length, sessions: uSessions, chats: uChats, shares: uShares,
        battles: uBattles, roasts: uRoasts, avgSession: uAvgSession,
        favoriteBot: favBot, favoriteGame: favGame && favGame.c > 0 ? favGame.n : "—",
        firstSeen: ue[ue.length - 1]?.created_at, lastSeen: ue[0]?.created_at,
      };
    }).sort((a, b) => b.totalEvents - a.totalEvents);

    // Recent events
    const recentEvents = events.slice(0, 40).map((e: any) => ({
      type: e.event_type,
      user: e.user_name || e.user_email?.split("@")[0] || "anon",
      time: e.created_at, country: e.country, device: e.device_type,
      detail: e.metadata?.character || e.metadata?.page || "",
    }));

    return NextResponse.json({
      metrics: {
        totalEvents: events.length,
        totalUsers: allEmails.length,
        todayUsers: todayEmails.size,
        yesterdayUsers: yesterdayEmails.size,
        weekUsers: weekEmails.size,
        wowGrowth,
        returningUsers,
        retentionRate,
        totalPageViews: pageViews.length,
        todayPageViews: todayEvents.filter((e: any) => e.event_type === "page_view").length,
        totalChats: chatMessages.length,
        totalShares: shares.length,
        totalBattles: battles.length,
        battleCompletionRate: battles.length > 0 ? Math.round((battleCompletes.length / battles.length) * 100) : 0,
        totalRoasts: roasts.length,
        totalQuizzes: quizPageViews.length,
        avgSessionSeconds: avgDuration,
        msgsPerUser,
        msgsPerSession,
        sharesPerUser,
        totalSessions,
        peakHour: peakHourFormatted,
      },
      gamePopularity, topBots, topChatBots, topSharedBots,
      topCountries, topPages, topReferrers,
      devices: deviceCounts, sharePlatforms,
      hourlyDistribution, dailyTrends, userSummaries, recentEvents,
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
