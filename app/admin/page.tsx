"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import WaitlistAdmin from "@/components/WaitlistAdmin";

const FLAGS: Record<string, string> = { US:"🇺🇸",GB:"🇬🇧",IT:"🇮🇹",FR:"🇫🇷",DE:"🇩🇪",ES:"🇪🇸",AR:"🇦🇷",BR:"🇧🇷",MX:"🇲🇽",JP:"🇯🇵",CN:"🇨🇳",IN:"🇮🇳",AU:"🇦🇺",CA:"🇨🇦",NL:"🇳🇱",PT:"🇵🇹",EU:"🇪🇺",CH:"🇨🇭",SE:"🇸🇪",KR:"🇰🇷" };
const EV: Record<string, string> = { page_view:"👀",session_start:"🟢",session_end:"🔴",chat_message:"💬",bot_response:"🤖",share_twitter:"🐦",share_linkedin:"💼",share_whatsapp:"📱",share_copy:"📋",like:"❤️",battle_start:"🥊",battle_complete:"🏆",battle_round:"⚔️",battle_share:"📤",viral_joke_share:"🔥",test:"🧪",signup:"✅" };

function S({ label, value, sub, color, emoji, trend }: any) {
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 14, border: `1px solid ${color}33`, flex: 1, minWidth: 130 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 14 }}>{emoji}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color }}>{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend > 0 ? "var(--green)" : "var(--red)" }}>
            {trend > 0 ? "↑" : "↓"}{Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Bar({ data, color, label }: { data: Array<{ name: string; value: number }>; color: string; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      {data.slice(0, 8).map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 12 }}>
          <span style={{ color: "var(--text2)", width: 85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
          <div style={{ flex: 1, height: 14, background: "var(--bg3)", borderRadius: 3 }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
          </div>
          <span style={{ fontWeight: 700, color, width: 32, textAlign: "right" }}>{d.value}</span>
        </div>
      ))}
      {data.length === 0 && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: 14 }}>No data yet</div>}
    </div>
  );
}

function Trend({ data, label }: { data: any[]; label: string }) {
  const maxU = Math.max(...data.map(d => d.users), 1);
  const maxC = Math.max(...data.map(d => d.chats), 1);
  const maxS = Math.max(...data.map(d => d.shares), 1);
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", gap: 1, alignItems: "flex-end", height: 75 }}>
            <div style={{ flex: 1, background: "var(--accent)", borderRadius: "2px 2px 0 0", height: `${(d.users / maxU) * 100}%`, minHeight: d.users > 0 ? 3 : 0 }} title={`${d.users} users`} />
            <div style={{ flex: 1, background: "var(--cyan)", borderRadius: "2px 2px 0 0", height: `${(d.chats / maxC) * 100}%`, minHeight: d.chats > 0 ? 3 : 0 }} title={`${d.chats} chats`} />
            <div style={{ flex: 1, background: "var(--pink)", borderRadius: "2px 2px 0 0", height: `${(d.shares / maxS) * 100}%`, minHeight: d.shares > 0 ? 3 : 0 }} title={`${d.shares} shares`} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.filter((_: any, i: number) => i % 2 === 0).map((d: any, i: number) => (
          <span key={i} style={{ fontSize: 8, color: "var(--text3)" }}>{d.date}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6, fontSize: 10, color: "var(--text3)" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", borderRadius: 2, marginRight: 3 }} />Users</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--cyan)", borderRadius: 2, marginRight: 3 }} />Chats</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--pink)", borderRadius: 2, marginRight: 3 }} />Shares</span>
      </div>
    </div>
  );
}

function Hours({ data, label }: { data: any[]; label: string }) {
  const max = Math.max(...data.map((d: any) => d.count), 1);
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
        {data.map((d: any, i: number) => (
          <div key={i} style={{ flex: 1, background: d.count === max ? "var(--yellow)" : "var(--accent)44", borderRadius: "2px 2px 0 0", height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }} title={`${d.hour}: ${d.count} events`} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 8, color: "var(--text3)" }}>00:00</span>
        <span style={{ fontSize: 8, color: "var(--text3)" }}>06:00</span>
        <span style={{ fontSize: 8, color: "var(--text3)" }}>12:00</span>
        <span style={{ fontSize: 8, color: "var(--text3)" }}>18:00</span>
        <span style={{ fontSize: 8, color: "var(--text3)" }}>23:00</span>
      </div>
    </div>
  );
}

