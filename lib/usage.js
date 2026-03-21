// Usage tracking for daily limits
// 5 free msgs → share to unlock 5 more → share again for 5 more → blocked

const DAILY_MSG_LIMIT = 5;
const BONUS_PER_SHARE = 5;
const MAX_SHARES_PER_DAY = 2; // max 2 share-unlocks = 15 total msgs
const DAILY_GAME_LIMIT = 1;
const GAME_BONUS_PER_SHARE = 1;
const MAX_GAME_SHARES = 2; // max 2 share-unlocks = 3 total games

function getTodayKey() {
  return new Date().toISOString().split("T")[0]; // "2026-03-21"
}

function getUsage() {
  try {
    const saved = localStorage.getItem("ca_usage");
    if (!saved) return null;
    const usage = JSON.parse(saved);
    if (usage.date !== getTodayKey()) return null; // reset for new day
    return usage;
  } catch { return null; }
}

function saveUsage(usage) {
  localStorage.setItem("ca_usage", JSON.stringify({ ...usage, date: getTodayKey() }));
}

function initUsage() {
  return {
    date: getTodayKey(),
    messages: 0,
    msgShareUnlocks: 0, // how many times they shared to unlock msgs
    games: 0,
    gameShareUnlocks: 0, // how many times they shared to unlock games
  };
}

// ── Messages ──

export function getMessageCount() {
  const usage = getUsage() || initUsage();
  return usage.messages;
}

export function getMessageLimit() {
  const usage = getUsage() || initUsage();
  return DAILY_MSG_LIMIT + (usage.msgShareUnlocks * BONUS_PER_SHARE);
}

export function getRemainingMessages() {
  return Math.max(0, getMessageLimit() - getMessageCount());
}

export function canSendMessage() {
  return getRemainingMessages() > 0;
}

export function useMessage() {
  const usage = getUsage() || initUsage();
  usage.messages++;
  saveUsage(usage);
  return getRemainingMessages();
}

export function canUnlockMoreMessages() {
  const usage = getUsage() || initUsage();
  return usage.msgShareUnlocks < MAX_SHARES_PER_DAY;
}

export function unlockMoreMessages() {
  const usage = getUsage() || initUsage();
  if (usage.msgShareUnlocks >= MAX_SHARES_PER_DAY) return false;
  usage.msgShareUnlocks++;
  saveUsage(usage);
  return true;
}

// ── Games ──

export function getGameCount() {
  const usage = getUsage() || initUsage();
  return usage.games;
}

export function getGameLimit() {
  const usage = getUsage() || initUsage();
  return DAILY_GAME_LIMIT + (usage.gameShareUnlocks * GAME_BONUS_PER_SHARE);
}

export function getRemainingGames() {
  return Math.max(0, getGameLimit() - getGameCount());
}

export function canPlayGame() {
  return getRemainingGames() > 0;
}

export function useGame() {
  const usage = getUsage() || initUsage();
  usage.games++;
  saveUsage(usage);
  return getRemainingGames();
}

export function canUnlockMoreGames() {
  const usage = getUsage() || initUsage();
  return usage.gameShareUnlocks < MAX_GAME_SHARES;
}

export function unlockMoreGames() {
  const usage = getUsage() || initUsage();
  if (usage.gameShareUnlocks >= MAX_GAME_SHARES) return false;
  usage.gameShareUnlocks++;
  saveUsage(usage);
  return true;
}

// ── Summary for UI ──

export function getUsageSummary() {
  const usage = getUsage() || initUsage();
  return {
    messages: usage.messages,
    messageLimit: getMessageLimit(),
    messagesRemaining: getRemainingMessages(),
    canUnlockMsgs: canUnlockMoreMessages(),
    games: usage.games,
    gameLimit: getGameLimit(),
    gamesRemaining: getRemainingGames(),
    canUnlockGames: canUnlockMoreGames(),
    isBlocked: !canSendMessage() && !canUnlockMoreMessages(),
    isGameBlocked: !canPlayGame() && !canUnlockMoreGames(),
  };
}
