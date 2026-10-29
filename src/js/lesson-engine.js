/**
 * Exercise generator. Pure functions: given course data and a seed, produce a
 * deterministic list of steps. The UI only has to render and grade them.
 */

import { DRILL_WORDS, SENTENCES, WORD_BY_ID, WORD_BY_ZH } from '../data/course.js';
import { TONE_PAIRS } from '../data/tone-pairs.js';

export const PUNCTUATION = new Set(['，', '。', '！', '？', '、', '；', '：']);

export function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/** Pick plausible wrong answers, preferring the same part of speech. */
export function distractors(target, pool, count, random, optionKey = (word) => word.zh) {
  const targetValue = optionKey(target);
  const candidates = uniqueBy(
    pool.filter((word) => word.id !== target.id && optionKey(word) !== targetValue && !word.hidden),
    optionKey
  );
  const samePos = candidates.filter((word) => word.pos === target.pos);
  const sameShape = samePos.filter((word) => word.zh.length === target.zh.length);
  const rest = candidates.filter((word) => !samePos.includes(word));
  const picked = [];
  const take = (list) => {
    for (const word of shuffle(list, random)) {
      if (picked.length >= count) return;
      if (!picked.some((item) => optionKey(item) === optionKey(word))) picked.push(word);
    }
  };
  take(sameShape);
  take(samePos);
  take(rest);
  return picked.slice(0, count);
}

function optionList(target, pool, random, key, count = 4) {
  const wrong = distractors(target, pool, count - 1, random, key);
  return shuffle([target, ...wrong], random).map((word) => ({
    value: key(word),
    label: key(word),
    id: word.id,
  }));
}

function contentTokens(sentence) {
  return sentence.tokens.filter((token) => !PUNCTUATION.has(token));
}

function sentenceForWord(wordId, pool = SENTENCES) {
  return pool.find((sentence) =>
    sentence.tokens.some((token) => WORD_BY_ZH.get(token)?.id === wordId)
  );
}

function makeWordStep(type, word, pool, random) {
  if (type === 'meaning') {
    return {
      type,
      wordId: word.id,
      prompt: word.zh,
      pinyin: word.pinyin ?? null,
      answer: word.en,
      options: shuffle(
        [
          { value: word.en, label: word.en, id: word.id },
          ...distractors(word, pool, 3, random, (item) => item.en).map((item) => ({
            value: item.en,
            label: item.en,
            id: item.id,
          })),
        ],
        random
      ),
      audioText: word.zh,
    };
  }
  if (type === 'hanzi') {
    return {
      type,
      wordId: word.id,
      prompt: word.en,
      pinyin: null,
      answer: word.zh,
      options: optionList(word, pool, random, (item) => item.zh),
      audioText: null,
    };
  }
  if (type === 'audio') {
    return {
      type,
      wordId: word.id,
      prompt: 'Listen and choose what you hear',
      pinyin: null,
      answer: word.zh,
      options: optionList(word, pool, random, (item) => item.zh),
      audioText: word.zh,
      autoPlay: true,
    };
  }
  if (type === 'tone') {
    const tone = word.tones?.[0] || null;
    if (!tone || tone === 5 || word.tones.length !== 1) return null;
    return {
      type,
      wordId: word.id,
      prompt: word.zh,
      pinyin: null,
      answer: tone,
      options: [1, 2, 3, 4].map((value) => ({
        value,
        label: `${value}${value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th'}`,
      })),
      audioText: word.zh,
      autoPlay: true,
    };
  }
  return null;
}

function makeMatchStep(words, random) {
  const chosen = shuffle(words, random).slice(0, 4);
  return {
    type: 'match',
    pairs: chosen.map((word) => ({ wordId: word.id, zh: word.zh, en: word.en })),
  };
}

function makeBuildStep(sentence, pool, random, index) {
  const answer = contentTokens(sentence);
  if (answer.length < 2 || answer.length > 8) return null;
  const answerSet = new Set(answer);
  const candidates = uniqueBy(
    pool.filter((word) => !answerSet.has(word.zh) && !word.hidden),
    (word) => word.zh
  );
  const extras = shuffle(candidates, random)
    .slice(0, answer.length <= 3 ? 3 : 2)
    .map((word) => word.zh);
  const bank = shuffle(
    [
      ...answer.map((text, i) => ({ key: `a${i}`, text })),
      ...extras.map((text, i) => ({ key: `x${i}`, text })),
    ],
    random
  );
  return {
    type: 'build',
    id: `build-${index}`,
    sentenceId: sentence.id,
    wordId: WORD_BY_ZH.get(answer[0])?.id || null,
    prompt: sentence.en,
    answer,
    bank,
    punctuation: sentence.tokens.filter((token) => PUNCTUATION.has(token)).join(''),
  };
}