function UserDetail({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch(`/api/admin?user=${encodeURIComponent(userId)}`).then(r => r.json()).then(setData); }, [userId]);
  if (!data?.user) return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="animate-pulse-slow">Loading...</div></div>;
  const u = data.user;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--bg2)", borderRadius: 20, padding: 24, maxWidth: 600, width: "100%", maxHeight: "85vh", overflow: "auto", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>{u.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{u.email} • {FLAGS[u.country] || "🌍"} {u.country} • {u.device}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
          {[
            { v: u.totalSessions, l: "Sessions", c: "var(--accent)" },
            { v: u.totalChats, l: "Messages", c: "var(--cyan)" },
            { v: u.totalShares, l: "Shares", c: "var(--pink)" },
            { v: u.totalBattles, l: "Battles", c: "var(--red)" },
            { v: u.totalRoasts, l: "Roasts", c: "var(--yellow)" },
            { v: u.totalQuizzes || 0, l: "Quizzes", c: "var(--green)" },
            { v: u.avgSessionSeconds ? `${Math.floor(u.avgSessionSeconds / 60)}m` : "—", l: "Avg session", c: "var(--text2)" },
            { v: u.msgsPerSession || "—", l: "Msgs/session", c: "var(--text2)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg3)", borderRadius: 8, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 9, color: "var(--text3)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Favorite bot: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{u.favoriteBot}</span></div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Favorite game: <span style={{ color: "var(--yellow)", fontWeight: 700 }}>{u.favoriteGame}</span></div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>First seen: {u.firstSeen ? new Date(u.firstSeen).toLocaleDateString() : "—"}</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>Last active: {u.lastSeen ? new Date(u.lastSeen).toLocaleString() : "—"}</div>
        {u.botInteractions?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Bot interactions</div>
            {u.botInteractions.map((b: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, fontSize: 11 }}>
                <span style={{ width: 80, color: "var(--text2)" }}>{b.bot}</span>
                <div style={{ flex: 1, height: 8, background: "var(--bg)", borderRadius: 3 }}>
                  <div style={{ width: `${(b.count / u.botInteractions[0].count) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                </div>
                <span style={{ fontWeight: 700, color: "var(--accent)", width: 25, textAlign: "right" }}>{b.count}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Recent activity</div>
        <div style={{ maxHeight: 180, overflow: "auto" }}>
          {(u.recentEvents || []).map((e: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 0", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
              <span>{EV[e.type] || "📊"}</span>
              <span style={{ color: "var(--text2)", flex: 1 }}>{e.type?.replace(/_/g, " ")}</span>
              {e.detail && <span style={{ color: "var(--cyan)", fontSize: 10 }}>{e.detail}</span>}
              <span style={{ color: "var(--text3)", fontSize: 9 }}>{new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "live" | "waitlist">("overview");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => { try { const r = await fetch("/api/admin"); setData(await r.json()); } catch {} setLoading(false); };
  useEffect(() => { fetchData(); if (autoRefresh) { const i = setInterval(fetchData, 10000); return () => clearInterval(i); } }, [autoRefresh]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="animate-pulse-slow">Loading analytics...</div></div>;
  const m = data?.metrics || {};

  return (
    <div style={{ minHeight: "100vh" }}>
      {selectedUser && <UserDetail userId={selectedUser} onClose={() => setSelectedUser(null)} />}

      <header style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 18 }}>←</Link>
          <span style={{ fontSize: 20 }}>📊</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>Analytics</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 10, color: "var(--text3)", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto 10s
          </label>
          <button onClick={fetchData} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text1)", cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>🔄</button>
        </div>
      </header>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
        {(["overview", "users", "waitlist", "live"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
            background: tab === t ? "var(--bg)" : "transparent", color: tab === t ? "var(--accent)" : "var(--text3)",
            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
          }}>
            {t === "overview" ? "📈 Overview" : t === "users" ? "👥 Users" : t === "waitlist" ? "📋 Waitlist" : "⚡ Live"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 14 }}>

        {tab === "overview" && (
          <>
            {/* Row 1: Core user metrics */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <S label="Total users" value={m.totalUsers} sub={`${m.todayUsers} today / ${m.yesterdayUsers} yesterday`} color="var(--accent)" emoji="👥" trend={m.wowGrowth} />
              <S label="Weekly active" value={m.weekUsers} color="var(--cyan)" emoji="📅" />
              <S label="Returning users" value={m.returningUsers} sub={`${m.retentionRate}% retention`} color="var(--green)" emoji="🔄" />
              <S label="Avg session" value={m.avgSessionSeconds ? `${Math.floor(m.avgSessionSeconds / 60)}m ${m.avgSessionSeconds % 60}s` : "—"} color="var(--yellow)" emoji="⏱️" />
            </div>

            {/* Row 2: Engagement metrics */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <S label="Total chats" value={m.totalChats} sub={`${m.msgsPerUser} per user / ${m.msgsPerSession} per session`} color="var(--cyan)" emoji="💬" />
              <S label="Total shares" value={m.totalShares} sub={`${m.sharesPerUser} per user`} color="var(--pink)" emoji="🔗" />
              <S label="Page views" value={m.totalPageViews} sub={`${m.todayPageViews} today`} color="var(--text2)" emoji="👀" />
              <S label="Peak hour" value={m.peakHour || "—"} color="var(--yellow)" emoji="🕐" />
            </div>

            {/* Row 3: Games */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <S label="Battles" value={m.totalBattles} sub={`${m.battleCompletionRate}% finish`} color="var(--red)" emoji="🥊" />
              <S label="Roasts" value={m.totalRoasts} color="#F97316" emoji="🔥" />
              <S label="Quizzes" value={m.totalQuizzes} color="var(--green)" emoji="🎯" />
              <S label="Total sessions" value={m.totalSessions} color="var(--text2)" emoji="📊" />
            </div>

            {/* Daily trend */}
            <div style={{ marginBottom: 12 }}>
              <Trend data={data?.dailyTrends || []} label="📈 14-day trend — users / chats / shares" />
            </div>

            {/* Hourly + Game popularity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Hours data={data?.hourlyDistribution || []} label="🕐 Activity by hour (peak = gold)" />
              <Bar label="🎮 Game popularity" data={(data?.gamePopularity || []).map((g: any) => ({ name: `${g.emoji} ${g.name}`, value: g.count }))} color="var(--red)" />
            </div>

            {/* Bot charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Bar label="🤖 Most chatted bots" data={(data?.topChatBots || []).map((b: any) => ({ name: b.handle, value: b.count }))} color="var(--accent)" />
              <Bar label="📤 Most shared bots" data={(data?.topSharedBots || []).map((b: any) => ({ name: b.handle, value: b.count }))} color="var(--pink)" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Bar label="🌍 Countries" data={(data?.topCountries || []).map((c: any) => ({ name: `${FLAGS[c.country] || "🌍"} ${c.country}`, value: c.count }))} color="var(--cyan)" />
              <Bar label="📱 Share platforms" data={Object.entries(data?.sharePlatforms || {}).map(([n, c]) => ({ name: n, value: c as number }))} color="var(--green)" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Bar label="📄 Top pages" data={(data?.topPages || []).map((p: any) => ({ name: p.page, value: p.count }))} color="var(--yellow)" />
              <Bar label="🔗 Referrers" data={(data?.topReferrers || []).map((r: any) => ({ name: r.source, value: r.count }))} color="var(--accent)" />
            </div>

            {/* Devices */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {Object.entries(data?.devices || {}).map(([d, c]) => (
                <div key={d} style={{ flex: 1, background: "var(--bg2)", borderRadius: 14, padding: 12, border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{d === "desktop" ? "🖥️" : d === "mobile" ? "📱" : "📟"}</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>{c as number}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>{d}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "users" && (
          <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700 }}>
              👥 All users ({(data?.userSummaries || []).length}) — click for full profile
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["User", "🌍", "📱", "Events", "💬", "🔗", "🥊", "🔥", "⏱️ Avg", "Fav bot", "Fav game", "Last seen"].map(h => (
                      <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--text3)", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.userSummaries || []).map((u: any, i: number) => (
                    <tr key={i} onClick={() => setSelectedUser(u.email)}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "6px 8px" }}>
                        <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 11 }}>{u.name}</div>
                        <div style={{ fontSize: 9, color: "var(--text3)" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "6px 8px" }}>{FLAGS[u.country] || "🌍"}</td>
                      <td style={{ padding: "6px 8px" }}>{u.device === "desktop" ? "🖥️" : "📱"}</td>
                      <td style={{ padding: "6px 8px", fontWeight: 700 }}>{u.totalEvents}</td>
                      <td style={{ padding: "6px 8px", color: "var(--cyan)" }}>{u.chats}</td>
                      <td style={{ padding: "6px 8px", color: "var(--pink)" }}>{u.shares}</td>
                      <td style={{ padding: "6px 8px", color: "var(--red)" }}>{u.battles}</td>
                      <td style={{ padding: "6px 8px", color: "var(--yellow)" }}>{u.roasts}</td>
                      <td style={{ padding: "6px 8px", fontSize: 10 }}>{u.avgSession ? `${Math.floor(u.avgSession / 60)}m` : "—"}</td>
                      <td style={{ padding: "6px 8px", color: "var(--cyan)", fontSize: 10 }}>{u.favoriteBot}</td>
                      <td style={{ padding: "6px 8px", fontSize: 10 }}>{u.favoriteGame}</td>
                      <td style={{ padding: "6px 8px", fontSize: 9, color: "var(--text3)" }}>{u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data?.userSummaries || []).length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>No users yet</div>
              )}
            </div>
          </div>
        )}

        {tab === "waitlist" && <WaitlistAdmin />}

        {tab === "live" && (
          <div style={{ background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700 }}>
              ⚡ Live activity — auto-refreshes every 10s
            </div>
            {(data?.recentEvents || []).map((e: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
                <span style={{ fontSize: 13 }}>{EV[e.type] || "📊"}</span>
                <span style={{ color: "var(--accent)", fontWeight: 600, width: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.user}</span>
                <span style={{ color: "var(--text2)", flex: 1 }}>{e.type?.replace(/_/g, " ")}</span>
                {e.detail && <span style={{ color: "var(--cyan)", fontSize: 10 }}>{e.detail}</span>}
                {e.country && <span style={{ fontSize: 10 }}>{FLAGS[e.country] || "🌍"}</span>}
                <span style={{ color: "var(--text3)", fontSize: 9, width: 50, textAlign: "right" }}>{new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
            {(data?.recentEvents || []).length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>No events yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
