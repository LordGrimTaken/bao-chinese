import {
  DRILL_WORDS,
  LESSONS,
  LESSON_BY_ID,
  UNITS,
  WORD_BY_ID,
} from '../data/course.js';
import {
  HEART_REFILL_COST,
  HEARTS_MAX,
  STREAK_FREEZE_COST,
  STREAK_FREEZE_MAX,
  addDays,
  applySession,
  dateKey,
  defaultState,
  dueWords,
  ensureDaily,
  formatCountdown,
  hydrateState,
  loadState,
  nextHeartInMs,
  purchase,
  refreshHearts,
  saveState,
} from './core.js';
import { initAudio, setSoundEnabled, sfx, speak, vibrate } from './audio.js';
import { buildLessonSession, buildTonePairSession } from './lesson-engine.js';
import { icon, panda } from './ui/common.js';
import { drawPathLines, renderHome, mountHome } from './ui/home.js';
import { renderLesson, mountLesson, handleLessonKey } from './ui/lesson.js';
import { renderOnboarding, mountOnboarding } from './ui/onboarding.js';
import { renderProfile, mountProfile } from './ui/profile.js';
import { renderReview, mountReview } from './ui/review.js';
import { renderWords, mountWords, openWord } from './ui/words.js';
import { initUpdater, showUpdateSheet } from './updater.js';

const root = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');

