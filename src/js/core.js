/**
 * Pure game + learning logic. No DOM, no storage, no network.
 * Every function takes an explicit `now` where time matters so it can be tested.
 */

export const STORAGE_KEY = 'bao.state.v1';
export const STATE_VERSION = 1;

export const HEARTS_MAX = 5;
export const HEART_REFILL_MS = 15 * 60 * 1000;
export const HEART_REFILL_COST = 100;
export const STREAK_FREEZE_COST = 50;
export const STREAK_FREEZE_MAX = 3;

export const XP_BY_MODE = {
  lesson: 10,
  review: 6,
  tone: 5,
  listening: 5,
  trace: 4,
  word: 4,
};

export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First bite', desc: 'Finish your first lesson', icon: '🥟' },
  { id: 'streak_3', title: 'On a roll', desc: 'Reach a 3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week of bao', desc: 'Reach a 7-day streak', icon: '🏮' },
  { id: 'words_25', title: 'Word collector', desc: 'Practise 25 different words', icon: '🧺' },
  { id: 'words_75', title: 'Word hoard', desc: 'Practise 75 different words', icon: '📚' },
  { id: 'perfect_5', title: 'Five stars', desc: 'Get 5 perfect lessons', icon: '⭐' },
  { id: 'lessons_10', title: 'Ten bowls', desc: 'Finish 10 lessons', icon: '🍜' },
  { id: 'xp_100', title: 'Century', desc: 'Earn 100 XP', icon: '💯' },
  { id: 'tone_20', title: 'Tone tamer', desc: 'Answer 20 tone questions correctly', icon: '🎵' },
];

