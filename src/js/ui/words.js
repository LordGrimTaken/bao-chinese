import {
  ALL_WORDS,
  ALL_WORD_BY_ID,
  BONUS_ONLY_WORDS,
  SENTENCES,
  UNITS,
  WORD_LESSON,
} from '../../data/course.js';
import { plainPinyin } from '../pinyin.js';
import { wordMastery } from '../core.js';
import { buildTraceSession, buildWordSession } from '../lesson-engine.js';
import { escapeHtml, icon, panda, toneSparkline, toneSummary } from './common.js';

export function renderWords(app) {
  const view = app.wordsView || (app.wordsView = { query: '', filter: 'all' });
  const total = ALL_WORDS.length;
  return `<div class="screen">
    <header class="page-header">
      <span class="eyebrow">Your dictionary</span>
      <h1>Words</h1>
      <p>${total} words: 45 lessons across 15 units plus the full 302-word HSK 1 deck. Tap any word for audio and a quick drill.</p>
    </header>
    <div class="search-wrap">
      ${icon('search')}
      <input class="search-input" id="word-search" type="search" placeholder="Search 汉字, pinyin, or English" value="${escapeHtml(view.query)}" autocomplete="off" />
    </div>
    <div class="chip-row" id="word-filters">
      ${[
        ['all', 'All'],
        ['new', 'New'],
        ['learning', 'Learning'],
        ['strong', 'Strong'],
        ['deck', 'HSK 1 deck'],
      ]
        .map(
          ([id, label]) =>
            `<button class="chip ${view.filter === id ? 'active' : ''}" data-filter="${id}">${label}</button>`
        )
        .join('')}
    </div>
    <div id="word-list">
      ${UNITS.map((unit) => renderUnitWords(app, unit)).join('')}
      ${renderBonusWords(app)}
      <div class="empty-state hidden" id="word-empty">
        ${panda('think')}
        <h3>No words match</h3>
        <p>Try a different spelling, or clear the filter.</p>
      </div>
    </div>
    <div style="height:10px"></div>
  </div>`;
}

function renderUnitWords(app, unit) {
  const words = unit.lessons.flatMap((lesson) =>
    lesson.words.map((id) => ALL_WORD_BY_ID.get(id)).filter(Boolean)
  );
  return `<section class="word-group" data-group="${unit.id}">
    <div class="word-group-head">
      <h3>Unit ${unit.number} · ${escapeHtml(unit.title)}</h3>
      <span class="line"></span>
      <span style="font-size:10.5px;color:var(--muted);font-weight:700">${words.length}</span>
    </div>
    ${words.map((word) => renderWordRow(app, word)).join('')}
  </section>`;
}

function renderBonusWords(app) {
  return `<section class="word-group" data-group="bonus">
    <div class="word-group-head">
      <h3>HSK 1 vocabulary deck</h3>
      <span class="line"></span>
      <span style="font-size:10.5px;color:var(--muted);font-weight:700">${BONUS_ONLY_WORDS.length}</span>
    </div>
    ${BONUS_ONLY_WORDS.map((word) => renderWordRow(app, word)).join('')}
  </section>`;
}

function renderWordRow(app, word) {
  const mastery = wordMastery(app.state, word.id);
  const search = `${word.zh} ${word.pinyin} ${plainPinyin(word.py)} ${word.en}`.toLowerCase();
  return `<button class="word-row" data-word="${word.id}" data-search="${escapeHtml(search)}" data-mastery="${mastery}" data-deck="${word.bonus ? '1' : '0'}">
    <span class="word-hanzi">${escapeHtml(word.zh)}</span>
    <span class="word-main">
      <span class="word-pinyin">${escapeHtml(word.pinyin)}</span>
      <span class="word-en">${escapeHtml(word.en)}</span>
    </span>
    <span class="word-side">
      <span class="mastery-dot m${mastery}" title="${masteryLabel(mastery)}"></span>
      <span class="speak-btn" role="button" tabindex="0" data-speak="${escapeHtml(word.zh)}" aria-label="Hear ${escapeHtml(word.zh)}">${icon('speaker')}</span>
    </span>
  </button>`;
}

function masteryLabel(level) {
  return ['Not practised', 'Learning', 'Familiar', 'Strong'][level] || 'New';
}

