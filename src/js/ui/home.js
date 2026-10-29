import { UNITS, WORD_BY_ID } from '../../data/course.js';
import {
  dueWords,
  levelInfo,
  nextLessonId,
  starsForAccuracy,
  streakStatus,
  unitProgress,
} from '../core.js';
import { brand, icon, panda, ring, stars, escapeHtml, formatNumber } from './common.js';
import { buildReviewSession } from '../lesson-engine.js';

const POSITIONS = [50, 73, 50, 27];

function lessonOrder() {
  return UNITS.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
}

export function nodeState(app, unit, lesson, index) {
  const completed = Boolean(app.state.lessons[lesson.id]?.completed);
  if (completed) return 'done';
  const order = lessonOrder();
  const position = order.indexOf(lesson.id);
  const unlocked = position <= 0 || Boolean(app.state.lessons[order[position - 1]]?.completed);
  if (!unlocked) return 'locked';
  const next = nextLessonId(app.state, order);
  return lesson.id === next ? 'current' : 'open';
}

export function renderHome(app) {
  const state = app.state;
  const todayXp = state.daily.xp;
  const goal = state.profile.dailyGoalXp || 30;
  const percent = Math.min(1, todayXp / goal);
  const streak = state.streak;
  const due = dueWords(state).length;
  const level = levelInfo(state.xp);
  const order = lessonOrder();
  const next = nextLessonId(state, order);
  const nextLesson = UNITS.flatMap((unit) => unit.lessons).find((lesson) => lesson.id === next);
  const atRisk = streakStatus(state).atRisk;
  const greeting =
    state.profile.name && state.profile.name !== 'friend'
      ? `你好, ${escapeHtml(state.profile.name)}`
      : '你好, learner';

  const goalCopy =
    percent >= 1
      ? `<h2>Daily goal complete! <span aria-hidden="true">🎉</span></h2><p>You earned <strong>${todayXp} XP</strong> today. Anything else is a bonus.</p>`
      : `<h2>${atRisk ? 'Keep your streak alive' : 'A little Chinese today?'}</h2><p><strong>${Math.max(0, goal - todayXp)} XP</strong> to your daily goal — about ${Math.max(
          5,
          Math.round((Math.max(0, goal - todayXp) / 15) * 5)
        )} minutes.</p>`;

  return `<div class="screen">
    <header class="home-top">
      ${brand()}
      <div class="home-stats">
        <button class="stat stat--streak" data-action="streak" aria-label="Streak: ${streak} days">${icon('flame')}<span>${streak}</span></button>
        <button class="stat stat--gems" data-action="shop" aria-label="Gems: ${state.gems}">${icon('gem')}<span>${state.gems}</span></button>
        <button class="stat stat--hearts ${state.hearts === 0 ? 'is-empty' : ''}" data-action="hearts" aria-label="Hearts: ${state.hearts}">${state.hearts === 0 ? icon('heartOutline') : icon('heart')}<span>${state.hearts}</span></button>
      </div>
    </header>

    <div class="home-greeting">
      <h1>${greeting}</h1>
      <p>${due ? `${due} word${due === 1 ? '' : 's'} ready for review.` : nextLesson ? `Next up: ${escapeHtml(nextLesson.title)}` : 'Your course is complete. 太棒了!'}</p>
    </div>

    <section class="daily-card">
      ${ring(percent, {
        size: 62,
        stroke: 7,
        color: percent >= 1 ? 'var(--gold)' : 'var(--jade)',
        center: `${todayXp}<small>/${goal}</small>`,
      })}
      <div class="daily-copy">${goalCopy}</div>
    </section>

    <div class="daily-strip">
      ${icon('bolt')} Level ${level.level} · ${level.title}
      <span class="dot"></span>
      ${formatNumber(state.xp)} XP total
    </div>

    ${UNITS.map((unit) => renderUnit(app, unit, next)).join('')}

    <div class="coming-soon">
      <strong>49 lessons — the complete HSK 1 course.</strong><br />
      Every official HSK 1 word now has audio, a sentence lesson, and spaced review. Stories and stroke-order practice are next.
    </div>
  </div>`;
}

