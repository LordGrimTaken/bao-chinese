/** Shared visual pieces: icons, mascot, rings, tone contours, formatting. */

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const ICONS = {
  flame: '<path d="M12 2.6c.5 4.2-2.8 5.3-2.8 8.4 0 1 .5 1.9 1.3 2.4-.2-2 1-3.4 2.4-4.5 1.5 1.6 2.7 3.6 2.7 6.1a5.6 5.6 0 1 1-11.2 0c0-2.3 1-4.2 2.4-5.9 1.1-1.3 2.1-2.5 2.2-4.1.3.2.7.5 1 .8Z" fill="currentColor"/>',
  gem: '<path d="M7 3h10l4 6-9 12L3 9l4-6Z" fill="currentColor" opacity=".95"/><path d="M3 9h18M9 3l3 18 3-18" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>',
  heart: '<path d="M12 21s-8.2-5.3-8.2-11.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.2 3.3C20.2 15.7 12 21 12 21Z" fill="currentColor"/>',
  heartOutline: '<path d="M12 20.3s-7.3-4.7-7.3-10.4A4 4 0 0 1 12 7.1a4 4 0 0 1 7.3 2.8C19.3 15.6 12 20.3 12 20.3Z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  check: '<path d="m4.5 12.5 5 5 10-11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9L12 2.8Z" fill="currentColor"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4V9Z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  close: '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  back: '<path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron: '<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  settings: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  user: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  book: '<path d="M4 5.5c2.8-1.1 5.3-.8 8 1v13c-2.7-1.8-5.2-2.1-8-1v-13Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 5.5c-2.8-1.1-5.3-.8-8 1v13c2.7-1.8 5.2-2.1 8-1v-13Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  dumbbell: '<path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="13" width="4" height="7" rx="2" fill="currentColor"/><rect x="17" y="13" width="4" height="7" rx="2" fill="currentColor"/>',
  brush: '<path d="M5 19c2.5.2 4-1 4.5-3.2L18.8 6.5a2.3 2.3 0 0 0-3.3-3.3L6.2 12.5C4 13 2.8 14.5 3 17c.1 1 .9 1.9 2 2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14 5 5 5" stroke="currentColor" stroke-width="1.8"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
  crown: '<path d="m3 7 4 3 5-6 5 6 4-3-2 11H5L3 7Z" fill="currentColor"/><path d="M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 7v5.4l3.5 2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  bolt: '<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" fill="currentColor"/>',
  freeze: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3M3.8 10.5l4 .5-.5-4M20.2 13.5l-4-.5.5 4M20.2 10.5l-4 .5.5-4M3.8 13.5l4-.5-.5 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  shop: '<path d="M4 9 5.5 4h13L20 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 9a2.6 2.6 0 0 0 5.3 0A2.6 2.6 0 0 0 14.7 9 2.6 2.6 0 0 0 20 9v10H4V9Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 19v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  install: '<path d="M12 3v11m0 0 4-4m-4 4-4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17v3h14v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  download: '<path d="M12 3v11m0 0 4-4m-4 4-4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  upload: '<path d="M12 15V4m0 0-4 4m4-4 4 4M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.3 2.8 7.6 7 9.5 4.2-1.9 7-5.2 7-9.5V6l-7-3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  target: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  sparkle: '<path d="M12 2.5c.6 4.7 2.8 6.9 7.5 7.5-4.7.6-6.9 2.8-7.5 7.5-.6-4.7-2.8-6.9-7.5-7.5 4.7-.6 6.9-2.8 7.5-7.5Z" fill="currentColor"/><path d="M19 15.5c.3 2 1.2 2.9 3.2 3.2-2 .3-2.9 1.2-3.2 3.2-.3-2-1.2-2.9-3.2-3.2 2-.3 2.9-1.2 3.2-3.2Z" fill="currentColor"/>',
  globe: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.4 12h17.2M12 3.2c2.5 2.3 3.8 5.3 3.8 8.8s-1.3 6.5-3.8 8.8c-2.5-2.3-3.8-5.3-3.8-8.8S9.5 5.5 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  moon: '<path d="M20 15.2A8.8 8.8 0 0 1 8.8 4a8.8 8.8 0 1 0 11.2 11.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  arrowRight: '<path d="M4 12h15m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor"/>',
};

export function icon(name, className = '', label = '') {
  const body = ICONS[name] || ICONS.sparkle;
  const aria = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';
  return `<svg class="icon ${className}" viewBox="0 0 24 24" ${aria}>${body}</svg>`;
}