function makeFillStep(sentence, target, pool, random, index) {
  const tokens = sentence.tokens;
  const blankIndex = tokens.findIndex((token) => token === target.zh);
  if (blankIndex < 0) return null;
  const options = optionList(target, pool, random, (item) => item.zh);
  if (options.length < 3) return null;
  return {
    type: 'fill',
    id: `fill-${index}`,
    sentenceId: sentence.id,
    wordId: target.id,
    prompt: sentence.en,
    parts: tokens.map((text, i) => ({ text, blank: i === blankIndex })),
    answer: target.zh,
    options,
    audioText: sentence.zh,
  };
}

function makeTraceStep(word) {
  return {
    type: 'trace',
    wordId: word.id,
    char: [...word.zh][0],
    prompt: 'Trace the character',
    pinyin: word.pinyin,
    en: word.en,
    answer: word.zh,
    options: [],
  };
}

function finalize(steps) {
  return steps.filter(Boolean).map((step, index) => ({ ...step, id: step.id || `step-${index}` }));
}

/**
 * Build a normal lesson.
 * @param {object} lesson enriched lesson from course.js
 * @param {object} options { seed, mode, pool }
 */
export function buildLessonSession(lesson, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const random = mulberry32(hashString(`${lesson.id}:${options.seed || 'v1'}`));
  const words = lesson.words.map((id) => WORD_BY_ID.get(id)).filter(Boolean);
  const steps = [];

  for (const word of words) steps.push({ type: 'intro', wordId: word.id });

  const drillTypes = ['meaning', 'hanzi', 'audio'];
  const drills = [];
  words.forEach((word, index) => {
    const type = drillTypes[index % drillTypes.length];
    drills.push(makeWordStep(type, word, pool, random));
    if (index === 0 && word.tones?.length === 1 && word.tones[0] !== 5) {
      drills.push(makeWordStep('tone', word, pool, random));
    }
  });
  steps.push(...shuffle(drills, random));

  if (words.length >= 4) steps.push(makeMatchStep(words, random));

  const buildable = lesson.sentences.filter((sentence) => {
    const count = contentTokens(sentence).length;
    return count >= 2 && count <= 8;
  });
  const buildSentences = shuffle(buildable, random).slice(0, 2);
  buildSentences.forEach((sentence, index) => {
    steps.push(makeBuildStep(sentence, pool, random, index));
  });

  const usedSentences = new Set(buildSentences.map((sentence) => sentence.id));
  const fillCandidates = lesson.sentences.filter((sentence) => !usedSentences.has(sentence.id));
  let fillPair = null;
  for (const word of words) {
    const sentence = fillCandidates.find(
      (item) => contentTokens(item).length >= 3 && item.tokens.includes(word.zh)
    );
    if (sentence) {
      fillPair = { word, sentence };
      break;
    }
  }
  if (fillPair) {
    steps.push(makeFillStep(fillPair.sentence, fillPair.word, pool, random, 0));
  }

  if (words[0]) steps.push(makeTraceStep(words[0]));

  return {
    mode: 'lesson',
    lessonId: lesson.id,
    title: lesson.title,
    subtitle: lesson.kicker,
    unitId: lesson.unitId,
    steps: finalize(steps),
  };
}

/** Build a spaced-repetition review from a list of word ids. */
export function buildReviewSession(wordIds, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const wordMap = options.wordMap || WORD_BY_ID;
  const random = mulberry32(hashString(`review:${options.seed || wordIds.join(',')}`));
  const words = wordIds.map((id) => wordMap.get(id)).filter(Boolean);
  const selected = shuffle(words, random).slice(0, options.limit || 10);
  const steps = [];
  const types = ['meaning', 'audio', 'hanzi'];
  selected.forEach((word, index) => {
    steps.push(makeWordStep(types[index % types.length], word, pool, random));
    if (index === 2 && selected.length >= 4) steps.push(makeMatchStep(selected, random));
    if (index === 5 && selected.length >= 8) steps.push(makeMatchStep(selected.slice(4), random));
  });
  // One sentence-level retrieval if we can find a sentence using a reviewed word.
  for (const word of selected) {
    const sentence = sentenceForWord(word.id, options.sentences || SENTENCES);
    if (sentence) {
      const step = makeBuildStep(sentence, pool, random, 0);
      if (step) {
        steps.push(step);
        break;
      }
    }
  }
  return {
    mode: 'review',
    title: 'Review',
    subtitle: 'Make it stick',
    steps: finalize(steps),
  };
}