export function mountWords(app) {
  const search = document.querySelector('#word-search');
  const rows = [...document.querySelectorAll('.word-row')];
  const groups = [...document.querySelectorAll('.word-group')];
  const empty = document.querySelector('#word-empty');
  let filter = app.wordsView?.filter || 'all';
  let query = app.wordsView?.query || '';

  const apply = () => {
    const needle = query.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const mastery = Number(row.dataset.mastery);
      const filterOk =
        filter === 'all' ||
        (filter === 'new' && mastery === 0) ||
        (filter === 'learning' && mastery === 1) ||
        (filter === 'strong' && mastery >= 2) ||
        (filter === 'deck' && row.dataset.deck === '1');
      const searchOk = !needle || row.dataset.search.includes(needle);
      const show = filterOk && searchOk;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    }
    for (const group of groups) {
      const hasVisible = [...group.querySelectorAll('.word-row')].some((row) => !row.classList.contains('hidden'));
      group.classList.toggle('hidden', !hasVisible);
    }
    empty?.classList.toggle('hidden', visible > 0);
  };

  search?.addEventListener('input', () => {
    query = search.value;
    if (app.wordsView) app.wordsView.query = query;
    apply();
  });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      if (app.wordsView) app.wordsView.filter = filter;
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
      apply();
    });
  });

  document.querySelectorAll('[data-speak]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      app.speak(button.dataset.speak);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        app.speak(button.dataset.speak);
      }
    });
  });

  rows.forEach((row) => {
    row.addEventListener('click', () => openWord(app, row.dataset.word));
  });

  apply();
}

export function openWord(app, wordId) {
  const word = ALL_WORD_BY_ID.get(wordId);
  if (!word) return;
  const state = app.state.words[wordId];
  const mastery = wordMastery(app.state, wordId);
  const example = SENTENCES.find((sentence) => sentence.tokens.includes(word.zh));
  const lesson = WORD_LESSON.get(wordId);

  app.openModal(`<div class="modal-grab"></div>
    <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
    <div class="word-sheet-top">
      <div class="word-sheet-hanzi">${escapeHtml(word.zh)}</div>
      <div class="word-sheet-meta">
        <div class="word-sheet-py">${escapeHtml(word.pinyin)}</div>
        <div class="word-sheet-en">${escapeHtml(word.en)}</div>
        <div class="tone-badge">${toneSparkline(word.tones?.[0] || 5)}${escapeHtml(toneSummary(word.tones))}</div>
      </div>
      <button class="speak-btn" data-speak="${escapeHtml(word.zh)}" aria-label="Hear ${escapeHtml(word.zh)}">${icon('speaker')}</button>
    </div>
    ${word.note ? `<p class="modal-sub" style="margin-top:12px">${escapeHtml(word.note)}</p>` : ''}
    ${
      example
        ? `<div class="word-example">
            <div class="ex-zh">${escapeHtml(example.zh)}</div>
            <div class="ex-py">${escapeHtml(example.pinyin)}</div>
            <div class="ex-en">${escapeHtml(example.en)}</div>
            <button class="btn btn-ghost btn-sm" style="padding-left:0;margin-top:6px" data-speak="${escapeHtml(example.zh)}">${icon('speaker')} Hear the sentence</button>
          </div>`
        : word.bonus
          ? `<div class="word-example"><div class="ex-en">HSK 1 vocabulary deck — audio, meaning, and spaced review. A lesson sentence will arrive in a future content pack.</div></div>`
          : ''
    }
    <div class="word-stats">
      <div class="word-stat"><strong>${state?.seen || 0}</strong><span>Seen</span></div>
      <div class="word-stat"><strong>${state?.correct || 0}</strong><span>Correct</span></div>
      <div class="word-stat"><strong>${state?.wrong || 0}</strong><span>Missed</span></div>
      <div class="word-stat"><strong>${masteryLabel(mastery)}</strong><span>Strength</span></div>
    </div>
    ${lesson ? `<p class="modal-sub" style="margin-top:10px">From Unit ${lesson.unitNumber}: ${escapeHtml(lesson.title)}</p>` : ''}
    <div class="word-sheet-actions">
      <button class="btn btn-primary" data-practice-word="${word.id}">Practise</button>
      <button class="btn btn-secondary" data-trace-word="${word.id}">Trace ${escapeHtml([...word.zh][0])}</button>
    </div>`, {
    onMount: (root) => {
      root.querySelectorAll('[data-speak]').forEach((button) => {
        button.addEventListener('click', () => app.speak(button.dataset.speak));
      });
      root.querySelector('[data-practice-word]')?.addEventListener('click', () => {
        app.closeModal();
        app.startSession(buildWordSession(word, { pool: ALL_WORDS }));
      });
      root.querySelector('[data-trace-word]')?.addEventListener('click', () => {
        app.closeModal();
        app.startSession(buildTraceSession([word.id], { limit: 1, wordMap: ALL_WORD_BY_ID, pool: ALL_WORDS }));
      });
    },
  });
}


