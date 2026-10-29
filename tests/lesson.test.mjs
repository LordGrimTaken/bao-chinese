import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_WORDS,
  ALL_WORD_BY_ID,
  BONUS_ONLY_WORDS,
  BONUS_WORDS,
  COURSE_WORDS,
  UNITS,
  LESSONS,
  WORD_LIST,
  WORD_BY_ZH,
  TOTAL_WORDS,
} from '../src/data/course.js';
import { TONE_PAIRS } from '../src/data/tone-pairs.js';
import { toMarks, tonesOf, plainPinyin } from '../src/js/pinyin.js';
import {
  buildLessonSession,
  buildListeningSession,
  buildReviewSession,
  buildTonePairSession,
  buildToneSession,
  buildTraceSession,
  buildWordSession,
  PUNCTUATION,
} from '../src/js/lesson-engine.js';

const DRILL_WORDS = WORD_LIST.filter((word) => !word.hidden);

test('pinyin conversion places tone marks correctly', () => {
  assert.equal(toMarks('ni3 hao3'), 'nǐ hǎo');
  assert.equal(toMarks('xie4 xie5'), 'xiè xie');
  assert.equal(toMarks('zhe4r'), 'zhèr');
  assert.equal(toMarks('yi1 dian3r'), 'yī diǎnr');
  assert.equal(toMarks('Zhong1 guo2'), 'Zhōng guó');
  assert.equal(toMarks('lv4'), 'lǜ');
  assert.equal(plainPinyin('nǐ hǎo'), 'ni hao');
  assert.deepEqual(tonesOf('ni3 hao3'), [3, 3]);
});

test('the course has the expected shape', () => {
  assert.equal(UNITS.length, 9);
  assert.equal(LESSONS.length, 27);
  assert.equal(TOTAL_WORDS, 151);
  assert.equal(COURSE_WORDS.length, 171);
  assert.equal(BONUS_WORDS.length, 163);
  assert.equal(BONUS_ONLY_WORDS.length, 143);
  assert.equal(ALL_WORDS.length, 314);
  assert.equal(new Set(LESSONS.map((lesson) => lesson.id)).size, LESSONS.length);
});

test('the remaining HSK 1 deck is valid and does not duplicate lesson words', () => {
  const courseHanzi = new Set(COURSE_WORDS.map((word) => word.zh));
  const ids = new Set();
  const hanzi = new Set();
  for (const word of BONUS_ONLY_WORDS) {
    assert.ok(!ids.has(word.id), `duplicate bonus id ${word.id}`);
    assert.ok(!hanzi.has(word.zh), `duplicate bonus hanzi ${word.zh}`);
    assert.ok(!courseHanzi.has(word.zh), `bonus word ${word.zh} duplicates the course`);
    ids.add(word.id);
    hanzi.add(word.zh);
    assert.ok(word.pinyin && !/\d/.test(word.pinyin));
    assert.ok(word.tones.length >= 1);
  }
  const session = buildReviewSession(
    BONUS_ONLY_WORDS.slice(0, 6).map((word) => word.id),
    { limit: 6, pool: ALL_WORDS, wordMap: ALL_WORD_BY_ID, seed: 'bonus' }
  );
  assert.ok(session.steps.length >= 4);
  for (const step of session.steps) {
    if (step.options?.length) {
      assert.ok(step.options.some((option) => option.value === step.answer));
    }
  }
});

test('every token in every sentence is a known word or punctuation', () => {
  for (const lesson of LESSONS) {
    for (const sentence of lesson.sentences) {
      for (const token of sentence.tokens) {
        if (PUNCTUATION.has(token)) continue;
        assert.ok(WORD_BY_ZH.has(token), `${sentence.id}: unknown token ${token}`);
      }
      assert.equal(sentence.zh, sentence.tokens.join(''));
      assert.ok(sentence.pinyin.length > 0);
    }
  }
});

