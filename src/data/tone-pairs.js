/**
 * Curated tone-pair sets for the Tone Pairs gym.
 *
 * Every set shares one syllable and covers tones 1–4. The data is deliberately
 * separate from the HSK course because these are ear-training minimal pairs,
 * not a vocabulary lesson. Native-speaker review is still required before a
 * paid release.
 */

import { toMarks } from '../js/pinyin.js';

const set = (syllable, title, words) => ({
  id: syllable,
  syllable,
  title,
  words: words.map(([tone, zh, py, en]) => ({
    id: `${syllable}-${tone}`,
    tone,
    zh,
    py,
    pinyin: toMarks(py),
    en,
  })),
});

export const TONE_PAIRS = [
  set('ma', 'ma', [
    [1, '妈', 'ma1', 'mother'],
    [2, '麻', 'ma2', 'hemp'],
    [3, '马', 'ma3', 'horse'],
    [4, '骂', 'ma4', 'to scold'],
  ]),
  set('tang', 'tang', [
    [1, '汤', 'tang1', 'soup'],
    [2, '糖', 'tang2', 'sugar'],
    [3, '躺', 'tang3', 'to lie down'],
    [4, '烫', 'tang4', 'hot to touch'],
  ]),
  set('shi', 'shi', [
    [1, '诗', 'shi1', 'poem'],
    [2, '十', 'shi2', 'ten'],
    [3, '史', 'shi3', 'history'],
    [4, '是', 'shi4', 'to be'],
  ]),
  set('yi', 'yi', [
    [1, '一', 'yi1', 'one'],
    [2, '姨', 'yi2', 'aunt'],
    [3, '椅', 'yi3', 'chair'],
    [4, '意', 'yi4', 'meaning'],
  ]),
  set('ba', 'ba', [
    [1, '八', 'ba1', 'eight'],
    [2, '拔', 'ba2', 'to pull'],
    [3, '把', 'ba3', 'handful; measure word'],
    [4, '爸', 'ba4', 'dad'],
  ]),
  set('da', 'da', [
    [1, '搭', 'da1', 'to build; to put up'],
    [2, '答', 'da2', 'to answer'],
    [3, '打', 'da3', 'to hit'],
    [4, '大', 'da4', 'big'],
  ]),
  set('shu', 'shu', [
    [1, '书', 'shu1', 'book'],
    [2, '熟', 'shu2', 'cooked; familiar'],
    [3, '鼠', 'shu3', 'mouse'],
    [4, '树', 'shu4', 'tree'],
  ]),
  set('ji', 'ji', [
    [1, '鸡', 'ji1', 'chicken'],
    [2, '急', 'ji2', 'anxious'],
    [3, '几', 'ji3', 'how many'],
    [4, '记', 'ji4', 'to remember'],
  ]),
  set('you', 'you', [
    [1, '优', 'you1', 'excellent'],
    [2, '油', 'you2', 'oil'],
    [3, '有', 'you3', 'to have'],
    [4, '右', 'you4', 'right'],
  ]),
];
