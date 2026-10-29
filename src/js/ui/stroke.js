import { ALL_WORD_BY_ZH } from '../../data/course.js';
import { STROKE_CHARS, STROKE_DATA } from '../../data/stroke-data.js';
import { escapeHtml, icon, panda } from './common.js';

export function openStrokeLab(app, char, from = 'review') {
  const target = STROKE_DATA[char] ? char : STROKE_CHARS[0];
  app.route = {
    name: 'stroke',
    char: target,
    from,
    index: 0,
    done: false,
    rewarded: false,
    feedback: '',
  };
  app.session = null;
  app.closeModal();
  app.render();
  window.scrollTo(0, 0);
}

function charDataLoader(char, onLoad) {
  onLoad(STROKE_DATA[char] || null);
}

export function renderStroke(app) {
  const route = app.route;
  const char = STROKE_DATA[route.char] ? route.char : STROKE_CHARS[0];
  const data = STROKE_DATA[char];
  const word = ALL_WORD_BY_ZH.get(char);
  const index = Math.min(Math.max(Number(route.index) || 0, 0), data.strokes.length);
  const done = Boolean(route.done) || index >= data.strokes.length;
  const character = escapeHtml(char);

  const success = done
    ? `<section class="stroke-success">
        ${panda('celebrate')}
        <span class="eyebrow">Complete</span>
        <h2>写得好！</h2>
        <p>You wrote <b>${character}</b> in ${data.strokes.length} strokes.</p>
        <div class="stroke-success-actions">
          <button class="btn btn-primary" data-stroke-action="again">Practise again</button>
          <button class="btn btn-secondary" data-stroke-action="next">Next character ${icon('arrowRight')}</button>
        </div>
      </section>`
    : `<section class="stroke-practice">
        <div class="stroke-card-head">
          <div>
            <span class="eyebrow">Guided writing</span>
            <h2>${character}</h2>
            <p>${word ? `${escapeHtml(word.pinyin)} · ${escapeHtml(word.en)}` : 'Trace each stroke in order.'}</p>
          </div>
          <div class="stroke-count">
            <strong data-stroke-count>${index + 1}</strong>
            <span>of ${data.strokes.length}</span>
          </div>
        </div>

        <div class="stroke-grid">
          <div class="stroke-target" id="stroke-target" aria-label="Guided writing area for ${character}"></div>
        </div>

        <div class="stroke-hint">
          <span class="stroke-dot"></span>
          <span>Start where the stroke begins. Draw each stroke in order — hints appear after two misses.</span>
        </div>
        <p class="stroke-feedback" data-feedback>${escapeHtml(route.feedback || '')}</p>

        <div class="stroke-actions">
          <button class="btn btn-secondary" data-stroke-action="show">${icon('play')} Show me</button>
          <button class="btn btn-secondary" data-stroke-action="reset">Reset</button>
        </div>
      </section>`;

  return `<div class="stroke-screen">
    <header class="stroke-top">
      <button class="icon-btn" data-stroke-action="back" aria-label="Back">${icon('close')}</button>
      <div>
        <span class="eyebrow">Stroke order</span>
        <strong>Write 汉字</strong>
      </div>
      <span class="stroke-progress">${done ? 'Done' : `${index + 1}/${data.strokes.length}`}</span>
    </header>

    <div class="stroke-intro">
      <h1>Stroke by stroke.</h1>
      <p>Real stroke paths for 16 core HSK 1 characters. Draw on the grid — each correct stroke unlocks the next.</p>
    </div>

    ${success}

    <div class="stroke-picker" aria-label="Choose a character">
      ${STROKE_CHARS.map(
        (item) =>
          `<button class="stroke-chip ${item === char ? 'active' : ''}" data-stroke-char="${item}" aria-label="Practise ${escapeHtml(item)}">${item}</button>`
      ).join('')}
    </div>

    <p class="stroke-source">Stroke data: <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noopener">Make Me a Hanzi</a> / <a href="https://github.com/chanind/hanzi-writer" target="_blank" rel="noopener">Hanzi Writer</a>, Arphic Public License / MIT.</p>
  </div>`;
}

