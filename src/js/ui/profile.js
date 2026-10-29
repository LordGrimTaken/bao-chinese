import { ACHIEVEMENTS, addDays, dateKey, levelInfo, studiedWords } from '../core.js';
import { escapeHtml, formatNumber, icon, panda } from './common.js';

const REASON_LABELS = {
  travel: 'Travelling to Chinese-speaking places',
  family: 'Connecting with family',
  work: 'Growing at work',
  culture: 'Exploring the culture',
  brain: 'Training the brain',
  curious: 'Following curiosity',
};

export function renderProfile(app) {
  const state = app.state;
  const level = levelInfo(state.xp);
  const words = studiedWords(state).length;
  const lessons = Object.values(state.lessons).filter((lesson) => lesson.completed).length;
  const name = state.profile.name || 'friend';
  const joinDate = new Date(state.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const history = state.history || {};
  const version = window.BaoNative?.getVersionName?.() || '0.7.0';

  return `<div class="screen">
    <header class="page-header">
      <span class="eyebrow">Your progress</span>
      <h1>Me</h1>
      <p>${escapeHtml(REASON_LABELS[state.profile.reason] || 'Learning Chinese, one bite at a time.')}</p>
    </header>

    <section class="profile-hero">
      <div class="profile-id">
        <div class="avatar">${panda('happy')}</div>
        <div>
          <h2>${escapeHtml(name)}</h2>
          <p>Level ${level.level} · ${escapeHtml(level.title)} · joined ${joinDate}</p>
        </div>
      </div>
      <div class="level-row">
        <span class="level-badge">L${level.level}</span>
        <span class="level-track"><span style="width:${Math.round(level.progress * 100)}%"></span></span>
        <small>${level.next ? `${level.toNext} XP to L${level.level + 1}` : 'Top level'}</small>
      </div>
    </section>

    <div class="stats-grid">
      ${statCard('flame', 'var(--orange)', '#fdebd9', state.streak, 'Day streak')}
      ${statCard('bolt', 'var(--gold)', 'var(--gold-soft)', formatNumber(state.xp), 'Total XP')}
      ${statCard('book', 'var(--sky)', 'var(--sky-soft)', words, 'Words practised')}
      ${statCard('crown', 'var(--jade)', 'var(--jade-soft)', lessons, 'Lessons finished')}
    </div>

    <section class="section-card">
      <div class="section-card-head">
        <h3>This week</h3>
        <span>${state.longestStreak || 0}-day best streak</span>
      </div>
      ${weekChart(history, state.daily)}
    </section>

    <section class="section-card">
      <div class="section-card-head">
        <h3>Achievements</h3>
        <span>${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</span>
      </div>
      <div class="achv-grid">
        ${ACHIEVEMENTS.map((achievement) => {
          const unlocked = Boolean(state.achievements[achievement.id]);
          return `<button class="achv ${unlocked ? 'unlocked' : ''}" data-achievement="${achievement.id}" title="${escapeHtml(achievement.desc)}">
            <div class="achv-emoji">${achievement.icon}</div>
            <strong>${escapeHtml(achievement.title)}</strong>
            <span>${unlocked ? 'Unlocked' : escapeHtml(achievement.desc)}</span>
          </button>`;
        }).join('')}
      </div>
    </section>

    <div class="settings-list">
      ${row('target', 'Daily goal', `${state.profile.dailyGoalXp} XP a day`, 'goal', '')}
      ${row('gem', 'Shop & power-ups', `${state.gems} gems · ${state.freezes} freeze${state.freezes === 1 ? '' : 's'}`, 'shop', '')}
      ${toggle('sound', 'volume', 'Sound effects', 'Taps, correct answers, celebrations', state.profile.sound)}
      ${toggle('showPinyin', 'book', 'Always show pinyin', 'Helpful while you are starting out', state.profile.showPinyin)}
      ${toggle('slowAudio', 'clock', 'Slow audio by default', 'Extra time to catch the tones', state.profile.slowAudio)}
      ${toggle('unlimitedHearts', 'heart', 'Unlimited hearts', 'Practice mode — no hearts lost on mistakes', state.profile.unlimitedHearts)}
      ${row('download', 'Check for updates', `Current version ${version}`, 'updates', '')}
      ${row('install', 'Install app', app.installPrompt ? 'Add Bao to your home screen' : 'Use your browser menu → Add to Home screen', 'install', '')}
      ${row('download', 'Export progress', 'Download a JSON backup', 'export', '')}
      ${row('upload', 'Import progress', 'Restore a backup file', 'import', '')}
      ${row('trash', 'Reset progress', 'Start the course again', 'reset', 'danger')}
    </div>

    <input type="file" id="import-file" accept="application/json" class="hidden" />

    <div class="profile-footer">
      ${panda('sleepy', 'small')}
      <div class="brand" style="justify-content:center;margin:6px 0 2px"><span class="brand-mark">包</span><span class="brand-word">Bao Chinese</span></div>
      <div>Version ${version} · HSK 1 starter course</div>
      <div>Made for curious beginners. 慢慢来 — take it slow.</div>
    </div>
  </div>`;
}

function statCard(iconName, accent, soft, value, label) {
  return `<div class="stat-card" style="--accent:${accent};--accent-soft:${soft}">
    <div class="stat-icon">${icon(iconName)}</div>
    <strong>${escapeHtml(String(value))}</strong>
    <span>${label}</span>
  </div>`;
}

function row(iconName, title, subtitle, action, variant) {
  return `<button class="settings-row" data-action="${action}">
    <span class="s-icon" style="${variant === 'danger' ? 'background:var(--red-soft);color:var(--red)' : ''}">${icon(iconName)}</span>
    <span class="settings-copy"><strong style="${variant === 'danger' ? 'color:var(--red-dark)' : ''}">${title}</strong><span>${subtitle}</span></span>
    ${icon('chevron')}
  </button>`;
}

function toggle(setting, iconName, title, subtitle, on) {
  return `<div class="settings-row">
    <span class="s-icon">${icon(iconName)}</span>
    <span class="settings-copy"><strong>${title}</strong><span>${subtitle}</span></span>
    <button class="switch ${on ? 'on' : ''}" data-toggle="${setting}" role="switch" aria-checked="${on}" aria-label="${escapeHtml(title)}"></button>
  </div>`;
}

function weekChart(history, daily) {
  const today = dateKey(new Date());
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = addDays(today, -i);
    const value = key === today ? Math.max(daily.xp || 0, history[key] || 0) : history[key] || 0;
    days.push({ key, value, label: new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' }), today: i === 0 });
  }
  const max = Math.max(15, ...days.map((day) => day.value));
  return `<div class="week-chart">
    ${days
      .map(
        (day) => `<div class="week-col ${day.value ? 'has-xp' : ''} ${day.today ? 'today' : ''}" title="${day.key}: ${day.value} XP">
          <div class="week-bar" style="height:${Math.max(5, (day.value / max) * 100)}%"></div>
          <small>${day.label}</small>
        </div>`
      )
      .join('')}
  </div>`;
}

export function mountProfile(app) {
  document.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.toggle;
      app.state.profile[key] = !app.state.profile[key];
      if (key === 'sound') app.setSound(app.state.profile.sound);
      if (key === 'unlimitedHearts') app.refreshHearts();
      app.save();
      app.render();
    });
  });

  const actions = {
    goal: () => app.openGoalSheet(),
    shop: () => app.openShop(),
    updates: () => app.checkForUpdates(),
    install: () => app.install(),
    export: () => app.exportProgress(),
    import: () => document.querySelector('#import-file')?.click(),
    reset: () => app.confirmReset(),
  };
  document.querySelectorAll('.settings-row[data-action]').forEach((button) => {
    button.addEventListener('click', () => actions[button.dataset.action]?.());
  });

  document.querySelector('#import-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      app.importProgress(text);
    } catch {
      app.toast('That file could not be read.', 'bad');
    }
  });

  document.querySelectorAll('[data-achievement]').forEach((button) => {
    button.addEventListener('click', () => {
      const achievement = ACHIEVEMENTS.find((item) => item.id === button.dataset.achievement);
      if (!achievement) return;
      const unlocked = Boolean(app.state.achievements[achievement.id]);
      app.toast(`${achievement.icon} ${achievement.title} — ${unlocked ? 'unlocked!' : achievement.desc}`);
    });
  });
}
