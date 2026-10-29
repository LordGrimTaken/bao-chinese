import { brand, panda, icon, escapeHtml } from './common.js';

const REASONS = [
  { id: 'travel', emoji: '✈️', label: 'Travel', note: 'Order, ask, explore' },
  { id: 'family', emoji: '👪', label: 'Family', note: 'Talk with loved ones' },
  { id: 'work', emoji: '💼', label: 'Work', note: 'Open more doors' },
  { id: 'culture', emoji: '🏮', label: 'Culture', note: 'Shows, books, food' },
  { id: 'brain', emoji: '🧠', label: 'Brain training', note: 'A daily challenge' },
  { id: 'curious', emoji: '🐼', label: 'Just curious', note: 'See where it goes' },
];

const GOALS = [
  { xp: 15, minutes: 5, label: 'Casual', note: 'One quick lesson' },
  { xp: 30, minutes: 10, label: 'Regular', note: 'A solid daily habit', recommended: true },
  { xp: 50, minutes: 15, label: 'Serious', note: 'Steady progress' },
  { xp: 70, minutes: 20, label: 'Intense', note: 'Fast track' },
];

function dots(step) {
  return `<div class="onboard-dots" aria-label="Step ${step + 1} of 4">${[0, 1, 2, 3]
    .map((index) => `<span class="onboard-dot ${index === step ? 'active' : ''}"></span>`)
    .join('')}</div>`;
}

function top(app) {
  const step = app.onboarding.step;
  if (step === 0) {
    return `<div class="onboard-top">${brand()}<span class="onboard-skip">1 min setup</span></div>`;
  }
  return `<div class="onboard-top">
    <button class="onboard-skip" data-action="back" aria-label="Go back">${icon('back')}</button>
    ${dots(step)}
    <button class="onboard-skip" data-action="skip">Skip</button>
  </div>`;
}

function stepWelcome(app) {
  return `<div class="onboard-body">
    <div class="hero-panda">${panda('happy')}</div>
    <h1>Chinese, one<br><span class="accent">bite at a time.</span></h1>
    <p class="onboard-sub">Bite-sized lessons, real tones, and characters you'll actually remember. Built for absolute beginners.</p>
    <div class="choice-grid" style="margin-top:26px">
      <div class="choice" style="cursor:default">
        <span class="choice-emoji">🥟</span>
        <span class="choice-label">5-minute lessons</span>
        <span class="choice-note">Fit it into a tea break</span>
      </div>
      <div class="choice" style="cursor:default">
        <span class="choice-emoji">🎵</span>
        <span class="choice-label">Tones first</span>
        <span class="choice-note">Train your ear from day one</span>
      </div>
    </div>
  </div>
  <div class="onboard-footer">
    <button class="btn btn-red btn-block" data-action="next">Let's go ${icon('arrowRight')}</button>
    <p class="onboard-sub" style="font-size:11.5px;margin-top:10px">No account. No ads. Your progress stays on this device.</p>
  </div>`;
}

function stepReason(app) {
  return `<div class="onboard-body">
    <span class="eyebrow">A little about you</span>
    <h2>Why are you learning Chinese?</h2>
    <p class="onboard-lead">Bao will use this to keep your lessons relevant.</p>
    <div class="choice-grid">
      ${REASONS.map(
        (reason) => `<button class="choice ${app.onboarding.reason === reason.id ? 'selected' : ''}" data-reason="${reason.id}">
          <span class="choice-emoji">${reason.emoji}</span>
          <span class="choice-label">${reason.label}</span>
          <span class="choice-note">${reason.note}</span>
        </button>`
      ).join('')}
    </div>
  </div>
  <div class="onboard-footer">
    <button class="btn btn-primary btn-block" data-action="next" ${app.onboarding.reason ? '' : 'disabled'}>Continue</button>
  </div>`;
}

function stepGoal(app) {
  return `<div class="onboard-body">
    <span class="eyebrow">Your pace</span>
    <h2>How much time a day?</h2>
    <p class="onboard-lead">A small goal you keep beats a big goal you skip.</p>
    <div class="goal-list">
      ${GOALS.map(
        (goal) => `<button class="goal ${app.onboarding.goalXp === goal.xp ? 'selected' : ''}" data-goal="${goal.xp}">
          <span class="goal-radio"></span>
          <span class="goal-copy"><strong>${goal.label} · ${goal.minutes} min</strong><span>${goal.note}</span></span>
          <span class="goal-xp">${goal.xp} XP</span>
        </button>`
      ).join('')}
    </div>
  </div>
  <div class="onboard-footer">
    <button class="btn btn-primary btn-block" data-action="next">Continue</button>
  </div>`;
}

function stepName(app) {
  return `<div class="onboard-body">
    <span class="eyebrow">Last thing</span>
    <h2>What should Bao call you?</h2>
    <p class="onboard-lead">A name for your profile. You can change it later.</p>
    <input class="name-input" id="name-input" maxlength="24" autocomplete="given-name" placeholder="Your name or nickname" value="${escapeHtml(app.onboarding.name)}" />
    <div class="privacy-note">${icon('shield')}<span>Everything is stored locally on this device. No sign-up, no email, no tracking. You can export your progress anytime.</span></div>
  </div>
  <div class="onboard-footer">
    <button class="btn btn-red btn-block" data-action="finish">Start learning ${icon('arrowRight')}</button>
  </div>`;
}

export function renderOnboarding(app) {
  const steps = [stepWelcome, stepReason, stepGoal, stepName];
  return `<div class="onboard">${top(app)}${steps[app.onboarding.step](app)}</div>`;
}

export function mountOnboarding(app) {
  const root = document.querySelector('.onboard');
  if (!root) return;

  root.querySelectorAll('[data-reason]').forEach((button) => {
    button.addEventListener('click', () => {
      app.onboarding.reason = button.dataset.reason;
      app.render();
    });
  });

  root.querySelectorAll('[data-goal]').forEach((button) => {
    button.addEventListener('click', () => {
      app.onboarding.goalXp = Number(button.dataset.goal);
      app.render();
    });
  });

  const name = root.querySelector('#name-input');
  name?.addEventListener('input', () => {
    app.onboarding.name = name.value;
  });
  name?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      finish(app);
    }
  });

  root.querySelector('[data-action="next"]')?.addEventListener('click', () => {
    const step = app.onboarding.step;
    if (step === 1 && !app.onboarding.reason) return;
    app.onboarding.step = Math.min(3, step + 1);
    app.render();
  });

  root.querySelector('[data-action="back"]')?.addEventListener('click', () => {
    app.onboarding.step = Math.max(0, app.onboarding.step - 1);
    app.render();
  });

  root.querySelector('[data-action="skip"]')?.addEventListener('click', () => {
    if (app.onboarding.step === 3) {
      app.onboarding.name = app.onboarding.name || 'friend';
      finish(app);
    } else {
      app.onboarding.step = Math.min(3, app.onboarding.step + 1);
      app.render();
    }
  });

  root.querySelector('[data-action="finish"]')?.addEventListener('click', () => finish(app));
  if (app.onboarding.step === 3) {
    setTimeout(() => name?.focus({ preventScroll: true }), 120);
  }
}

function finish(app) {
  const name = (app.onboarding.name || '').trim() || 'friend';
  app.state.profile.name = name.slice(0, 24);
  app.state.profile.reason = app.onboarding.reason || 'curious';
  app.state.profile.dailyGoalXp = app.onboarding.goalXp || 30;
  app.state.profile.onboarded = true;
  app.save();
  app.go('learn');
  app.toast(`你好, ${name}! Your first lesson is ready.`, 'good');
}
