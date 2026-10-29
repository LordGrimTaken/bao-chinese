import { escapeHtml, icon, panda } from './ui/common.js';

let appRef = null;
let pendingInfo = null;

export function initUpdater(app) {
  appRef = app;

  if (window.BaoNative?.checkForUpdates) {
    window.BaoUpdate = {
      onUpdate(info) {
        const manual = Boolean(app._manualUpdateCheck);
        app._manualUpdateCheck = false;
        showUpdateSheet(app, info, { manual });
      },
      onLatest(version) {
        if (app._manualUpdateCheck) {
          app._manualUpdateCheck = false;
          app.toast(`You're on the latest version (${version}).`, 'good');
        }
      },
      onError(message) {
        if (app._manualUpdateCheck) {
          app._manualUpdateCheck = false;
          app.toast(`Could not check for updates. ${message || ''}`.trim(), 'bad');
        }
      },
      onProgress(percent) {
        updateProgress(percent);
      },
      onInstalling() {
        updateProgress(100);
        const title = document.querySelector('#update-progress-title');
        const copy = document.querySelector('#update-progress-copy');
        if (title) title.textContent = 'Android is installing…';
        if (copy) copy.textContent = 'Confirm the install in the system dialog. Your progress stays on this device.';
        document.querySelector('.update-progress')?.classList.add('is-installing');
      },
      onPermissionNeeded() {
        showPermissionSheet(app, pendingInfo);
      },
      onInstallError(message) {
        app.closeModal();
        app.toast(`Update failed: ${message || 'please try again'}`, 'bad');
      },
    };

    app.checkForUpdates = () => {
      app._manualUpdateCheck = true;
      try {
        window.BaoNative.checkForUpdates(true);
      } catch {
        app.toast('Updates are not available in this build.');
      }
    };

    setTimeout(() => {
      if (app.state.profile.onboarded && app.route.name !== 'lesson') {
        try {
          window.BaoNative.checkForUpdates(false);
        } catch {
          /* offline or bridge unavailable */
        }
      }
    }, 2800);
    return;
  }

  // PWA path: the service worker updates the shell; a reload applies it.
  app.checkForUpdates = async () => {
    if (!('serviceWorker' in navigator)) {
      app.toast('Your browser manages app updates automatically.');
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        app.toast('This page is not installed yet. Reload to get the latest version.');
        return;
      }
      await registration.update();
      app.toast('Update check complete. Reopen the app if a new version is ready.', 'good');
    } catch {
      app.toast('Could not check for updates right now.', 'bad');
    }
  };
}

export function showUpdateSheet(app, info, { manual = false } = {}) {
  pendingInfo = info;
  const dismissed = localStorage.getItem('bao.update.dismissed');
  if (!manual && dismissed === info.version) return;

  const current = window.BaoNative?.getVersionName?.() || '1.0.0';
  const size = info.size ? `${(Number(info.size) / 1048576).toFixed(1)} MB` : '';
  const notes = String(info.notes || '')
    .split('\n')
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => `<p>${escapeHtml(line.replace(/^[-*]\s*/, '• '))}</p>`)
    .join('');

  app.openModal(`<div class="modal-grab"></div>
    <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
    <div class="update-hero">${panda('celebrate')}</div>
    <span class="eyebrow">Update available</span>
    <h2>Bao ${escapeHtml(info.version)} is ready</h2>
    <p class="modal-sub">You're on ${escapeHtml(current)}${size ? ` · ${size}` : ''}. Your streak and progress stay on this device.</p>
    ${notes ? `<div class="update-notes">${notes}</div>` : ''}
    <div class="update-actions">
      <button class="btn btn-primary" data-install-update>Update now ${icon('download')}</button>
      <button class="btn btn-secondary" data-later-update>Later</button>
    </div>
    <p class="update-small">Android will ask you to allow installs from Bao the first time.</p>`, {
    onMount: (card) => {
      card.querySelector('[data-install-update]')?.addEventListener('click', () => {
        startInstall(app, info);
      });
      card.querySelector('[data-later-update]')?.addEventListener('click', () => {
        localStorage.setItem('bao.update.dismissed', info.version);
        app.closeModal();
      });
    },
  });
}

function startInstall(app, info) {
  pendingInfo = info;
  app.closeModal();
  app.openModal(`<div class="modal-grab"></div>
    <div class="update-hero">${panda('happy')}</div>
    <span class="eyebrow">Downloading update</span>
    <h2 id="update-progress-title">Bao ${escapeHtml(info.version)}</h2>
    <p class="modal-sub" id="update-progress-copy">Keep the app open. The APK is downloaded to private storage and checked before Android installs it.</p>
    <div class="update-progress">
      <div class="update-progress-head"><span>Download</span><strong id="update-progress-percent">0%</strong></div>
      <div class="update-progress-track"><div class="update-progress-bar" id="update-progress-bar"></div></div>
    </div>
    <div class="update-actions">
      <button class="btn btn-ghost" data-dismiss>Cancel</button>
    </div>`, {
    dismissible: false,
    onMount: (card) => {
      card.querySelector('[data-dismiss]')?.addEventListener('click', () => app.closeModal());
    },
  });

  try {
    window.BaoNative.installUpdate(
      info.url,
      info.version,
      info.digest || '',
      String(Number(info.size) || 0)
    );
  } catch {
    app.closeModal();
    app.toast('Could not start the update. Try again from Me → Check for updates.', 'bad');
  }
}

function showPermissionSheet(app, info) {
  app.closeModal();
  app.openModal(`<div class="modal-grab"></div>
    <button class="modal-close" data-dismiss aria-label="Close">${icon('close')}</button>
    <div class="update-hero">${panda('think')}</div>
    <span class="eyebrow">One Android setting</span>
    <h2>Allow Bao to install updates</h2>
    <p class="modal-sub">Android requires you to allow installs from Bao once. Open the setting, turn on “Allow from this source”, then come back and tap Update again.</p>
    <div class="update-actions">
      <button class="btn btn-primary" data-open-install-settings>Open settings</button>
      <button class="btn btn-secondary" data-retry-update>I allowed it — retry</button>
    </div>
    <p class="update-small">This is Android's normal side-loading protection. Bao never installs anything without your confirmation.</p>`, {
    onMount: (card) => {
      card.querySelector('[data-open-install-settings]')?.addEventListener('click', () => {
        try {
          window.BaoNative.openInstallSettings();
        } catch {
          app.toast('Open Settings → Apps → Special access → Install unknown apps.');
        }
      });
      card.querySelector('[data-retry-update]')?.addEventListener('click', () => {
        if (info) startInstall(app, info);
      });
    },
  });
}

function updateProgress(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const bar = document.querySelector('#update-progress-bar');
  const label = document.querySelector('#update-progress-percent');
  if (bar) bar.style.width = `${value}%`;
  if (label) label.textContent = `${value}%`;
}