function renderUnit(app, unit, nextLessonIdValue) {
  const progress = unitProgress(app.state, unit);
  const reviewDone = Boolean(app.state.reviews?.[unit.id]?.completed);
  const allLessonsDone = progress.done === progress.total;
  const unitIsCurrent = unit.lessons.some((lesson) => nodeState(app, unit, lesson, 0) === 'current');
  const nodes = [
    ...unit.lessons.map((lesson, index) => ({
      kind: 'lesson',
      lesson,
      index,
      state: nodeState(app, unit, lesson, index),
    })),
    {
      kind: 'review',
      id: `${unit.id}r`,
      state: reviewDone ? 'done' : allLessonsDone ? 'review-current' : 'locked',
      label: 'Unit review',
    },
  ];
  const currentIndex = nodes.findIndex((node) => node.state === 'current' || node.state === 'review-current');
  const progressCount = nodes.filter((node) => node.state === 'done').length;

  return `<section class="unit-section unit-${unit.color}" data-unit="${unit.id}">
    <div class="unit-banner">
      <div class="unit-banner-top">
        <div>
          <div class="unit-kicker">Unit ${unit.number} · HSK 1</div>
          <h2 class="unit-title">${escapeHtml(unit.title)}</h2>
          <p class="unit-subtitle">${escapeHtml(unit.subtitle)}</p>
        </div>
        <button class="guide-btn" data-guide="${unit.id}" aria-label="Unit ${unit.number} guidebook">${icon('book')}<span>Guide</span></button>
      </div>
      <div class="unit-meta">
        <span>${unit.emoji}</span>
        <span>${progress.done}/${progress.total} lessons</span>
        <span>·</span>
        ${stars(progress.stars, progress.maxStars)}
      </div>
    </div>
    <div class="path" data-unit="${unit.id}" data-current="${currentIndex}">
      <svg class="path-line" aria-hidden="true"></svg>
      ${nodes
        .map((node, index) => {
          const x = POSITIONS[index % POSITIONS.length];
          if (node.kind === 'review') {
            return `<div class="node-row" style="--x:${x}%">
              ${renderReviewNode(app, unit, node)}
            </div>`;
          }
          return `<div class="node-row" style="--x:${x}%">
            ${renderLessonNode(app, unit, node)}
          </div>`;
        })
        .join('')}
      ${
        unitIsCurrent
          ? `<div class="unit-cheer">${panda('happy')}<span>${
              progress.done === 0
                ? unit.number === 1
                  ? 'Start with hello. Five minutes is enough.'
                  : 'A new unit. One small lesson at a time.'
                : progress.done < progress.total
                  ? 'You are building a real habit. Keep going!'
                  : 'Unit complete! Try the review to lock it in.'
            }</span></div>`
          : ''
      }
    </div>
  </section>`;
}

function renderLessonNode(app, unit, node) {
  const { lesson, state } = node;
  const saved = app.state.lessons[lesson.id];
  const current = state === 'current';
  const locked = state === 'locked';
  const done = state === 'done';
  const label = done ? lesson.title : locked ? ' ' : lesson.title;
  const nodeIcon = locked ? 'lock' : done ? 'check' : 'play';
  return `<div class="node-wrap">
    ${current ? `<span class="start-bubble">Start</span>` : ''}
    <button class="node ${current ? 'node--current' : done ? 'node--done' : locked ? 'node--locked' : ''}"
      data-lesson="${lesson.id}" aria-label="${escapeHtml(lesson.title)}${locked ? ' (locked)' : ''}" ${locked ? 'aria-disabled="true"' : ''}>
      ${icon(nodeIcon)}
    </button>
    <div class="node-stars">${[0, 1, 2]
      .map((i) => `<span class="star ${done && i < (saved?.stars || 0) ? 'on' : ''}">${icon('star')}</span>`)
      .join('')}</div>
    <div class="node-label ${locked ? 'node-label--muted' : ''}">${escapeHtml(label)}</div>
  </div>`;
}

function renderReviewNode(app, unit, node) {
  const current = node.state === 'review-current';
  const locked = node.state === 'locked';
  const done = node.state === 'done';
  return `<div class="node-wrap">
    ${current ? `<span class="start-bubble">Review</span>` : ''}
    <button class="node ${current ? 'node--current node--review' : done ? 'node--review' : 'node--locked'}"
      data-review="${unit.id}" aria-label="Unit review${locked ? ' (locked)' : ''}" ${locked ? 'aria-disabled="true"' : ''}>
      ${icon(locked ? 'lock' : done ? 'check' : 'crown')}
    </button>
    <div class="node-stars">${done ? `<span class="star on">${icon('star')}</span>` : ''}</div>
    <div class="node-label ${locked ? 'node-label--muted' : ''}">${locked ? ' ' : 'Unit review'}</div>
  </div>`;
}