/** Bao the panda. Moods: happy, celebrate, sad, think, sleepy. */
export function panda(mood = 'happy', className = '') {
  const eyes =
    mood === 'celebrate'
      ? '<path d="M84 92q10-11 20 0M136 92q10-11 20 0" fill="none" stroke="#2b2118" stroke-width="5" stroke-linecap="round"/>'
      : mood === 'sleepy'
        ? '<path d="M84 94q10 7 20 0M136 94q10 7 20 0" fill="none" stroke="#2b2118" stroke-width="5" stroke-linecap="round"/>'
        : mood === 'sad'
          ? '<circle cx="94" cy="93" r="6.5" fill="#fff"/><circle cx="146" cy="93" r="6.5" fill="#fff"/><circle cx="94" cy="94" r="3.4" fill="#2b2118"/><circle cx="146" cy="94" r="3.4" fill="#2b2118"/><path d="M83 82q11-5 19 1M138 83q8-6 19-1" fill="none" stroke="#2b2118" stroke-width="4" stroke-linecap="round"/>'
          : '<circle cx="94" cy="92" r="6.8" fill="#fff"/><circle cx="146" cy="92" r="6.8" fill="#fff"/><circle cx="94" cy="93" r="3.6" fill="#2b2118"/><circle cx="146" cy="93" r="3.6" fill="#2b2118"/><circle cx="96" cy="90" r="1.4" fill="#fff"/><circle cx="148" cy="90" r="1.4" fill="#fff"/>';
  const mouth =
    mood === 'sad'
      ? '<path d="M110 131q10-9 20 0" fill="none" stroke="#2b2118" stroke-width="4" stroke-linecap="round"/>'
      : mood === 'celebrate'
        ? '<ellipse cx="120" cy="128" rx="12" ry="9" fill="#2b2118"/><ellipse cx="120" cy="132" rx="7" ry="5" fill="#e8766a"/>'
        : mood === 'think'
          ? '<path d="M112 128q8 4 16 0" fill="none" stroke="#2b2118" stroke-width="4" stroke-linecap="round"/><circle cx="158" cy="68" r="4" fill="#2b2118" opacity=".6"/>'
          : '<path d="M110 125q10 10 20 0" fill="none" stroke="#2b2118" stroke-width="4" stroke-linecap="round"/>';
  const brow =
    mood === 'think'
      ? '<path d="M84 77q10-4 19 1" fill="none" stroke="#2b2118" stroke-width="4" stroke-linecap="round"/>'
      : '';
  return `<svg class="panda ${className}" viewBox="0 0 240 228" aria-hidden="true">
    <ellipse cx="120" cy="214" rx="64" ry="9" fill="#2b2118" opacity=".09"/>
    <ellipse cx="72" cy="160" rx="17" ry="31" fill="#2b2118" transform="rotate(24 72 160)"/>
    <ellipse cx="168" cy="160" rx="17" ry="31" fill="#2b2118" transform="rotate(-24 168 160)"/>
    <ellipse cx="120" cy="154" rx="53" ry="46" fill="#fffaf3" stroke="#2b2118" stroke-width="5"/>
    <ellipse cx="120" cy="170" rx="22" ry="14" fill="#f6eadc" opacity=".8"/>
    <circle cx="59" cy="64" r="23" fill="#2b2118"/>
    <circle cx="181" cy="64" r="23" fill="#2b2118"/>
    <circle cx="59" cy="62" r="11" fill="#514039" opacity=".55"/>
    <circle cx="181" cy="62" r="11" fill="#514039" opacity=".55"/>
    <ellipse cx="120" cy="105" rx="66" ry="59" fill="#fffaf3" stroke="#2b2118" stroke-width="5"/>
    <ellipse cx="94" cy="93" rx="18" ry="22" fill="#2b2118" transform="rotate(14 94 93)"/>
    <ellipse cx="146" cy="93" rx="18" ry="22" fill="#2b2118" transform="rotate(-14 146 93)"/>
    ${eyes}
    ${brow}
    <ellipse cx="120" cy="115" rx="8.5" ry="6.5" fill="#2b2118"/>
    <path d="M120 121v5" stroke="#2b2118" stroke-width="3" stroke-linecap="round"/>
    ${mouth}
    <ellipse cx="70" cy="118" rx="10" ry="6" fill="#ef9a8d" opacity=".55"/>
    <ellipse cx="170" cy="118" rx="10" ry="6" fill="#ef9a8d" opacity=".55"/>
    <path d="M64 152q56 24 112 0" fill="none" stroke="#e8503a" stroke-width="11" stroke-linecap="round" opacity=".95"/>
    <path d="M174 158q14 8 8 26" fill="none" stroke="#e8503a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="120" cy="163" r="6" fill="#fffaf3" opacity=".9"/>
  </svg>`;
}

export function brand(compact = false) {
  return `<div class="brand ${compact ? 'brand--compact' : ''}">
    <span class="brand-mark" aria-hidden="true">包</span>
    ${compact ? '' : '<span class="brand-word">Bao</span>'}
  </div>`;
}

export function toneSummary(tones = []) {
  if (!tones.length) return 'neutral tone';
  return tones
    .map((tone) =>
      tone === 5 ? 'neutral' : `${tone}${tone === 1 ? 'st' : tone === 2 ? 'nd' : tone === 3 ? 'rd' : 'th'} tone`
    )
    .join(' + ');
}

export function toneSparkline(tone, className = '') {
  const points = {
    1: '4,8 20,8 36,8 52,8',
    2: '4,20 20,17 36,10 52,5',
    3: '4,13 18,20 32,21 52,9',
    4: '4,4 20,9 36,17 52,22',
    5: '4,13 20,13 36,13 52,13',
  }[tone] || '4,13 20,13 36,13 52,13';
  return `<svg class="tone-spark ${className}" viewBox="0 0 56 26" aria-hidden="true"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function ring(percent, { size = 64, stroke = 7, color = 'var(--jade)', track = 'var(--line)', center = '' } = {}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = clamp(percent, 0, 1);
  const dash = circumference * value;
  return `<div class="ring" style="--ring-size:${size}px;--ring-stroke:${stroke}px">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
      <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash} ${circumference}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>
    <div class="ring-center">${center}</div>
  </div>`;
}

export function stars(count, max = 3) {
  return `<span class="stars" aria-label="${count} of ${max} stars">${Array.from({ length: max }, (_, i) =>
    `<span class="star ${i < count ? 'is-on' : ''}">${icon('star')}</span>`
  ).join('')}</span>`;
}

export function formatNumber(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return String(value);
}

export function relativeDate(iso) {
  if (!iso) return 'never';
  const date = new Date(iso);
  const diff = Math.round((Date.now() - date.getTime()) / 86400000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