export function mountStroke(app) {
  const root = document.querySelector('.stroke-screen');
  if (!root) return;

  const char = STROKE_DATA[app.route.char] ? app.route.char : STROKE_CHARS[0];
  const data = STROKE_DATA[char];
  let writer = null;

  const back = () => app.go(app.route.from || 'review');
  root.querySelector('[data-stroke-action="back"]')?.addEventListener('click', back);

  root.querySelectorAll('[data-stroke-char]').forEach((button) => {
    button.addEventListener('click', () => openStrokeLab(app, button.dataset.strokeChar, app.route.from));
  });

  root.querySelector('[data-stroke-action="again"]')?.addEventListener('click', () => {
    app.route.index = 0;
    app.route.done = false;
    app.route.rewarded = false;
    app.route.feedback = '';
    app.render();
  });

  root.querySelector('[data-stroke-action="next"]')?.addEventListener('click', () => {
    const next = STROKE_CHARS[(STROKE_CHARS.indexOf(char) + 1) % STROKE_CHARS.length];
    openStrokeLab(app, next, app.route.from);
  });

  if (app.route.done) return;

  const target = root.querySelector('#stroke-target');
  const feedback = root.querySelector('[data-feedback]');
  const count = root.querySelector('[data-stroke-count]');
  const progress = root.querySelector('.stroke-progress');
  if (!target) return;

  if (!window.HanziWriter) {
    feedback.textContent = 'The stroke library could not load. Check your connection and reload.';
    return;
  }

  const setFeedback = (message) => {
    if (feedback) feedback.textContent = message;
  };

  const createWriter = () => {
    target.innerHTML = '';
    writer = window.HanziWriter.create(target, char, {
      width: 300,
      height: 300,
      padding: 6,
      showOutline: true,
      showCharacter: false,
      strokeColor: '#2c8d6d',
      radicalColor: '#d95a43',
      highlightColor: '#e7a72c',
      drawingColor: '#c94f3d',
      drawingWidth: 22,
      charDataLoader,
    });
    writer.quiz({
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onCorrectStroke: (strokeData) => {
        const number = Math.min(strokeData.strokeNum + 1, data.strokes.length);
        app.route.index = number;
        if (count) count.textContent = String(number);
        if (progress) progress.textContent = `${number}/${data.strokes.length}`;
        setFeedback(number >= data.strokes.length ? '' : 'Nice — next stroke.');
        app.sfx?.('correct');
        app.vibrate?.(8);
      },
      onMistake: () => {
        setFeedback('Not quite — try again from the dot.');
        app.sfx?.('wrong');
        app.vibrate?.(6);
      },
      onComplete: () => {
        app.route.done = true;
        app.route.index = data.strokes.length;
        if (!app.route.rewarded) {
          app.route.rewarded = true;
          app.state.xp = (app.state.xp || 0) + 10;
          app.save();
          app.toast('+10 XP — stroke practice complete', 'good');
        }
        app.sfx?.('complete');
        app.vibrate?.([18, 40, 18]);
        app.render();
      },
    });
  };

  root.querySelector('[data-stroke-action="show"]')?.addEventListener('click', () => {
    if (!writer) return;
    setFeedback('Watch the stroke, then try it.');
    writer.animateCharacter({ onComplete: createWriter });
  });

  root.querySelector('[data-stroke-action="reset"]')?.addEventListener('click', () => {
    app.route.index = 0;
    if (count) count.textContent = '1';
    if (progress) progress.textContent = `1/${data.strokes.length}`;
    setFeedback('');
    createWriter();
  });

  createWriter();

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') back();
    },
    { once: true }
  );
}
