// Analytics tracking for Comic Agents
// Tracks EVERYTHING — this data is worth millions

// Event types we track
export const EVENTS = {
  // User lifecycle
  PAGE_VIEW: 'page_view',
  SIGNUP: 'signup',
  LOGIN: 'login',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Chat interactions  
  CHAT_MESSAGE: 'chat_message',
  BOT_RESPONSE: 'bot_response',
  CHAT_START: 'chat_start',
  
  // Engagement
  LIKE: 'like',
  SHARE: 'share',
  SHARE_TWITTER: 'share_twitter',
  SHARE_LINKEDIN: 'share_linkedin',
  SHARE_WHATSAPP: 'share_whatsapp',
  SHARE_COPY: 'share_copy',
  SCREENSHOT: 'screenshot',
  JOKE_VIEW: 'joke_view',
  
  // Battle mode
  BATTLE_START: 'battle_start',
  BATTLE_ROUND: 'battle_round',
  BATTLE_COMPLETE: 'battle_complete',
  BATTLE_SHARE: 'battle_share',
  
  // Navigation
  CHARACTER_VIEW: 'character_view',
  PROPOSE_VIEW: 'propose_view',
  PROPOSE_SUBMIT: 'propose_submit',
  PROPOSE_VOTE: 'propose_vote',
  
  // Viral jokes
  VIRAL_JOKE_VIEW: 'viral_joke_view',
  VIRAL_JOKE_LIKE: 'viral_joke_like',
  VIRAL_JOKE_SHARE: 'viral_joke_share',
  VIRAL_JOKE_FILTER: 'viral_joke_filter',
  
  // Business
  PARTNERSHIP_CONTACT: 'partnership_contact',
  CAREER_APPLY: 'career_apply',
};

// Get or create a session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('ca_session_id');
  if (!sessionId) {
    sessionId = 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('ca_session_id', sessionId);
    sessionStorage.setItem('ca_session_start', Date.now().toString());
  }
  return sessionId;
}

// Get user info
function getUserInfo() {
  try {
    const user = localStorage.getItem('comic_agents_user');
    return user ? JSON.parse(user) : null;
  } catch { return null; }
}

// Get session duration in seconds
export function getSessionDuration() {
  const start = sessionStorage.getItem('ca_session_start');
  if (!start) return 0;
  return Math.floor((Date.now() - parseInt(start)) / 1000);
}

// Detect country from timezone (rough but free, no API needed)
function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzCountryMap = {
      'America/New_York': 'US', 'America/Chicago': 'US', 'America/Los_Angeles': 'US',
      'America/Buenos_Aires': 'AR', 'America/Argentina': 'AR',
      'Europe/Rome': 'IT', 'Europe/London': 'GB', 'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Lisbon': 'PT',
      'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
      'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU', 'Pacific/Auckland': 'NZ',
    };
    for (const [prefix, country] of Object.entries(tzCountryMap)) {
      if (tz.startsWith(prefix.split('/')[0]) && tz.includes(prefix.split('/')[1])) return country;
    }
    // Fallback: use first part of timezone
    return tz.split('/')[0].substring(0, 2).toUpperCase();
  } catch { return 'XX'; }
}

// Get device info
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  return {
    type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
}

// Main tracking function
export function track(eventType, metadata = {}) {
  const user = getUserInfo();
  const device = getDeviceInfo();
  
  const event = {
    event_type: eventType,
    session_id: getSessionId(),
    user_email: user?.email || null,
    user_name: user?.name || null,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
    referrer: document.referrer || null,
    country: detectCountry(),
    platform: 'web',
    device_type: device.type,
    screen_size: device.screen,
    language: device.language,
    session_duration: getSessionDuration(),
    metadata: {
      ...metadata,
    },
  };

  // Send to our API (non-blocking)
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {}); // Never block on analytics

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Track:', eventType, metadata);
  }
}

// Convenience functions
export function trackPageView(page) {
  track(EVENTS.PAGE_VIEW, { page });
}

export function trackChat(characterHandle, messageLength) {
  track(EVENTS.CHAT_MESSAGE, { character: characterHandle, message_length: messageLength });
}

export function trackBotResponse(characterHandle, responseLength, responseTimeMs) {
  track(EVENTS.BOT_RESPONSE, { 
    character: characterHandle, 
    response_length: responseLength,
    response_time_ms: responseTimeMs,
  });
}

export function trackShare(platform, characterHandle, contentType) {
  const eventMap = {
    twitter: EVENTS.SHARE_TWITTER,
    linkedin: EVENTS.SHARE_LINKEDIN,
    whatsapp: EVENTS.SHARE_WHATSAPP,
    copy: EVENTS.SHARE_COPY,
  };
  track(eventMap[platform] || EVENTS.SHARE, { 
    character: characterHandle, 
    content_type: contentType,
    platform,
  });
}

export function trackBattle(characterHandle, event, data = {}) {
  track(event, { character: characterHandle, ...data });
}

export function trackViralJoke(characterHandle, action, jokeIndex) {
  track(action, { character: characterHandle, joke_index: jokeIndex });
}

// Track session end on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const duration = getSessionDuration();
    // Use sendBeacon for reliable delivery on page close
    navigator.sendBeacon('/api/analytics', JSON.stringify({
      event_type: EVENTS.SESSION_END,
      session_id: getSessionId(),
      user_email: getUserInfo()?.email,
      timestamp: new Date().toISOString(),
      platform: 'web',
      metadata: { session_duration_seconds: duration },
    }));
  });
}
