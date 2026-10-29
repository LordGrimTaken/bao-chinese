/**
 * Pinyin utilities.
 *
 * Course data stores pinyin in numbered form (e.g. "ni3 hao3") because it is
 * unambiguous and easy to validate. The UI converts it to tone marks.
 */

const TONE_VOWELS = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

/** Convert one numbered syllable ("ni3", "zhe4r", "lv4") to tone marks. */
function markSyllable(syllable) {
  const match = syllable.match(/^([A-Za-züÜ]+)([1-5])(r?)$/);
  if (!match) return syllable;
  const [, rawBase, rawTone, suffix] = match;
  const tone = Number(rawTone);
  if (tone === 5) return rawBase + suffix;

  const base = rawBase.replace(/v/g, 'ü').replace(/V/g, 'Ü');
  let target = null;
  if (/a/i.test(base)) target = base.match(/a/i)[0];
  else if (/e/i.test(base)) target = base.match(/e/i)[0];
  else if (/ou/i.test(base)) target = base.match(/o/i)[0];
  else {
    const vowels = base.match(/[aeiouü]/gi);
    target = vowels ? vowels[vowels.length - 1] : null;
  }
  if (!target) return syllable;

  const key = target.toLowerCase();
  const marked = TONE_VOWELS[key]?.[tone] ?? target;
  const cased = target === target.toUpperCase() ? marked.toUpperCase() : marked;
  return base.replace(target, cased) + suffix;
}

/** Convert numbered pinyin ("ni3 hao3") to marks ("nǐ hǎo"). */
export function toMarks(pinyin) {
  if (!pinyin) return '';
  return String(pinyin)
    .trim()
    .split(/\s+/)
    .map(markSyllable)
    .join(' ');
}

/** Convert tone marks ("nǐ hǎo") to numbered pinyin ("ni3 hao3"). */
export function toNumbers(pinyin) {
  if (!pinyin) return '';
  const reverse = new Map();
  for (const [base, forms] of Object.entries(TONE_VOWELS)) {
    forms.forEach((form, index) => {
      if (index > 0) reverse.set(form, `${base}${index}`);
      if (index > 0) reverse.set(form.toUpperCase(), `${base.toUpperCase()}${index}`);
    });
  }
  return String(pinyin)
    .trim()
    .split(/\s+/)
    .map((syllable) => {
      for (const [marked, numbered] of reverse) {
        if (syllable.includes(marked)) {
          return syllable.replace(marked, numbered.slice(0, -1)) + numbered.slice(-1);
        }
      }
      return syllable;
    })
    .join(' ');
}

/** Remove tone marks and numbers for search / comparison. */
export function plainPinyin(pinyin) {
  return toMarks(pinyin)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[1-5]/g, '')
    .replace(/ü/g, 'v')
    .toLowerCase()
    .replace(/[^a-zv\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Return tone numbers for each syllable, e.g. ["ni3","hao3"] -> [3,3]. */
export function tonesOf(pinyin) {
  if (!pinyin) return [];
  return String(pinyin)
    .trim()
    .split(/\s+/)
    .map((syllable) => {
      const match = syllable.match(/([1-5])(r?)$/);
      return match ? Number(match[1]) : 5;
    });
}

/** Tone contour points for a tiny sparkline: 1=high, 5=low. */
export function toneContour(tone) {
  switch (tone) {
    case 1:
      return [1, 1, 1, 1];
    case 2:
      return [3, 2.4, 1.7, 1];
    case 3:
      return [2.4, 3.4, 3.8, 2.2];
    case 4:
      return [1, 2.2, 3.2, 3.8];
    default:
      return [2.5, 2.5, 2.5, 2.5];
  }
}

export function toneName(tone) {
  return (
    {
      1: '1st tone · high & flat',
      2: '2nd tone · rising',
      3: '3rd tone · dipping',
      4: '4th tone · falling',
      5: 'neutral · light',
    }[tone] || 'neutral'
  );
}

/**
 * Split numbered pinyin into syllables for display, keeping neutral tones.
 * "ni3 hao3" -> [{text:"ni3", mark:"nǐ", tone:3}, ...]
 */
export function syllables(pinyin) {
  return String(pinyin)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, mark: toMarks(text), tone: tonesOf(text)[0] }));
}
