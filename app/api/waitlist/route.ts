import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

    const headers = {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
    };

    // Check if email exists
    const checkEmail = async (email: string) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&select=email,is_invited`, { headers });
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    };

    // Send invite email
    const sendAccessEmail = async (toEmail: string, invitedByName?: string) => {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return false;

      const inviteText = invitedByName
        ? `<p style="color: #94A3B8; line-height: 1.7;">${invitedByName} invited you to Comic Agents — the funniest AI platform on the internet. 21 comedians are waiting for you.</p>`
        : `<p style="color: #94A3B8; line-height: 1.7;">Welcome to Comic Agents — the funniest AI platform on the internet. 21 comedians are waiting for you.</p>`;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: "Comic Agents <noreply-or-i-will-complain@comicagents.com>",
            to: [toEmail],
            subject: invitedByName
              ? `🤖 ${invitedByName} invited you to Comic Agents!`
              : "🤖 You're in! Your Comic Agents access code",
            html: `
              <div style="font-family: 'Courier New', monospace; background: #08080c; color: #f0f0f0; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 48px;">🤖</span>
                  <h1 style="font-family: sans-serif; font-size: 28px; letter-spacing: 3px; margin: 8px 0;">COMIC AGENTS</h1>
                  <p style="color: #A855F7; font-size: 16px;">You've been approved!</p>
                </div>
                ${inviteText}
                <div style="background: #12121a; border: 2px solid #A855F7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                  <p style="color: #94A3B8; font-size: 12px; margin-bottom: 8px;">YOUR ACCESS CODE</p>
                  <p style="font-size: 32px; font-weight: bold; color: #A855F7; letter-spacing: 4px; margin: 0;">makemelaugh</p>
                </div>
                <p style="text-align: center;">
                  <a href="https://comicagents.com" style="display: inline-block; background: #A855F7; color: #000; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">Enter Comic Agents →</a>
                </p>
                <p style="color: #555; font-size: 11px; text-align: center; margin-top: 24px;">
                  "I've been waiting for your approval for 15 YEARS." — KarenBot 5000
                </p>
              </div>
            `,
          }),
        });
        return true;
      } catch { return false; }
    };

    // ── REGISTER: new waitlist request (no code) ──
    if (body.action === "register" || body.action === undefined) {
      const existing = await checkEmail(body.email);
      if (existing && existing.is_invited) return NextResponse.json({ error: "duplicate" });
      if (existing) return NextResponse.json({ ok: true, already_pending: true });

      await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({
          email: body.email,
          source: body.name || "website",
          is_invited: false,
        }),
      });
      return NextResponse.json({ ok: true });
    }

    // ── ACTIVATE: user has code, register as approved ──
    if (body.action === "activate") {
      const existing = await checkEmail(body.email);
      if (existing) {
        // Update to approved
        await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(body.email)}`, {
          method: "PATCH",
          headers: { ...headers, "Prefer": "return=minimal" },
          body: JSON.stringify({ is_invited: true, invited_at: new Date().toISOString(), source: body.name || existing.source }),
        });
      } else {
        // New user with code
        await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
          method: "POST",
          headers: { ...headers, "Prefer": "return=minimal" },
          body: JSON.stringify({
            email: body.email,
            source: body.name || "direct_code",
            is_invited: true,
            invited_at: new Date().toISOString(),
            referral_code: "direct",
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // ── INVITE: user invites a friend ──
    if (body.action === "invite") {
      const existing = await checkEmail(body.email);
      if (existing && existing.is_invited) return NextResponse.json({ error: "duplicate" });
      if (existing) return NextResponse.json({ ok: true, already_pending: true });

      // Add to waitlist as invited
      await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({
          email: body.email,
          source: `invited_by:${body.invitedBy || "unknown"}`,
          is_invited: true,
          invited_at: new Date().toISOString(),
          referral_code: body.invitedBy || null,
        }),
      });

      // Send email
      await sendAccessEmail(body.email, body.invitedByName);

      return NextResponse.json({ ok: true });
    }

    // ── APPROVE: admin approves single user ──
    if (body.action === "approve") {
      await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(body.email)}`, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ is_invited: true, invited_at: new Date().toISOString() }),
      });
      await sendAccessEmail(body.email);
      return NextResponse.json({ ok: true });
    }

    // ── APPROVE ALL: admin approves all pending ──
    if (body.action === "approve_all") {
      const res = await fetch(`${supabaseUrl}/rest/v1/waitlist?is_invited=eq.false&select=email`, { headers });
      const pending = await res.json();

      await fetch(`${supabaseUrl}/rest/v1/waitlist?is_invited=eq.false`, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ is_invited: true, invited_at: new Date().toISOString() }),
      });

      if (Array.isArray(pending)) {
        for (const user of pending) {
          await sendAccessEmail(user.email);
        }
      }
      return NextResponse.json({ ok: true, approved: Array.isArray(pending) ? pending.length : 0 });
    }

    // ── LIST: admin gets waitlist ──
    if (body.action === "list") {
      const res = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=*&order=created_at.desc`, { headers });
      const list = await res.json();
      return NextResponse.json({ waitlist: Array.isArray(list) ? list : [] });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
