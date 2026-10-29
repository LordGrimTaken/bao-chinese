import { ALL_WORDS, ALL_WORD_BY_ID, BONUS_ONLY_WORDS } from '../../data/course.js';
import { dueWords, studiedWords, weakWords, wordMastery } from '../core.js';
import {
  buildListeningSession,
  buildReviewSession,
  buildTonePairSession,
  buildTraceSession,
} from '../lesson-engine.js';
import { icon, panda, escapeHtml } from './common.js';

export function renderReview(app) {
  const state = app.state;
  const due = dueWords(state);
  const studied = studiedWords(state);
  const weak = weakWords(state).slice(0, 5);
  const counts = [0, 0, 0, 0];
  for (const word of ALL_WORDS) counts[wordMastery(state, word.id)] += 1;
  const total = ALL_WORDS.length;
  const studiedCount = studied.length;
  const pct = (n) => Math.max(0, (n / total) * 100);

  return `<div class="screen">
    <header class="page-header">
      <span class="eyebrow">Spaced repetition</span>
      <h1>Review</h1>
      <p>${due.length ? `${due.length} word${due.length === 1 ? '' : 's'} are due today. A few minutes now saves a lot of forgetting later.` : 'Nothing due right now. Your future self says 谢谢.'}</p>
    </header>

    <section class="due-card">
      ${panda(due.length ? 'happy' : 'celebrate')}
      <div class="due-kicker">${due.length ? 'Due now' : 'All caught up'}</div>
      <div class="due-count">${due.length ? due.length : '0'} <small>${due.length === 1 ? 'word' : 'words'}</small></div>
      <p>${due.length ? 'Tap through a short review. We bring words back right before you would forget them.' : 'Come back tomorrow, or get ahead with a practice drill.'}</p>
      <button class="btn btn-sm" data-action="start-review" ${due.length ? '' : 'disabled'}>${due.length ? 'Start review' : 'Nothing due'} ${icon('arrowRight')}</button>
    </section>

    <div class="section-title"><h2>Practice gym</h2><span>Pick a skill</span></div>
    <div class="practice-grid">
      <button class="practice-card" data-practice="tone">
        <span class="practice-emoji" style="--accent:var(--gold);--accent-soft:var(--gold-soft)">${icon('speaker')}</span>
        <strong>Tone pairs</strong>
        <span>mā, má, mǎ, mà — hear the difference in minimal pairs.</span>
      </button>
      <button class="practice-card" data-practice="listening">
        <span class="practice-emoji" style="--accent:var(--sky);--accent-soft:var(--sky-soft)">${icon('headphones')}</span>
        <strong>Listening</strong>
        <span>Audio only. Train your ear without pinyin.</span>
      </button>
      <button class="practice-card" data-practice="trace">
        <span class="practice-emoji" style="--accent:var(--plum);--accent-soft:var(--plum-soft)">${icon('brush')}</span>
        <strong>Trace characters</strong>
        <span>Build the muscle memory to write 汉字.</span>
      </button>
      <button class="practice-card" data-practice="weak">
        <span class="practice-emoji" style="--accent:var(--red);--accent-soft:var(--red-soft)">${icon('dumbbell')}</span>
        <strong>Weak words</strong>
        <span>${weak.length ? `${weak.length} word${weak.length === 1 ? '' : 's'} need another look.` : 'No weak spots yet — keep it up.'}</span>
      </button>
      <button class="practice-card practice-card--wide" data-practice="hsk1">
        <span class="practice-emoji" style="--accent:var(--jade);--accent-soft:var(--jade-soft)">${icon('book')}</span>
        <strong>HSK 1 deck</strong>
        <span>All ${BONUS_ONLY_WORDS.length} remaining HSK 1 words — audio, meaning, and spaced review.</span>
      </button>
    </div>

    <section class="strength-card">
      <div class="strength-head"><h3>Word strength</h3><span>${studiedCount} of ${total} practised</span></div>
      <div class="strength-bar" aria-hidden="true">
        <span class="s-new" style="width:${pct(counts[0])}%"></span>
        <span class="s-learning" style="width:${pct(counts[1])}%"></span>
        <span class="s-familiar" style="width:${pct(counts[2])}%"></span>
        <span class="s-strong" style="width:${pct(counts[3])}%"></span>
      </div>
      <div class="strength-legend">
        <span><i class="dot" style="background:#d9c8b8"></i>New ${counts[0]}</span>
        <span><i class="dot" style="background:var(--gold)"></i>Learning ${counts[1]}</span>
        <span><i class="dot" style="background:var(--sky)"></i>Familiar ${counts[2]}</span>
        <span><i class="dot" style="background:var(--jade)"></i>Strong ${counts[3]}</span>
      </div>
    </section>

    ${
      weak.length
        ? `<div class="section-title"><h2>Needs a little love</h2><span>Tap to practise</span></div>
          <div class="weak-list">
            ${weak
              .map((id) => {
                const word = ALL_WORD_BY_ID.get(id);
                const data = state.words[id];
                return `<button class="weak-row" data-word="${id}">
                  <span class="w-zh">${escapeHtml(word.zh)}</span>
                  <span><span class="w-py">${escapeHtml(word.pinyin)}</span><br><span class="w-en">${escapeHtml(word.en)}</span></span>
                  <span class="w-meta">${data?.wrong || 0} miss${(data?.wrong || 0) === 1 ? '' : 'es'}</span>
                </button>`;
              })
              .join('')}
          </div>`
        : `<div class="section-title"><h2>Needs a little love</h2><span>All good</span></div>
          <div class="empty-state" style="padding:20px">
            ${panda('celebrate')}
            <h3>No weak words yet</h3>
            <p>Finish a lesson and this space will fill with the words worth revisiting.</p>
          </div>`
    }

    <div class="section-title"><h2>Up next</h2><span>${studiedCount ? 'Recent' : 'Start here'}</span></div>
    <div class="weak-list">
      ${
        (studied.length ? studied.slice(-3).reverse() : ALL_WORDS.slice(0, 3).map((word) => word.id))
          .map((id) => {
            const word = ALL_WORD_BY_ID.get(id);
            return `<button class="weak-row" data-word="${id}">
              <span class="w-zh">${escapeHtml(word.zh)}</span>
              <span><span class="w-py">${escapeHtml(word.pinyin)}</span><br><span class="w-en">${escapeHtml(word.en)}</span></span>
              <span class="w-meta" style="color:var(--jade-dark)">${icon('chevron')}</span>
            </button>`;
          })
          .join('') || ''
      }
    </div>
  </div>`;
}

