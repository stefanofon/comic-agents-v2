import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ ok: true });
    }

    await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        event_type: event.event_type,
        session_id: event.session_id,
        user_email: event.user_email,
        user_name: event.user_name,
        url: event.url,
        referrer: event.referrer,
        country: event.country,
        platform: event.platform || "web",
        device_type: event.device_type,
        screen_size: event.screen_size,
        language: event.language,
        session_duration: event.session_duration,
        metadata: event.metadata || {},
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
