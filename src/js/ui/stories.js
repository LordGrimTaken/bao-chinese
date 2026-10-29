import { STORIES, STORY_BY_ID } from '../../data/stories.js';
import { escapeHtml, icon, panda } from './common.js';

export function openStory(app, storyId) {
  if (!STORY_BY_ID.has(storyId)) return;
  app.route = {
    name: 'story',
    storyId,
    done: false,
    rewarded: false,
    answered: 0,
  };
  app.session = null;
  app.closeModal();
  app.render();
  window.scrollTo(0, 0);
}

export function renderStories(app) {
  const completed = app.state.stories || {};
  return `<div class="screen stories-screen">
    <header class="page-header">
      <span class="eyebrow">Graded reading</span>
      <h1>Stories</h1>
      <p>Short scenes built only from words you have met. Pinyin is shown beside each line; tap it for English, then check what you understood.</p>
    </header>

    <div class="story-list">
      ${STORIES.map((story, index) => {
        const done = Boolean(completed[story.id]?.completed);
        return `<button class="story-card story-card--${story.color}" data-story-open="${story.id}">
          <span class="story-emoji" aria-hidden="true">${story.emoji}</span>
          <span class="story-copy">
            <span class="story-meta">Story ${index + 1} · HSK 1 · ${story.lines.length} lines ${done ? '· Read' : ''}</span>
            <strong>${escapeHtml(story.title)}</strong>
            <span>${escapeHtml(story.titleEn)} — ${escapeHtml(story.blurb)}</span>
          </span>
          <span class="story-go">${done ? 'Re-read' : 'Read'} ${icon('arrowRight')}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="story-tip">
      ${panda('happy')}
      <span><b>慢慢来.</b> Pinyin is shown beside each line. Tap for English, replay the audio, and answer without losing hearts.</span>
    </div>
  </div>`;
}

export function mountStories(app) {
  document.querySelectorAll('[data-story-open]').forEach((button) => {
    button.addEventListener('click', () => openStory(app, button.dataset.storyOpen));
  });
}

export function renderStory(app) {
  const story = STORY_BY_ID.get(app.route.storyId) || STORIES[0];
  const done = Boolean(app.route.done);
  const showPinyin = Boolean(app.state.profile.showPinyin);

  if (done) {
    return `<div class="story-reader story-reader--${story.color}">
      <header class="story-top">
        <button class="icon-btn" data-story-action="back" aria-label="Back to stories">${icon('close')}</button>
        <div><span class="eyebrow">Story complete</span><strong>${escapeHtml(story.title)}</strong></div>
        <span class="story-top-count">Read</span>
      </header>
      <section class="story-success">
        ${panda('celebrate')}
        <span class="eyebrow">读得好</span>
        <h1>${escapeHtml(story.title)}</h1>
        <p>You read ${story.lines.length} lines and answered ${story.questions.length} questions.</p>
        <div class="story-success-actions">
          <button class="btn btn-primary" data-story-action="again">Read again</button>
          <button class="btn btn-secondary" data-story-action="back">More stories ${icon('arrowRight')}</button>
        </div>
      </section>
    </div>`;
  }

  return `<div class="story-reader story-reader--${story.color}">
    <header class="story-top">
      <button class="icon-btn" data-story-action="back" aria-label="Back to stories">${icon('close')}</button>
      <div><span class="eyebrow">Graded story</span><strong>${escapeHtml(story.title)}</strong></div>
      <span class="story-top-count">${story.lines.length} lines</span>
    </header>

    <section class="story-hero">
      <span class="story-hero-emoji" aria-hidden="true">${story.emoji}</span>
      <span class="eyebrow">HSK 1 · ${story.lines.length} lines</span>
      <h1>${escapeHtml(story.title)}</h1>
      <p class="story-hero-en">${escapeHtml(story.titleEn)}</p>
      <p>${escapeHtml(story.blurb)}</p>
    </section>

    <div class="story-read-head">
      <span>${showPinyin ? 'Pinyin is on. Tap a line for English.' : 'Tap a line to reveal pinyin and English.'}</span>
      <button class="story-reveal" data-story-action="reveal">Show all</button>
    </div>

    <section class="story-lines">
      ${story.lines
        .map(
          (line, index) => `<div class="story-line" data-story-line="${index}">
            <div class="story-line-top">
              <span class="story-speaker">${escapeHtml(line.speaker)}</span>
              <button class="story-hear" data-story-hear="${line.id}" aria-label="Hear line">${icon('speaker')}</button>
            </div>
            <p class="story-zh">${escapeHtml(line.zh)}</p>
            ${showPinyin ? `<p class="story-pinyin">${escapeHtml(line.pinyin)}</p>` : ''}
            <p class="story-en">${escapeHtml(line.en)}</p>
          </div>`
        )
        .join('')}
    </section>

    <section class="story-quiz">
      <div class="story-quiz-head">
        <div><span class="eyebrow">Check understanding</span><h2>Did you catch it?</h2></div>
        <span>${story.questions.length} questions</span>
      </div>
      ${story.questions
        .map(
          (question, qIndex) => `<div class="story-question" data-question="${qIndex}">
            <p class="story-prompt">${escapeHtml(question.prompt)} <span>${escapeHtml(question.en)}</span></p>
            <div class="story-options">
              ${question.options
                .map(
                  (option, oIndex) => `<button class="story-option" data-story-answer data-question="${qIndex}" data-answer="${oIndex}" data-correct="${option.correct ? '1' : '0'}">${escapeHtml(option.zh)}</button>`
                )
                .join('')}
            </div>
            <p class="story-answer-feedback" data-answer-feedback="${qIndex}"></p>
          </div>`
        )
        .join('')}
    </section>

    <p class="story-source">Story text and questions are original, written for this course.</p>
  </div>`;
}

export function mountStory(app) {
  const root = document.querySelector('.story-reader');
  if (!root) return;
  const story = STORY_BY_ID.get(app.route.storyId) || STORIES[0];

  const back = () => app.go('stories');
  root.querySelector('[data-story-action="back"]')?.addEventListener('click', back);
  root.querySelector('[data-story-action="again"]')?.addEventListener('click', () => {
    openStory(app, story.id);
  });

  let allOpen = false;
  root.querySelector('[data-story-action="reveal"]')?.addEventListener('click', (event) => {
    allOpen = !allOpen;
    root.querySelectorAll('[data-story-line]').forEach((line) => line.classList.toggle('open', allOpen));
    event.currentTarget.textContent = allOpen ? 'Hide text' : 'Show all';
  });

  root.querySelectorAll('[data-story-line]').forEach((line) => {
    line.addEventListener('click', () => line.classList.toggle('open'));
  });

  root.querySelectorAll('[data-story-hear]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const line = story.lines.find((item) => item.id === button.dataset.storyHear);
      if (line) app.speak(line.zh);
    });
  });

  root.querySelectorAll('[data-story-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = root.querySelector(`[data-question="${button.dataset.question}"] .story-options`);
      if (!group || button.disabled) return;
      const feedback = root.querySelector(`[data-answer-feedback="${button.dataset.question}"]`);

      if (button.dataset.correct === '1') {
        button.classList.add('is-correct');
        group.querySelectorAll('button').forEach((item) => {
          item.disabled = true;
        });
        if (feedback) feedback.textContent = '对！';
        app.sfx?.('correct');
        app.vibrate?.(10);
        app.route.answered = (app.route.answered || 0) + 1;

        if (app.route.answered >= story.questions.length) {
          if (!app.route.rewarded) {
            app.route.rewarded = true;
            app.state.xp = (app.state.xp || 0) + 10;
            app.state.stories = app.state.stories || {};
            app.state.stories[story.id] = { completed: true, at: new Date().toISOString() };
            app.save();
            app.toast('+10 XP — story complete', 'good');
          }
          app.route.done = true;
          app.sfx?.('complete');
          app.vibrate?.([18, 40, 18]);
          app.render();
        }
      } else {
        button.classList.add('is-wrong');
        button.disabled = true;
        if (feedback) feedback.textContent = '再试一次 — read the line again.';
        app.sfx?.('wrong');
        app.vibrate?.(6);
      }
    });
  });
}