test('lesson sessions contain every word and valid options', () => {
  for (const lesson of LESSONS) {
    const session = buildLessonSession(lesson, { seed: 'test' });
    assert.ok(session.steps.length >= 12, `${lesson.id} only has ${session.steps.length} steps`);
    assert.ok(session.steps.some((step) => step.type === 'intro'));
    assert.ok(session.steps.some((step) => step.type === 'build'));
    const drilled = new Set(
      session.steps.filter((step) => step.wordId && step.type !== 'intro').map((step) => step.wordId)
    );
    for (const wordId of lesson.words) {
      assert.ok(drilled.has(wordId), `${lesson.id}: ${wordId} is never drilled`);
    }
    for (const step of session.steps) {
      if (['meaning', 'hanzi', 'audio'].includes(step.type)) {
        assert.equal(step.options.length, 4);
        assert.ok(step.options.some((option) => option.value === step.answer));
        assert.equal(new Set(step.options.map((option) => option.value)).size, 4);
      }
      if (step.type === 'build') {
        assert.ok(step.answer.length >= 2);
        for (const token of step.answer) {
          assert.ok(step.bank.some((tile) => tile.text === token));
        }
        assert.equal(new Set(step.bank.map((tile) => tile.key)).size, step.bank.length);
      }
      if (step.type === 'fill') {
        assert.equal(step.parts.filter((part) => part.blank).length, 1);
        assert.ok(step.options.some((option) => option.value === step.answer));
      }
      if (step.type === 'match') {
        assert.equal(step.pairs.length, 4);
        assert.equal(new Set(step.pairs.map((pair) => pair.zh)).size, 4);
      }
      assert.ok(step.type);
    }
  }
});

test('lesson sessions are deterministic for a seed', () => {
  const lesson = LESSONS[0];
  const a = buildLessonSession(lesson, { seed: 'same' });
  const b = buildLessonSession(lesson, { seed: 'same' });
  assert.deepEqual(
    a.steps.map((step) => [step.type, step.wordId, step.answer]),
    b.steps.map((step) => [step.type, step.wordId, step.answer])
  );
  const c = buildLessonSession(lesson, { seed: 'different' });
  assert.notDeepEqual(
    a.steps.map((step) => step.wordId),
    c.steps.map((step) => step.wordId)
  );
});

test('distractors never include the answer', () => {
  for (const lesson of LESSONS) {
    const session = buildLessonSession(lesson, { seed: 'distractor' });
    for (const step of session.steps) {
      if (step.options?.length) {
        const values = step.options.map((option) => option.value);
        assert.ok(values.includes(step.answer));
      }
    }
  }
});

test('review, tone, listening, and trace sessions are populated', () => {
  const ids = DRILL_WORDS.slice(0, 12).map((word) => word.id);
  assert.ok(buildReviewSession(ids).steps.length >= 8);
  assert.ok(buildToneSession(ids).steps.length >= 4);
  assert.ok(buildListeningSession(ids).steps.length >= 4);
  assert.ok(buildTraceSession(ids).steps.length >= 4);
  const tone = buildToneSession(ids);
  for (const step of tone.steps) {
    assert.equal(step.type, 'tone');
    assert.ok([1, 2, 3, 4].includes(step.answer));
  }
});

test('tone-pair sets are four-way minimal pairs', () => {
  assert.ok(TONE_PAIRS.length >= 8);
  for (const set of TONE_PAIRS) {
    assert.equal(set.words.length, 4, `${set.id} should have four words`);
    assert.deepEqual(
      set.words.map((word) => word.tone).sort(),
      [1, 2, 3, 4],
      `${set.id} should cover all four tones`
    );
    for (const word of set.words) {
      assert.equal(tonesOf(word.py).length, 1);
      assert.equal(tonesOf(word.py)[0], word.tone);
      assert.ok(!/\d/.test(word.pinyin), `${word.pinyin} should be tone-marked`);
      assert.ok(word.zh && word.en);
    }
  }
});

test('tone-pair session is audio-first with one correct answer', () => {
  const session = buildTonePairSession({ limit: 8, seed: 'test' });
  assert.equal(session.mode, 'tone');
  assert.equal(session.steps.length, 8);
  for (const step of session.steps) {
    assert.equal(step.type, 'tone-word');
    assert.equal(step.options.length, 4);
    assert.ok(step.options.some((option) => option.value === step.answer));
    assert.equal(new Set(step.options.map((option) => option.value)).size, 4);
    assert.ok(step.target.zh && step.target.pinyin);
    assert.equal(step.audioText, step.target.zh);
  }
});

test('single-word practice has meaning, audio, and trace', () => {
  const word = DRILL_WORDS.find((item) => item.zh === '茶');
  const session = buildWordSession(word);
  assert.deepEqual(session.steps.map((step) => step.type), ['meaning', 'audio', 'trace']);
});

test('tone steps only use single-syllable words', () => {
  const session = buildToneSession(null, { limit: 50 });
  for (const step of session.steps) {
    const word = WORD_LIST.find((item) => item.id === step.wordId);
    assert.equal(word.tones.length, 1);
    assert.notEqual(word.tones[0], 5);
  }
});
