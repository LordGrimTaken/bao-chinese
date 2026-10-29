import assert from 'node:assert/strict';
import {
  WORDS,
  WORD_LIST,
  WORD_BY_ZH,
  ALL_WORDS,
  BONUS_WORDS,
  UNITS,
  LESSONS,
  TOTAL_WORDS,
  TOTAL_LESSONS,
  COURSE,
} from '../src/data/course.js';

import { toMarks, tonesOf } from '../src/js/pinyin.js';

const PUNCT = new Set(['，', '。', '！', '？', '、', '；', '：']);
const PY_RE = /^[A-Za-züÜ]+[1-5](?:r)?(?: [A-Za-züÜ]+[1-5](?:r)?)*$/;

const errors = [];
const fail = (msg) => errors.push(msg);

// Words
const zhSeen = new Map();
for (const word of WORD_LIST) {
  if (!PY_RE.test(word.py)) fail(`bad pinyin: ${word.id} (${word.py})`);
  if (/\d/.test(toMarks(word.py))) fail(`tone marks still have digits: ${word.id}`);
  if (!word.en || !word.zh) fail(`missing text: ${word.id}`);
  if (zhSeen.has(word.zh)) fail(`duplicate hanzi: ${word.zh} (${word.id} / ${zhSeen.get(word.zh)})`);
  zhSeen.set(word.zh, word.id);
  if (word.zh.length === 1 && tonesOf(word.py).length !== 1) fail(`single char with multiple syllables: ${word.id}`);
}

// Units / lessons
const introduced = new Map();
let sentenceCount = 0;
for (const lesson of LESSONS) {
  if (lesson.words.length < 4) fail(`${lesson.id} has too few words`);
  if (lesson.sentences.length < 3) fail(`${lesson.id} has too few sentences`);
  for (const id of lesson.words) {
    if (!WORDS[id]) fail(`${lesson.id} references missing word ${id}`);
    if (introduced.has(id)) fail(`word ${id} introduced twice (${introduced.get(id)} / ${lesson.id})`);
    introduced.set(id, lesson.id);
  }
  const lessonText = lesson.sentences.map((sentence) => sentence.zh).join('');
  for (const id of lesson.words) {
    const word = WORDS[id];
    if (word && !word.hidden && !lessonText.includes(word.zh)) {
      fail(`${lesson.id}: word ${id} (${word.zh}) never appears in a sentence`);
    }
  }
  for (const sentence of lesson.sentences) {
    sentenceCount++;
    for (const token of sentence.tokens) {
      if (PUNCT.has(token)) continue;
      if (!WORD_BY_ZH.has(token)) fail(`${sentence.id}: token "${token}" is not a dictionary word`);
    }
    if (sentence.zh !== sentence.tokens.join('')) fail(`${sentence.id}: zh mismatch`);
    if (!sentence.pinyin || /\d/.test(sentence.pinyin)) fail(`${sentence.id}: bad generated pinyin "${sentence.pinyin}"`);
    if (!sentence.en) fail(`${sentence.id}: missing translation`);
  }
}

if (TOTAL_LESSONS !== 24) fail(`expected 24 lessons, got ${TOTAL_LESSONS}`);
if (TOTAL_WORDS !== 151) fail(`expected 151 course words, got ${TOTAL_WORDS}`);
if (BONUS_WORDS.length !== 163) fail(`expected 163 HSK bonus words, got ${BONUS_WORDS.length}`);

// Complete HSK 1 vocabulary deck
const bonusIds = new Set();
for (const word of BONUS_WORDS) {
  if (bonusIds.has(word.id)) fail(`duplicate bonus id: ${word.id}`);
  bonusIds.add(word.id);
  if (!PY_RE.test(word.py)) fail(`bad bonus pinyin: ${word.id} (${word.py})`);
  if (/\d/.test(word.pinyin)) fail(`bonus tone marks still have digits: ${word.id}`);
  if (WORD_BY_ZH.has(word.zh)) fail(`bonus word duplicates course word: ${word.zh}`);
  if (!word.en) fail(`bonus word missing meaning: ${word.id}`);
}
if (ALL_WORDS.length !== 314) fail(`expected 314 dictionary words, got ${ALL_WORDS.length}`);

if (errors.length) {
  console.error(`✗ ${errors.length} content error(s):`);
  for (const error of errors) console.error('  - ' + error);
  process.exit(1);
}

const sentenceWordCount = new Set(COURSE.sentences.flatMap((s) => s.tokens.filter((t) => WORD_BY_ZH.has(t))));
console.log(
  `✓ content valid: ${UNITS.length} units, ${TOTAL_LESSONS} lessons, ${TOTAL_WORDS} course words + ${BONUS_WORDS.length} HSK 1 deck words (${ALL_WORDS.length} dictionary entries), ${sentenceCount} sentences`
);
console.log(`  distinct words used in sentences: ${sentenceWordCount.size}`);
console.log(`  sample: ${COURSE.sentences[0].zh} — ${COURSE.sentences[0].pinyin} — ${COURSE.sentences[0].en}`);