const app = {
  state: loadState(localStorage),
  route: { name: 'learn' },
  onboarding: { step: 0, reason: '', goalXp: 30, name: '' },
  session: null,
  wordsView: { query: '', filter: 'all' },
  installPrompt: null,
  modal: null,
  _modalTimer: null,
  _scrollToCurrent: false,

  render() {
    const now = new Date();
    ensureDaily(this.state, now);
    refreshHearts(this.state, now);
    if (this.state.profile.onboarded === false) {
      root.innerHTML = renderOnboarding(this);
      root.classList.remove('app--lesson');
      mountOnboarding(this);
    } else if (this.route.name === 'lesson' && this.session) {
      root.classList.add('app--lesson');
      root.innerHTML = renderLesson(this);
      mountLesson(this);
    } else {
      root.classList.remove('app--lesson');
      const screen = this.route.name;
      let html = '';
      if (screen === 'review') html = renderReview(this);
      else if (screen === 'words') html = renderWords(this);
      else if (screen === 'profile') html = renderProfile(this);
      else html = renderHome(this);
      root.innerHTML = html + this.renderNav();
      if (screen === 'review') mountReview(this);
      else if (screen === 'words') mountWords(this);
      else if (screen === 'profile') mountProfile(this);
      else mountHome(this);
      requestAnimationFrame(() => {
        drawPathLines();
        if (this._scrollToCurrent && screen === 'learn') {
          this._scrollToCurrent = false;
          document.querySelector('.node--current')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    }
    document.body.classList.toggle('is-lesson', this.route.name === 'lesson');
    this.bindGlobal();
  },

  renderNav() {
    if (this.state.profile.onboarded === false) return '';
    const due = dueWords(this.state).length;
    const items = [
      ['learn', 'Learn', 'play'],
      ['review', 'Review', 'target'],
      ['words', 'Words', 'book'],
      ['profile', 'Me', 'user'],
    ];
    return `<nav class="bottom-nav" aria-label="Main navigation">
      ${items
        .map(
          ([id, label, iconName]) => `<button class="nav-item ${this.route.name === id ? 'active' : ''}" data-nav="${id}">
            ${icon(iconName)}
            <span>${label}</span>
            ${id === 'review' && due ? `<span class="nav-dot"></span>` : ''}
          </button>`
        )
        .join('')}
    </nav>`;
  },

  bindGlobal() {
    root.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => this.go(button.dataset.nav));
    });
    root.querySelectorAll('[data-action]').forEach((button) => {
      if (button.dataset.action === 'shop') button.addEventListener('click', () => this.openShop());
      if (button.dataset.action === 'hearts') button.addEventListener('click', () => this.openHeartsInfo());
      if (button.dataset.action === 'streak') {
        button.addEventListener('click', () =>
          this.toast(
            this.state.streak
              ? `🔥 ${this.state.streak}-day streak. Longest: ${this.state.longestStreak || this.state.streak}.`
              : 'Finish a lesson today to start a streak.'
          )
        );
      }
    });
  },

  go(name) {
    if (name === 'lesson') return;
    this.session = null;
    this.route = { name };
    this._scrollToCurrent = name === 'learn';
    this.closeModal();
    this.render();
    window.scrollTo(0, 0);
  },

  save() {
    saveState(this.state, localStorage);
  },

  speak(text) {
    return speak(text, { slow: Boolean(this.state.profile.slowAudio) });
  },

  sfx,
  vibrate,

  setSound(enabled) {
    setSoundEnabled(enabled);
  },

  refreshHearts() {
    refreshHearts(this.state, new Date());
    this.save();
  },

  toast(message, tone = '') {
    const element = document.createElement('div');
    element.className = `toast ${tone}`;
    element.textContent = message;
    toastRoot.appendChild(element);
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-6px)';
      element.style.transition = 'opacity .2s ease, transform .2s ease';
      setTimeout(() => element.remove(), 240);
    }, 2600);
  },

  openModal(html, options = {}) {
    this.modal = options;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop></div>
      <div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
    modalRoot.classList.add('open');
    document.body.classList.add('modal-open');
    const card = modalRoot.querySelector('.modal-card');
    modalRoot.querySelectorAll('[data-dismiss]').forEach((button) => {
      button.addEventListener('click', () => this.closeModal());
    });
    modalRoot.querySelector('[data-backdrop]')?.addEventListener('click', () => {
      if (options.dismissible !== false) this.closeModal();
    });
    options.onMount?.(card);
    setTimeout(() => {
      const target = card?.querySelector('button:not([disabled]), input, [tabindex="0"]');
      target?.focus?.({ preventScroll: true });
    }, 60);
  },

  closeModal() {
    if (this._modalTimer) {
      clearInterval(this._modalTimer);
      this._modalTimer = null;
    }
    modalRoot.classList.remove('open');
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
    this.modal = null;
  },

  startLesson(lesson) {
    if (!lesson) return;
    if (this.state.hearts <= 0 && !this.state.profile.unlimitedHearts) {
      this.showHeartsGate();
      return;
    }
    const attempts = this.state.lessons[lesson.id]?.attempts || 0;
    const data = buildLessonSession(lesson, { seed: `${attempts}:${dateKey(new Date())}` });
    data.lessonId = lesson.id;
    this.startSession(data);
  },

  startSession(data) {
    if (!data || !data.steps?.length) {
      this.toast('This practice is empty right now. Try another mode.');
      return;
    }
    const noHearts = ['tone', 'listening', 'trace', 'word'].includes(data.mode);
    if (!noHearts && this.state.hearts <= 0 && !this.state.profile.unlimitedHearts) {
      this.showHeartsGate();
      return;
    }
    this.closeModal();
    this.route = { name: 'lesson' };
    this.session = {
      data,
      index: 0,
      selection: null,
      buildSelected: [],
      matchSelection: null,
      matchSolved: [],
      checked: false,
      correct: false,
      results: {},
      answered: 0,
      correctCount: 0,
      toneCorrect: 0,
      mistakes: [],
      retryQueue: [],
      retryIds: [],
      startedAt: Date.now(),
      durationMs: 0,
      scrollTop: 0,
      outOfHearts: false,
      noHearts,
      result: null,
    };
    this.render();
    window.scrollTo(0, 0);
  },

  finishSession() {
    const session = this.session;
    if (!session) return;
    if (session.outOfHearts) {
      this.showHeartsGate({
        onRefill: () => {
          session.outOfHearts = false;
          this.finishSession();
        },
      });
      return;
    }
    const data = session.data;
    session.durationMs = Date.now() - session.startedAt;
    const result = applySession(
      this.state,
      {
        mode: data.mode || 'lesson',
        lessonId: data.lessonId,
        reviewUnitId: data.reviewUnitId,
        wordResults: session.results,
        answered: session.answered,
        correct: session.correctCount,
        toneCorrect: session.toneCorrect,
        durationMs: session.durationMs,
      },
      new Date()
    );
    session.result = result;
    this.save();
    refreshHearts(this.state, new Date());
    this.render();
  },

  nextLessonAfter(lessonId) {
    const index = LESSONS.findIndex((lesson) => lesson.id === lessonId);
    if (index < 0) return null;
    return LESSONS[index + 1] || null;
  },

  confirmExitLesson() {
    if (!this.session || this.session.result) {
      this.abandonLesson();
      return;
    }
    this.openModal(`<div class="modal-grab"></div>
      ${panda('sad')}
      <h2 style="text-align:center;margin-top:4px">Leave this lesson?</h2>
      <p class="modal-sub" style="text-align:center">Your answers in this attempt won't count, but your streak is safe.</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-dismiss>Keep learning</button>
        <button class="btn btn-secondary" data-quit-lesson>Leave lesson</button>
      </div>`, {
      onMount: (card) => {
        card.querySelector('[data-quit-lesson]')?.addEventListener('click', () => this.abandonLesson());
      },
    });
  },

  abandonLesson() {
    this.session = null;
    this.route = { name: 'learn' };
    this.closeModal();
    this.render();
  },

  openHeartsInfo() {
    if (this.state.profile.unlimitedHearts) {
      this.toast('Practice mode is on — hearts are unlimited. ❤️');
      return;
    }
    refreshHearts(this.state, new Date());
    if (this.state.hearts >= HEARTS_MAX) {
      this.toast('Hearts are full. You lose one only when you miss a question.');
      return;
    }
    const ms = nextHeartInMs(this.state, new Date());
    this.openModal(`<div class="modal-grab"></div>
      <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
      <div style="text-align:center">${panda('sad')}</div>
      <h2 style="text-align:center">${this.state.hearts} heart${this.state.hearts === 1 ? '' : 's'} left</h2>
      <p class="modal-sub" style="text-align:center">A new heart arrives in <strong id="heart-timer">${formatCountdown(ms)}</strong>. Or refill now for ${HEART_REFILL_COST} gems.</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-refill-hearts>Refill for ${icon('gem')} ${HEART_REFILL_COST}</button>
        <button class="btn btn-secondary" data-dismiss>Wait for it</button>
      </div>`, {
      onMount: (card) => {
        card.querySelector('[data-refill-hearts]')?.addEventListener('click', () => {
          const result = purchase(this.state, 'hearts', new Date());
          if (!result.ok) {
            this.toast(result.reason === 'full' ? 'Hearts are already full.' : 'Not enough gems. Practice to earn more.', 'bad');
            return;
          }
          this.save();
          this.closeModal();
          this.toast('Hearts refilled. 加油!', 'good');
          this.render();
        });
        this._modalTimer = setInterval(() => {
          const remaining = nextHeartInMs(this.state, new Date());
          const timer = document.querySelector('#heart-timer');
          if (timer) timer.textContent = formatCountdown(remaining);
          if (remaining <= 0) {
            this.closeModal();
            this.render();
          }
        }, 1000);
      },
    });
  },

  showHeartsGate({ onRefill } = {}) {
    refreshHearts(this.state, new Date());
    const ms = nextHeartInMs(this.state, new Date());
    const canRefill = this.state.gems >= HEART_REFILL_COST;
    const inLesson = this.route.name === 'lesson';
    this.openModal(`<div class="modal-grab"></div>
      <div style="text-align:center">${panda('sad')}</div>
      <h2 style="text-align:center">Out of hearts</h2>
      <p class="modal-sub" style="text-align:center">Mistakes happen — that's how learning works. A new heart arrives in <strong id="heart-timer">${formatCountdown(ms)}</strong>.</p>
      <div class="modal-actions">
        <button class="btn btn-red" data-gate-refill ${canRefill ? '' : 'disabled'}>Refill for ${icon('gem')} ${HEART_REFILL_COST}</button>
        <button class="btn btn-secondary" data-gate-practice>Practice to earn hearts</button>
        <button class="btn btn-ghost" data-gate-quit>${inLesson ? 'Leave lesson' : 'Close'}</button>
      </div>`, {
      dismissible: false,
      onMount: (card) => {
        card.querySelector('[data-gate-refill]')?.addEventListener('click', () => {
          const result = purchase(this.state, 'hearts', new Date());
          if (!result.ok) {
            this.toast('Not enough gems yet. Practice earns gems and hearts.', 'bad');
            return;
          }
          this.save();
          this.closeModal();
          this.toast('Hearts refilled. Back at it!', 'good');
          this.render();
          onRefill?.();
        });
        card.querySelector('[data-gate-practice]')?.addEventListener('click', () => {
          this.closeModal();
          this.session = null;
          this.route = { name: 'review' };
          this.render();
          window.scrollTo(0, 0);
          this.toast('Practice is free — no hearts needed here.');
        });
        card.querySelector('[data-gate-quit]')?.addEventListener('click', () => {
          if (inLesson) this.abandonLesson();
          else this.closeModal();
        });
        this._modalTimer = setInterval(() => {
          const timer = document.querySelector('#heart-timer');
          if (timer) timer.textContent = formatCountdown(nextHeartInMs(this.state, new Date()));
        }, 1000);
      },
    });
  },

  openShop() {
    refreshHearts(this.state, new Date());
    const full = this.state.hearts >= HEARTS_MAX;
    const freezeFull = this.state.freezes >= STREAK_FREEZE_MAX;
    this.openModal(`<div class="modal-grab"></div>
      <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
      <span class="eyebrow">Bao's pantry</span>
      <h2>Shop</h2>
      <div class="shop-balance">${icon('gem')} ${this.state.gems} gems</div>
      <p class="modal-sub">Earn gems by finishing lessons. Spend them on a little breathing room.</p>
      <div style="margin-top:10px">
        <div class="shop-item">
          <span class="shop-icon">${icon('freeze')}</span>
          <span class="shop-item-copy"><strong>Streak freeze</strong><span>Protects your streak for one missed day. Up to ${STREAK_FREEZE_MAX}.</span></span>
          <button class="shop-buy" data-buy="freeze" ${freezeFull || this.state.gems < STREAK_FREEZE_COST ? 'disabled' : ''}>${freezeFull ? 'Full' : `${STREAK_FREEZE_COST} gems`}</button>
        </div>
        <div class="shop-item">
          <span class="shop-icon blue">${icon('heart')}</span>
          <span class="shop-item-copy"><strong>Heart refill</strong><span>Back to ${HEARTS_MAX} hearts. A new one normally arrives every 15 minutes.</span></span>
          <button class="shop-buy" data-buy="hearts" ${full || this.state.gems < HEART_REFILL_COST ? 'disabled' : ''}>${full ? 'Full' : `${HEART_REFILL_COST} gems`}</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" data-dismiss>Done</button>
      </div>`, {
      onMount: (card) => {
        card.querySelectorAll('[data-buy]').forEach((button) => {
          button.addEventListener('click', () => {
            const result = purchase(this.state, button.dataset.buy, new Date());
            if (!result.ok) {
              this.toast(result.reason === 'gems' ? 'Not enough gems yet.' : 'You are already topped up.', 'bad');
              return;
            }
            this.save();
            this.toast('Purchased. 谢谢!', 'good');
            this.openShop();
          });
        });
      },
    });
  },

  openGoalSheet() {
    const goals = [
      [15, 'Casual', '5 min a day'],
      [30, 'Regular', '10 min a day'],
      [50, 'Serious', '15 min a day'],
      [70, 'Intense', '20 min a day'],
    ];
    this.openModal(`<div class="modal-grab"></div>
      <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
      <h2>Daily goal</h2>
      <p class="modal-sub">Pick a pace you can keep on a busy day.</p>
      <div class="goal-list">
        ${goals
          .map(
            ([xp, label, note]) => `<button class="goal ${this.state.profile.dailyGoalXp === xp ? 'selected' : ''}" data-goal-xp="${xp}">
              <span class="goal-radio"></span>
              <span class="goal-copy"><strong>${label}</strong><span>${note}</span></span>
              <span class="goal-xp">${xp} XP</span>
            </button>`
          )
          .join('')}
      </div>`, {
      onMount: (card) => {
        card.querySelectorAll('[data-goal-xp]').forEach((button) => {
          button.addEventListener('click', () => {
            this.state.profile.dailyGoalXp = Number(button.dataset.goalXp);
            this.save();
            this.closeModal();
            this.render();
            this.toast(`Daily goal set to ${button.dataset.goalXp} XP.`);
          });
        });
      },
    });
  },

  install() {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      this.installPrompt.userChoice?.then((choice) => {
        if (choice.outcome === 'accepted') this.toast('Installed! Bao is on your home screen.', 'good');
        this.installPrompt = null;
        this.render();
      });
    } else {
      this.toast('Open your browser menu and choose “Add to Home screen” to install.');
    }
  },

  exportProgress() {
    try {
      const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `bao-chinese-progress-${dateKey(new Date())}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.toast('Backup downloaded.', 'good');
    } catch {
      this.toast('Could not download the backup. Try the browser share menu.', 'bad');
    }
  },

  importProgress(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.toast('That is not a valid Bao backup.', 'bad');
      return;
    }
    if (!parsed || parsed.version !== 1) {
      this.toast('This backup version is not supported.', 'bad');
      return;
    }
    this.openModal(`<div class="modal-grab"></div>
      <h2>Restore this backup?</h2>
      <p class="modal-sub">It contains ${parsed.xp || 0} XP and ${Object.keys(parsed.lessons || {}).length} finished lessons. Your current progress will be replaced.</p>
      <div class="modal-actions">
        <button class="btn btn-red" data-confirm-import>Restore backup</button>
        <button class="btn btn-secondary" data-dismiss>Cancel</button>
      </div>`, {
      onMount: (card) => {
        card.querySelector('[data-confirm-import]')?.addEventListener('click', () => {
          this.state = hydrateState(parsed, new Date());
          this.save();
          this.closeModal();
          this.route = { name: 'learn' };
          this.render();
          this.toast('Progress restored. Welcome back!', 'good');
        });
      },
    });
  },

  confirmReset() {
    this.openModal(`<div class="modal-grab"></div>
      <h2>Start over?</h2>
      <p class="modal-sub">This erases your streak, XP, words, and lesson progress on this device. It cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-red" data-confirm-reset>Yes, reset everything</button>
        <button class="btn btn-secondary" data-dismiss>Keep my progress</button>
      </div>`, {
      onMount: (card) => {
        card.querySelector('[data-confirm-reset]')?.addEventListener('click', () => {
          this.state = defaultState(new Date());
          this.onboarding = { step: 0, reason: '', goalXp: 30, name: '' };
          this.session = null;
          this.save();
          this.closeModal();
          this.route = { name: 'learn' };
          this.render();
          this.toast('Fresh start. 你好 again!');
        });
      },
    });
  },

  openWord(wordId) {
    openWord(this, wordId);
  },

  handleBack() {
    if (modalRoot.classList.contains('open')) {
      this.closeModal();
      return true;
    }
    if (this.route.name === 'lesson') {
      this.confirmExitLesson();
      return true;
    }
    if (this.route.name !== 'learn') {
      this.go('learn');
      return true;
    }
    return false;
  },
};

window.BaoApp = app;

function bindDocumentEvents() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalRoot.classList.contains('open')) {
      event.preventDefault();
      app.closeModal();
      return;
    }
    if (app.route.name === 'lesson') handleLessonKey(app, event);
  });

  window.addEventListener('resize', () => {
    if (app.route.name === 'learn') drawPathLines();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const before = app.state.daily.date;
      ensureDaily(app.state, new Date());
      if (app.state.daily.date !== before) app.render();
    }
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    app.installPrompt = event;
    if (app.route.name === 'profile') app.render();
  });
}

function startHeartTicker() {
  setInterval(() => {
    if (app.route.name === 'lesson') return;
    refreshHearts(app.state, new Date());
    const header = document.querySelector('.stat--hearts span');
    if (header) header.textContent = String(app.state.hearts);
  }, 30000);
}

function seedDemoState() {
  const now = new Date();
  const today = dateKey(now);
  const state = defaultState(now);
  Object.assign(state.profile, {
    name: 'Austin',
    reason: 'culture',
    dailyGoalXp: 30,
    onboarded: true,
  });
  state.xp = 185;
  state.gems = 240;
  state.hearts = 4;
  state.heartsAt = now.toISOString();
  state.streak = 4;
  state.longestStreak = 6;
  state.lastActiveDate = today;
  state.freezes = 1;
  state.daily = { date: today, xp: 35, lessons: 2 };
  state.history = {
    [addDays(today, -6)]: 15,
    [addDays(today, -5)]: 30,
    [addDays(today, -4)]: 0,
    [addDays(today, -3)]: 15,
    [addDays(today, -2)]: 50,
    [addDays(today, -1)]: 30,
    [today]: 35,
  };
  const completed = [
    ['u1l1', 3],
    ['u1l2', 2],
    ['u1l3', 3],
    ['u2l1', 2],
  ];
  for (const [id, starCount] of completed) {
    state.lessons[id] = {
      completed: true,
      stars: starCount,
      bestAccuracy: starCount === 3 ? 1 : 0.86,
      attempts: 1,
      at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    };
  }
  state.reviews.u1 = { completed: true, at: now.toISOString(), bestAccuracy: 0.9, attempts: 1 };
  state.achievements = {
    first_lesson: now.toISOString(),
    streak_3: now.toISOString(),
    words_25: now.toISOString(),
    xp_100: now.toISOString(),
  };
  state.stats = { answered: 186, correct: 164, minutes: 48, sessions: 14, toneCorrect: 19 };
  DRILL_WORDS.slice(0, 44).forEach((word, index) => {
    const dueOffset = index < 11 ? -1 : 2 + (index % 7);
    state.words[word.id] = {
      ease: 2.5,
      interval: index < 11 ? 3 : 1 + (index % 9),
      reps: index < 11 ? 2 : 1,
      lapses: index % 7 === 0 ? 1 : 0,
      due: addDays(today, dueOffset),
      seen: 1 + (index % 4),
      correct: 1 + (index % 3),
      wrong: index % 7 === 0 ? 1 : 0,
      last: addDays(today, -1),
    };
  });
  return state;
}

function applyDemo() {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');
  if (!demo) return;
  if (demo === 'onboarding') {
    app.state = defaultState(new Date());
    app.route = { name: 'learn' };
    app.render();
    return;
  }
  app.state = seedDemoState();
  if (demo === 'home' || demo === 'landing') {
    app.route = { name: 'learn' };
    app.render();
  } else if (demo === 'review') {
    app.route = { name: 'review' };
    app.render();
  } else if (demo === 'unit9') {
    for (const lesson of LESSONS.filter((item) => item.unitNumber <= 8)) {
      app.state.lessons[lesson.id] = {
        completed: true,
        stars: 3,
        bestAccuracy: 1,
        attempts: 1,
        at: new Date().toISOString(),
      };
    }
    app.state.xp = 1480;
    app.state.streak = 12;
    app.state.longestStreak = 18;
    app.state.daily = { date: dateKey(new Date()), xp: 35, lessons: 2 };
    app.route = { name: 'learn' };
    app.render();
    setTimeout(() => {
      document.querySelector('.node--current:not(.node--review)')?.closest('.unit-section')?.scrollIntoView({ block: 'start' });
    }, 350);
  } else if (demo === 'tone-pairs') {
    app.route = { name: 'learn' };
    app.render();
    app.startSession(buildTonePairSession({ limit: 8 }));
  } else if (demo === 'words') {
    app.route = { name: 'words' };
    app.render();
  } else if (demo === 'profile') {
    app.route = { name: 'profile' };
    app.render();
  } else if (demo === 'lesson') {
    app.route = { name: 'learn' };
    app.render();
    app.startLesson(LESSON_BY_ID.get(params.get('lesson') || 'u2l2'));
    const type = params.get('type');
    if (type && app.session) {
      const index = app.session.data.steps.findIndex((step) => step.type === type);
      if (index >= 0) {
        app.session.index = index;
        app.render();
      }
    }
  } else if (demo === 'update') {
    app.route = { name: 'profile' };
    app.render();
    showUpdateSheet(app, {
      version: '0.1.2',
      notes: '• Tone-pair gym with minimal pairs\n• Native-speaker audio for every word\n• Faster lesson start and smoother tracing\n• Bug fixes and polish',
      url: 'https://github.com/LordGrimTaken/bao-chinese/releases/latest',
      size: 1258291,
      digest: '',
      pageUrl: 'https://github.com/LordGrimTaken/bao-chinese/releases',
    }, { manual: true });
  } else if (demo === 'complete') {
    app.route = { name: 'lesson' };
    app.session = {
      data: { mode: 'lesson', lessonId: 'u2l2', steps: [] },
      mistakes: [],
      answered: 18,
      correctCount: 16,
      durationMs: 254000,
      result: {
        xp: 13,
        gems: 3,
        accuracy: 0.89,
        stars: 2,
        mode: 'lesson',
        streak: 5,
        streakIncreased: true,
        newAchievements: [],
        leveledUp: false,
        dailyGoalMet: true,
        dailyXp: 48,
        dailyGoalXp: 30,
      },
    };
    app.render();
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  if (window.BaoNative) return;
  navigator.serviceWorker.register('./sw.js').catch(() => {
    /* offline shell is a progressive enhancement */
  });
}

function init() {
  initAudio();
  setSoundEnabled(app.state.profile.sound);
  ensureDaily(app.state, new Date());
  bindDocumentEvents();
  startHeartTicker();
  initUpdater(app);
  applyDemo();
  if (!new URLSearchParams(window.location.search).get('demo')) app.render();
  registerServiceWorker();
}

init();