const LEVELS = [
  { min: 0, title: 'Fresh bao' },
  { min: 100, title: 'Hello, you' },
  { min: 250, title: 'Tea sipper' },
  { min: 500, title: 'Character collector' },
  { min: 900, title: 'Tone tamer' },
  { min: 1400, title: 'Mandarin mover' },
  { min: 2200, title: 'Bao master' },
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key) {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

export function addDays(key, amount) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function daysBetween(fromKey, toKey) {
  return Math.round((parseDateKey(toKey) - parseDateKey(fromKey)) / 86400000);
}

export function defaultState(now = new Date()) {
  const today = dateKey(now);
  return {
    version: STATE_VERSION,
    createdAt: now.toISOString(),
    profile: {
      name: '',
      reason: '',
      dailyGoalXp: 30,
      onboarded: false,
      sound: true,
      showPinyin: true,
      slowAudio: false,
      unlimitedHearts: false,
    },
    xp: 0,
    gems: 120,
    hearts: HEARTS_MAX,
    heartsAt: now.toISOString(),
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    freezes: 1,
    daily: { date: today, xp: 0, lessons: 0 },
    history: {},
    lessons: {},
    reviews: {},
    words: {},
    achievements: {},
    stats: { answered: 0, correct: 0, minutes: 0, sessions: 0, toneCorrect: 0 },
  };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Merge saved state onto defaults so new fields survive an upgrade. */
export function hydrateState(saved, now = new Date()) {
  const base = defaultState(now);
  if (!isObject(saved)) return base;
  const state = {
    ...base,
    ...saved,
    profile: { ...base.profile, ...(isObject(saved.profile) ? saved.profile : {}) },
    daily: { ...base.daily, ...(isObject(saved.daily) ? saved.daily : {}) },
    stats: { ...base.stats, ...(isObject(saved.stats) ? saved.stats : {}) },
    history: isObject(saved.history) ? saved.history : {},
    lessons: isObject(saved.lessons) ? saved.lessons : {},
    reviews: isObject(saved.reviews) ? saved.reviews : {},
    words: isObject(saved.words) ? saved.words : {},
    achievements: isObject(saved.achievements) ? saved.achievements : {},
  };
  state.version = STATE_VERSION;
  ensureDaily(state, now);
  return state;
}

export function loadState(storage, now = new Date()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return defaultState(now);
    return hydrateState(JSON.parse(raw), now);
  } catch {
    return defaultState(now);
  }
}

export function saveState(state, storage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Reset the daily counter and tick the heart timer. Mutates state. */
export function ensureDaily(state, now = new Date()) {
  const today = dateKey(now);
  if (!state.daily || state.daily.date !== today) {
    state.daily = { date: today, xp: 0, lessons: 0 };
  }
  refreshHearts(state, now);
  return state;
}

export function refreshHearts(state, now = new Date()) {
  if (state.profile.unlimitedHearts) {
    state.hearts = HEARTS_MAX;
    state.heartsAt = now.toISOString();
    return state;
  }
  if (state.hearts >= HEARTS_MAX) {
    state.hearts = HEARTS_MAX;
    state.heartsAt = now.toISOString();
    return state;
  }
  const last = new Date(state.heartsAt || now.toISOString()).getTime();
  const elapsed = Math.max(0, now.getTime() - last);
  const gained = Math.floor(elapsed / HEART_REFILL_MS);
  if (gained > 0) {
    state.hearts = Math.min(HEARTS_MAX, state.hearts + gained);
    state.heartsAt = new Date(last + gained * HEART_REFILL_MS).toISOString();
    if (state.hearts >= HEARTS_MAX) state.heartsAt = now.toISOString();
  }
  return state;
}

/** Returns true when this mistake left the learner with zero hearts. */
export function loseHeart(state, now = new Date()) {
  if (state.profile.unlimitedHearts) return false;
  refreshHearts(state, now);
  if (state.hearts <= 0) return true;
  if (state.hearts === HEARTS_MAX) state.heartsAt = now.toISOString();
  state.hearts -= 1;
  return state.hearts === 0;
}

export function nextHeartInMs(state, now = new Date()) {
  if (state.profile.unlimitedHearts || state.hearts >= HEARTS_MAX) return 0;
  refreshHearts(state, now);
  if (state.hearts >= HEARTS_MAX) return 0;
  const last = new Date(state.heartsAt || now.toISOString()).getTime();
  return Math.max(0, last + HEART_REFILL_MS - now.getTime());
}

export function refillHearts(state, now = new Date()) {
  state.hearts = HEARTS_MAX;
  state.heartsAt = now.toISOString();
  return state;
}

/** Add a day to the streak, consuming a freeze if exactly one day was missed. */
export function touchStreak(state, now = new Date()) {
  const today = dateKey(now);
  if (state.lastActiveDate === today) {
    return { incremented: false, usedFreeze: false, streak: state.streak };
  }
  let usedFreeze = false;
  if (!state.lastActiveDate) {
    state.streak = 1;
  } else {
    const gap = daysBetween(state.lastActiveDate, today);
    if (gap === 1) {
      state.streak += 1;
    } else if (gap === 2 && state.freezes > 0) {
      state.freezes -= 1;
      usedFreeze = true;
      state.streak += 1;
    } else {
      state.streak = 1;
    }
  }
  state.lastActiveDate = today;
  state.longestStreak = Math.max(state.longestStreak || 0, state.streak);
  return { incremented: true, usedFreeze, streak: state.streak };
}

export function streakStatus(state, now = new Date()) {
  const today = dateKey(now);
  if (state.lastActiveDate === today) return { activeToday: true, atRisk: false };
  if (state.lastActiveDate && daysBetween(state.lastActiveDate, today) === 1) {
    return { activeToday: false, atRisk: true };
  }
  return { activeToday: false, atRisk: state.streak > 0 };
}

export function levelInfo(xp) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (xp >= LEVELS[i].min) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next ? clamp((xp - current.min) / (next.min - current.min), 0, 1) : 1;
  return {
    level: index + 1,
    title: current.title,
    min: current.min,
    next: next?.min ?? null,
    progress,
    toNext: next ? Math.max(0, next.min - xp) : 0,
  };
}

export function ensureWord(state, wordId, today = dateKey()) {
  if (!state.words[wordId]) {
    state.words[wordId] = {
      ease: 2.5,
      interval: 0,
      reps: 0,
      lapses: 0,
      due: today,
      seen: 0,
      correct: 0,
      wrong: 0,
      last: null,
    };
  }
  return state.words[wordId];
}

/**
 * SM-2 inspired scheduler.
 * quality: 1 = wrong, 3 = right after a retry, 5 = right first time.
 */
export function reviewWord(state, wordId, quality, today = dateKey()) {
  const word = ensureWord(state, wordId, today);
  word.seen += 1;
  if (quality >= 3) word.correct += 1;
  else word.wrong += 1;
  word.last = today;

  if (quality < 3) {
    word.reps = 0;
    word.interval = 1;
    word.lapses += 1;
    word.ease = Math.max(1.3, word.ease - 0.2);
    word.due = addDays(today, 1);
    return word;
  }

  if (word.reps === 0) word.interval = 1;
  else if (word.reps === 1) word.interval = 3;
  else word.interval = Math.max(1, Math.round(word.interval * word.ease));
  word.reps += 1;
  word.ease = clamp(word.ease + 0.06, 1.3, 3.0);
  word.due = addDays(today, word.interval);
  return word;
}

export function wordMastery(state, wordId) {
  const word = state.words[wordId];
  if (!word || !word.seen) return 0;
  if (word.interval >= 21) return 3;
  if (word.reps >= 2) return 2;
  return 1;
}

export function dueWords(state, today = dateKey()) {
  return Object.entries(state.words)
    .filter(([, word]) => word.seen > 0 && word.due <= today)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : 0))
    .map(([id]) => id);
}