export function mountReview(app) {
  const studied = studiedWords(app.state);
  const due = dueWords(app.state);
  const weak = weakWords(app.state);

  document.querySelector('[data-action="start-review"]')?.addEventListener('click', () => {
    if (!due.length) return;
    const session = buildReviewSession(due, {
      limit: 12,
      pool: ALL_WORDS,
      wordMap: ALL_WORD_BY_ID,
    });
    session.subtitle = upNextCopy(due.length);
    app.startSession(session);
  });

  document.querySelectorAll('[data-practice]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.practice;
      if (mode === 'tone') {
        app.startSession(buildTonePairSession({ limit: 8 }));
      } else if (mode === 'listening') {
        const session = buildListeningSession(studied.length ? studied : null, {
          limit: 10,
          pool: ALL_WORDS,
          wordMap: ALL_WORD_BY_ID,
        });
        app.startSession(session);
      } else if (mode === 'trace') {
        const session = buildTraceSession(studied.length ? studied : null, {
          limit: 8,
          pool: ALL_WORDS,
          wordMap: ALL_WORD_BY_ID,
        });
        app.startSession(session);
      } else if (mode === 'hsk1') {
        const session = buildReviewSession(BONUS_ONLY_WORDS.map((word) => word.id), {
          limit: 12,
          seed: 'hsk1',
          pool: ALL_WORDS,
          wordMap: ALL_WORD_BY_ID,
        });
        session.title = 'HSK 1 deck';
        session.subtitle = 'The complete vocabulary list';
        app.startSession(session);
      } else if (mode === 'weak') {
        if (!weak.length) {
          app.toast('No weak words yet — finish a lesson first.');
          return;
        }
        const session = buildReviewSession(weak, {
          limit: 10,
          seed: 'weak',
          pool: ALL_WORDS,
          wordMap: ALL_WORD_BY_ID,
        });
        session.title = 'Weak words';
        session.subtitle = 'A gentle second pass';
        app.startSession(session);
      }
    });
  });

  document.querySelectorAll('[data-word]').forEach((button) => {
    button.addEventListener('click', () => app.openWord(button.dataset.word));
  });
}

function upNextCopy(count) {
  if (count <= 4) return 'A quick refresh';
  if (count <= 8) return 'A solid review';
  return 'Time to clear the queue';
}
