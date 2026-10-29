import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  applySession,
  dateKey,
  defaultState,
  dueWords,
  hydrateState,
  levelInfo,
  loseHeart,
  nextHeartInMs,
  purchase,
  refreshHearts,
  reviewWord,
  streakStatus,
  touchStreak,
  wordMastery,
  HEART_REFILL_MS,
  HEARTS_MAX,
} from '../src/js/core.js';

const day = (offset) => {
  const date = new Date(2026, 9, 29, 10, 0, 0); // 2026-10-29 local
  date.setDate(date.getDate() + offset);
  return date;
};

test('default state starts clean and ready to learn', () => {
  const state = defaultState(day(0));
  assert.equal(state.hearts, HEARTS_MAX);
  assert.equal(state.streak, 0);
  assert.equal(state.daily.date, '2026-10-29');
  assert.equal(state.profile.onboarded, false);
});

test('hydrate keeps saved progress and adds new fields', () => {
  const saved = {
    version: 1,
    xp: 42,
    profile: { name: 'Austin', onboarded: true },
    lessons: { u1l1: { completed: true, stars: 3 } },
  };
  const state = hydrateState(saved, day(0));
  assert.equal(state.xp, 42);
  assert.equal(state.profile.name, 'Austin');
  assert.equal(state.profile.dailyGoalXp, 30);
  assert.equal(state.lessons.u1l1.stars, 3);
});

test('hearts refill one every 15 minutes and stop at max', () => {
  const state = defaultState(day(0));
  loseHeart(state, day(0));
  loseHeart(state, day(0));
  assert.equal(state.hearts, 3);
  refreshHearts(state, new Date(day(0).getTime() + HEART_REFILL_MS));
  assert.equal(state.hearts, 4);
  refreshHearts(state, new Date(day(0).getTime() + HEART_REFILL_MS * 10));
  assert.equal(state.hearts, HEARTS_MAX);
  assert.equal(nextHeartInMs(state, day(0)), 0);
});

test('streak increments on consecutive days', () => {
  const state = defaultState(day(0));
  touchStreak(state, day(0));
  touchStreak(state, day(1));
  touchStreak(state, day(2));
  assert.equal(state.streak, 3);
  assert.equal(state.longestStreak, 3);
  const result = touchStreak(state, day(2));
  assert.equal(result.incremented, false);
  assert.equal(state.streak, 3);
});

test('a single missed day consumes a streak freeze', () => {
  const state = defaultState(day(0));
  touchStreak(state, day(0));
  touchStreak(state, day(1));
  const before = state.freezes;
  touchStreak(state, day(3)); // missed day 2
  assert.equal(state.freezes, before - 1);
  assert.equal(state.streak, 3);
});

test('a longer gap resets the streak', () => {
  const state = defaultState(day(0));
  touchStreak(state, day(0));
  touchStreak(state, day(1));
  state.freezes = 0;
  touchStreak(state, day(4));
  assert.equal(state.streak, 1);
});

test('streak status flags a streak at risk', () => {
  const state = defaultState(day(0));
  touchStreak(state, day(0));
  assert.equal(streakStatus(state, day(0)).activeToday, true);
  assert.equal(streakStatus(state, day(1)).atRisk, true);
});

test('SM-2 style intervals grow then reset after a lapse', () => {
  const state = defaultState(day(0));
  const today = '2026-10-29';
  reviewWord(state, 'nihao', 5, today);
  assert.equal(state.words.nihao.interval, 1);
  assert.equal(state.words.nihao.due, addDays(today, 1));
  reviewWord(state, 'nihao', 5, addDays(today, 1));
  assert.equal(state.words.nihao.interval, 3);
  reviewWord(state, 'nihao', 5, addDays(today, 4));
  assert.ok(state.words.nihao.interval >= 7);
  const mastered = wordMastery(state, 'nihao');
  assert.ok(mastered >= 2);
  reviewWord(state, 'nihao', 1, addDays(today, 5));
  assert.equal(state.words.nihao.interval, 1);
  assert.equal(state.words.nihao.reps, 0);
  assert.equal(state.words.nihao.lapses, 1);
});

test('due words are returned oldest first', () => {
  const state = defaultState(day(0));
  reviewWord(state, 'nihao', 5, '2026-10-20');
  reviewWord(state, 'xiexie', 5, '2026-10-25');
  const due = dueWords(state, '2026-10-29');
  assert.deepEqual(due, ['nihao', 'xiexie']);
});

test('a perfect lesson awards XP, stars, gems, and the streak', () => {
  const state = defaultState(day(0));
  const result = applySession(
    state,
    {
      mode: 'lesson',
      lessonId: 'u1l1',
      answered: 10,
      correct: 10,
      wordResults: { nihao: { correct: 2, wrong: 0 }, wo: { correct: 1, wrong: 0 } },
      durationMs: 4 * 60 * 1000,
    },
    day(0)
  );
  assert.equal(result.accuracy, 1);
  assert.equal(result.stars, 3);
  assert.equal(result.xp, 15);
  assert.equal(result.gems, 5);
  assert.equal(state.streak, 1);
  assert.equal(state.daily.xp, 15);
  assert.equal(state.daily.lessons, 1);
  assert.ok(state.words.nihao.reps >= 1);
});

test('a weaker lesson earns fewer stars and no perfect bonus', () => {
  const state = defaultState(day(0));
  const result = applySession(
    state,
    { mode: 'lesson', lessonId: 'u1l2', answered: 10, correct: 7, wordResults: {} },
    day(0)
  );
  assert.equal(result.stars, 1);
  assert.equal(result.xp, 10);
});

test('daily goal flag only fires when the goal is crossed', () => {
  const state = defaultState(day(0));
  state.profile.dailyGoalXp = 15;
  const first = applySession(
    state,
    { mode: 'lesson', lessonId: 'u1l1', answered: 5, correct: 5, wordResults: {} },
    day(0)
  );
  assert.equal(first.dailyGoalMet, true);
  const second = applySession(
    state,
    { mode: 'lesson', lessonId: 'u1l2', answered: 5, correct: 5, wordResults: {} },
    day(0)
  );
  assert.equal(second.dailyGoalMet, false);
});

test('level thresholds and progress are computed from XP', () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(99).level, 1);
  assert.equal(levelInfo(100).level, 2);
  assert.equal(levelInfo(250).level, 3);
  assert.ok(levelInfo(170).progress > 0 && levelInfo(170).progress < 1);
});

test('purchases enforce gems, caps, and full hearts', () => {
  const state = defaultState(day(0));
  state.gems = 100;
  state.hearts = 2;
  const hearts = purchase(state, 'hearts', day(0));
  assert.equal(hearts.ok, true);
  assert.equal(state.hearts, HEARTS_MAX);
  assert.equal(state.gems, 0);
  const broke = purchase(state, 'freeze', day(0));
  assert.equal(broke.ok, false);
  assert.equal(broke.reason, 'gems');
});

test('date helpers use local calendar days', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(dateKey(new Date(2026, 9, 29, 23, 59)), '2026-10-29');
});