export function weakWords(state) {
  return Object.entries(state.words)
    .filter(([, word]) => word.seen > 0 && (word.wrong > 0 || word.reps === 0))
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .map(([id]) => id);
}

export function studiedWords(state) {
  return Object.keys(state.words).filter((id) => state.words[id].seen > 0);
}

export function unlockAchievements(state, now = new Date()) {
  const seenWords = studiedWords(state).length;
  const completed = Object.values(state.lessons).filter((lesson) => lesson.completed);
  const perfect = completed.filter((lesson) => lesson.stars === 3).length;
  const unlocked = [];
  const tests = {
    first_lesson: completed.length >= 1,
    streak_3: state.streak >= 3,
    streak_7: state.streak >= 7,
    words_25: seenWords >= 25,
    words_75: seenWords >= 75,
    perfect_5: perfect >= 5,
    lessons_10: completed.length >= 10,
    xp_100: state.xp >= 100,
    tone_20: (state.stats.toneCorrect || 0) >= 20,
  };
  for (const achievement of ACHIEVEMENTS) {
    if (tests[achievement.id] && !state.achievements[achievement.id]) {
      state.achievements[achievement.id] = now.toISOString();
      unlocked.push(achievement);
    }
  }
  return unlocked;
}

export function starsForAccuracy(accuracy) {
  if (accuracy >= 0.999) return 3;
  if (accuracy >= 0.8) return 2;
  return 1;
}

/**
 * Apply a completed session to state.
 *
 * session = {
 *   mode, lessonId, wordResults: { [wordId]: { correct, wrong, toneCorrect } },
 *   answered, correct, durationMs
 * }
 */