export function mountHome(app) {
  document.querySelectorAll('[data-lesson]').forEach((button) => {
    button.addEventListener('click', () => {
      const lesson = UNITS.flatMap((unit) => unit.lessons).find((item) => item.id === button.dataset.lesson);
      if (!lesson) return;
      if (button.classList.contains('node--locked')) {
        app.toast('Finish the previous lesson first.');
        return;
      }
      if (app.state.hearts <= 0 && !app.state.profile.unlimitedHearts) {
        app.showHeartsGate();
        return;
      }
      app.startLesson(lesson);
    });
  });

  document.querySelectorAll('[data-review]').forEach((button) => {
    button.addEventListener('click', () => {
      const unit = UNITS.find((item) => item.id === button.dataset.review);
      if (!unit) return;
      if (button.classList.contains('node--locked')) {
        app.toast('Finish all three lessons to unlock the review.');
        return;
      }
      const words = unit.lessons.flatMap((lesson) => lesson.words);
      const session = buildReviewSession(words, { limit: 12, seed: unit.id });
      session.title = `${unit.title} review`;
      session.subtitle = 'Mixed practice';
      session.reviewUnitId = unit.id;
      app.startSession(session);
    });
  });

  document.querySelectorAll('[data-guide]').forEach((button) => {
    button.addEventListener('click', () => openGuide(app, button.dataset.guide));
  });
}

export function openGuide(app, unitId) {
  const unit = UNITS.find((item) => item.id === unitId);
  if (!unit) return;
  const words = unit.lessons.flatMap((lesson) => lesson.words);
  app.openModal(`<div class="modal-grab"></div>
    <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
    <span class="eyebrow">Unit ${unit.number} guidebook</span>
    <h2>${escapeHtml(unit.title)}</h2>
    <p class="modal-sub">${escapeHtml(unit.subtitle)} · ${words.length} words</p>
    <div style="margin-top:12px">
      ${unit.lessons
        .map(
          (lesson) => `<div class="grammar-item">
            <h3>${escapeHtml(lesson.title)}</h3>
            <span class="pattern">${escapeHtml(lesson.grammar.pattern)}</span>
            <p>${escapeHtml(lesson.grammar.body)}</p>
          </div>`
        )
        .join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-dismiss>Got it</button>
    </div>`);
}

export function drawPathLines() {
  document.querySelectorAll('.path').forEach((path) => {
    const svg = path.querySelector('.path-line');
    const nodes = [...path.querySelectorAll('.node')];
    if (!svg || nodes.length < 2) return;
    const rect = path.getBoundingClientRect();
    if (!rect.width) return;
    const points = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { x: box.left - rect.left + box.width / 2, y: box.top - rect.top + box.height / 2 };
    });
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
    const color = getComputedStyle(path).getPropertyValue('--u').trim() || '#e8503a';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i += 1) {
      const from = points[i - 1];
      const to = points[i];
      const mid = (from.y + to.y) / 2;
      d += ` C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${to.y}`;
    }
    const current = Number(path.dataset.current || 0);
    let progressD = '';
    if (current > 0) {
      progressD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i <= Math.min(current, points.length - 1); i += 1) {
        const from = points[i - 1];
        const to = points[i];
        const mid = (from.y + to.y) / 2;
        progressD += ` C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${to.y}`;
      }
    }
    svg.innerHTML = `
      <path d="${d}" stroke="#e7d9ca" stroke-width="7" stroke-dasharray="1 14" opacity=".9" />
      ${progressD ? `<path d="${progressD}" stroke="${color}" stroke-width="7" stroke-dasharray="1 14" opacity=".55" />` : ''}
      <path d="${d}" stroke="${color}" stroke-width="2" stroke-dasharray="1 19" opacity=".22" />`;
  });
}

export function nextNodeLabel(app) {
  const order = lessonOrder();
  const next = nextLessonId(app.state, order);
  const lesson = UNITS.flatMap((unit) => unit.lessons).find((item) => item.id === next);
  return lesson?.title || 'Review';
}