/** Tone-only drill. */
export function buildToneSession(wordIds, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const wordMap = options.wordMap || WORD_BY_ID;
  const random = mulberry32(hashString(`tone:${options.seed || 'tone'}`));
  const candidates = (wordIds?.length ? wordIds : pool.map((word) => word.id))
    .map((id) => wordMap.get(id))
    .filter((word) => word && word.tones?.length === 1 && word.tones[0] !== 5);
  const words = shuffle(candidates, random).slice(0, options.limit || 10);
  const steps = words.map((word) => makeWordStep('tone', word, pool, random));
  return {
    mode: 'tone',
    title: 'Tone gym',
    subtitle: 'Train your ear',
    steps: finalize(steps),
  };
}

/**
 * Minimal-pair tone gym. A random word from each set is played; the learner
 * chooses the meaning/tone. The pinyin and character are revealed only after
 * answering, so the task is genuinely audio-first.
 */
export function buildTonePairSession(options = {}) {
  const random = mulberry32(hashString(`tone-pairs:${options.seed || 'v1'}`));
  const sets = shuffle(TONE_PAIRS, random).slice(0, options.limit || 8);
  const ordinal = (tone) => `${tone}${tone === 1 ? 'st' : tone === 2 ? 'nd' : tone === 3 ? 'rd' : 'th'} tone`;
  const steps = sets.map((toneSet) => {
    const target = toneSet.words[Math.floor(random() * toneSet.words.length)];
    return {
      type: 'tone-word',
      id: `tone-set-${toneSet.id}`,
      prompt: 'Which word did you hear?',
      syllable: toneSet.syllable,
      answer: target.zh,
      target: { ...target },
      audioText: target.zh,
      autoPlay: true,
      options: shuffle(toneSet.words, random).map((word) => ({
        value: word.zh,
        label: ordinal(word.tone),
        sub: word.en,
        tone: word.tone,
        pinyin: word.pinyin,
        id: word.id,
      })),
    };
  });
  return {
    mode: 'tone',
    title: 'Tone pairs',
    subtitle: 'Hear the difference',
    steps: finalize(steps),
  };
}

/** Listening-only drill. */
export function buildListeningSession(wordIds, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const wordMap = options.wordMap || WORD_BY_ID;
  const random = mulberry32(hashString(`listening:${options.seed || 'listen'}`));
  const candidates = (wordIds?.length ? wordIds : pool.map((word) => word.id))
    .map((id) => wordMap.get(id))
    .filter(Boolean);
  const words = shuffle(candidates, random).slice(0, options.limit || 10);
  const steps = words.map((word) => makeWordStep('audio', word, pool, random));
  return {
    mode: 'listening',
    title: 'Listening',
    subtitle: 'Catch every word',
    steps: finalize(steps),
  };
}

/** Character tracing drill. */
export function buildTraceSession(wordIds, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const wordMap = options.wordMap || WORD_BY_ID;
  const random = mulberry32(hashString(`trace:${options.seed || 'trace'}`));
  const candidates = (wordIds?.length ? wordIds : pool.map((word) => word.id))
    .map((id) => wordMap.get(id))
    .filter(Boolean);
  const words = shuffle(candidates, random).slice(0, options.limit || 8);
  return {
    mode: 'trace',
    title: 'Character tracing',
    subtitle: 'Build muscle memory',
    steps: finalize(words.map((word) => makeTraceStep(word))),
  };
}

/** A one-word confidence check from the dictionary sheet. */
export function buildWordSession(word, options = {}) {
  const pool = options.pool || DRILL_WORDS;
  const random = mulberry32(hashString(`word:${word.id}`));
  const steps = [
    makeWordStep('meaning', word, pool, random),
    makeWordStep('audio', word, pool, random),
    makeTraceStep(word),
  ];
  return {
    mode: 'word',
    title: word.zh,
    subtitle: word.en,
    steps: finalize(steps),
  };
}