export function applySession(state, session, now = new Date()) {
  ensureDaily(state, now);
  const today = dateKey(now);
  const answered = Math.max(0, session.answered || 0);
  const correct = Math.max(0, Math.min(answered, session.correct || 0));
  const accuracy = answered ? correct / answered : 1;
  const mode = session.mode || 'lesson';
  const base = XP_BY_MODE[mode] ?? 5;
  let bonus = 0;
  if (answered >= 5 && accuracy === 1) bonus += 5;
  else if (accuracy >= 0.8) bonus += 3;
  const xp = base + bonus;
  const gems = (mode === 'lesson' ? 3 : 2) + (accuracy === 1 ? 2 : 0);
  const levelBefore = levelInfo(state.xp);
  const goalBefore = state.daily.xp >= state.profile.dailyGoalXp;

  state.xp += xp;
  state.gems += gems;
  state.daily.xp += xp;
  state.history[today] = (state.history[today] || 0) + xp;
  if (mode === 'lesson') state.daily.lessons += 1;
  state.stats.answered += answered;
  state.stats.correct += correct;
  state.stats.sessions += 1;
  state.stats.minutes += Math.max(0, Math.round((session.durationMs || 0) / 60000));
  state.stats.toneCorrect = (state.stats.toneCorrect || 0) + Math.max(0, session.toneCorrect || 0);

  for (const [wordId, result] of Object.entries(session.wordResults || {})) {
    if (!result || (!result.correct && !result.wrong)) continue;
    const quality = result.wrong === 0 && result.correct > 0 ? 5 : result.correct > 0 ? 3 : 1;
    reviewWord(state, wordId, quality, today);
  }

  if (session.reviewUnitId) {
    const previous = state.reviews[session.reviewUnitId];
    state.reviews[session.reviewUnitId] = {
      completed: true,
      at: now.toISOString(),
      bestAccuracy: Math.max(accuracy, previous?.bestAccuracy || 0),
      attempts: (previous?.attempts || 0) + 1,
    };
  }

  let stars = null;
  if (mode === 'lesson' && session.lessonId) {
    stars = starsForAccuracy(accuracy);
    const previous = state.lessons[session.lessonId];
    state.lessons[session.lessonId] = {
      completed: true,
      stars: Math.max(stars, previous?.stars || 0),
      bestAccuracy: Math.max(accuracy, previous?.bestAccuracy || 0),
      attempts: (previous?.attempts || 0) + 1,
      at: now.toISOString(),
    };
  }

  const streakResult = touchStreak(state, now);
  const newAchievements = unlockAchievements(state, now);
  const levelAfter = levelInfo(state.xp);
  const goalAfter = state.daily.xp >= state.profile.dailyGoalXp;

  return {
    xp,
    gems,
    accuracy,
    stars,
    mode,
    streak: state.streak,
    streakIncreased: streakResult.incremented,
    usedFreeze: streakResult.usedFreeze,
    newAchievements,
    leveledUp: levelAfter.level > levelBefore.level,
    level: levelAfter,
    dailyGoalMet: goalAfter && !goalBefore,
    dailyXp: state.daily.xp,
    dailyGoalXp: state.profile.dailyGoalXp,
  };
}

export function lessonUnlocked(state, lessonId, lessonOrder) {
  const index = lessonOrder.indexOf(lessonId);
  if (index <= 0) return true;
  const previous = lessonOrder[index - 1];
  return Boolean(state.lessons[previous]?.completed);
}

export function nextLessonId(state, lessonOrder) {
  for (const id of lessonOrder) {
    if (!state.lessons[id]?.completed) return id;
  }
  return lessonOrder[lessonOrder.length - 1] || null;
}

export function unitProgress(state, unit) {
  const total = unit.lessons.length;
  const done = unit.lessons.filter((lesson) => state.lessons[lesson.id]?.completed).length;
  const stars = unit.lessons.reduce((sum, lesson) => sum + (state.lessons[lesson.id]?.stars || 0), 0);
  return { done, total, stars, maxStars: total * 3, complete: done === total };
}

export function purchase(state, itemId, now = new Date()) {
  if (itemId === 'freeze') {
    if (state.freezes >= STREAK_FREEZE_MAX) return { ok: false, reason: 'max' };
    if (state.gems < STREAK_FREEZE_COST) return { ok: false, reason: 'gems' };
    state.gems -= STREAK_FREEZE_COST;
    state.freezes += 1;
    return { ok: true };
  }
  if (itemId === 'hearts') {
    refreshHearts(state, now);
    if (state.hearts >= HEARTS_MAX) return { ok: false, reason: 'full' };
    if (state.gems < HEART_REFILL_COST) return { ok: false, reason: 'gems' };
    state.gems -= HEART_REFILL_COST;
    refillHearts(state, now);
    return { ok: true };
  }
  return { ok: false, reason: 'unknown' };
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
