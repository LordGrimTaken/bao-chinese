# Architecture

**Bao Chinese v0.1**

The app is a **zero-build, offline-first web app** wrapped in a thin Android shell. This was chosen deliberately for the first milestone: it runs on Android immediately as an installable PWA, it can be tested end-to-end in a real browser, and the same code can be shipped as a native APK without maintaining two UIs. Hot paths can migrate to Kotlin/Compose later without changing the content or state model.

---

## 1. System shape

```
┌──────────────────────────────────────────────────────────────┐
│ Android APK (optional, CI-built)                             │
│  MainActivity.kt                                             │
│   ├─ WebView  → https://appassets.androidplatform.net/...    │
│   ├─ Asset interceptor (serves /assets/www)                  │
│   └─ BaoNative JS bridge (TTS, vibration)                   │
└──────────────────────────▲───────────────────────────────────┘
                           │ same web assets
┌──────────────────────────┴───────────────────────────────────┐
│ Offline web app (PWA)                                        │
│  index.html + CSS + ES modules                               │
│  ├─ screens: onboarding, learn, review, words, profile       │
│  ├─ lesson runner + exercise generator                       │
│  ├─ SM-2 scheduler + game state (localStorage)               │
│  ├─ course content (typed JS data)                           │
│  └─ Web Speech / WebAudio / canvas tracing                   │
│  Service worker caches the shell; no server required         │
└──────────────────────────────────────────────────────────────┘
```

### Why not native-first?
- **No build step** means content and UI can be changed and tested instantly.
- **One implementation** of the lesson engine, SRS, and UI.
- **Installable today** via Chrome “Add to Home screen”; works offline.
- **Android APK** is a 200-line shell + CI build, not a second app.
- The content model is portable to Compose/Room later.

### Trade-offs
- WebView startup is slower than Compose.
- Web Speech voices depend on the device; the native bridge uses Android TTS, which is more reliable but still device-dependent.
- No native speech recognition yet.
- Canvas tracing is self-assessed, not stroke-order scored.

---

## 2. Repository map

```
bao-chinese/
├─ index.html                  app shell
├─ manifest.webmanifest        PWA metadata
├─ sw.js                       offline cache
├─ src/
│  ├─ css/app.css              design system + screens
│  ├─ data/course.js           8 units / 24 lessons / 151 words
│  └─ js/
│     ├─ app.js                router, app controller, demo seeding
│     ├─ core.js               pure state, SRS, streaks, hearts, XP
│     ├─ pinyin.js             numbered ↔ tone-mark pinyin
│     ├─ lesson-engine.js      deterministic exercise generation
│     ├─ audio.js              TTS, WebAudio SFX, haptics
│     └─ ui/
│        ├─ common.js          icons, panda, rings, tone sparklines
│        ├─ onboarding.js
│        ├─ home.js            path, units, drawing the trail
│        ├─ lesson.js          lesson runner + completion
│        ├─ review.js          due/weak/practice gym
│        ├─ words.js           dictionary + word sheet
│        └─ profile.js         stats, achievements, settings
├─ tools/
│  ├─ serve.mjs                local static server
│  ├─ validate-content.mjs     content/pinyin validator
│  ├─ shot.mjs                 CDP screenshot at 430×932
│  ├─ lesson-flow.mjs          advance to a specific exercise
│  ├─ e2e-lesson.mjs           play a whole lesson headlessly
│  └─ cdp.mjs                  layout inspector
├─ tests/
│  ├─ core.test.mjs
│  └─ lesson.test.mjs
├─ android/                    thin native shell + Gradle build
├─ .github/workflows/          CI + APK build
└─ docs/
```

---

## 3. State model

Stored under `bao.state.v1` in `localStorage`.

```js
{
  version: 1,
  createdAt: "2026-10-29T...",
  profile: {
    name, reason, dailyGoalXp, onboarded,
    sound, showPinyin, slowAudio, unlimitedHearts
  },
  xp, gems, hearts, heartsAt,
  streak, longestStreak, lastActiveDate, freezes,
  daily: { date: "YYYY-MM-DD", xp, lessons },
  history: { "YYYY-MM-DD": xp },
  lessons: { u1l1: { completed, stars, bestAccuracy, attempts, at } },
  reviews: { u1: { completed, bestAccuracy, attempts, at } },
  words: { nihao: { ease, interval, reps, lapses, due, seen, correct, wrong, last } },
  achievements: { first_lesson: "ISO date" },
  stats: { answered, correct, minutes, sessions, toneCorrect }
}
```

Invariants:
- Dates are **local calendar days** (`YYYY-MM-DD`), not UTC, so a streak does not break at midnight UTC.
- `hydrateState()` merges saved state onto defaults, so adding fields is backwards compatible.
- `ensureDaily()` resets the daily counter and advances the heart timer.
- All mutation happens through pure functions in `core.js`; UI reads state and calls `app.save()`.

### Hearts
- 5 max; one lost on a wrong answer in a lesson/review (not in tone/listening/trace/word practice).
- One heart every 15 minutes; timer starts when the first heart is lost.
- 100 gems to refill; unlimited-hearts setting for accessibility/practice.

### Streak
- First completed session on a day increments (or starts) the streak.
- A one-day gap consumes a streak freeze if available.
- Longer gaps reset to 1.
- `longestStreak` is preserved.

### XP / levels
- Lesson: 10 XP + 5 for perfect, +3 for ≥80%.
- Review: 6 XP base.
- Practice modes: 4–5 XP.
- Level thresholds: 0, 100, 250, 500, 900, 1400, 2200.
- Stars: 3 = 100%, 2 = ≥80%, 1 = below.

---

## 4. SRS

`reviewWord(state, wordId, quality, today)`:

| Quality | Meaning | Effect |
| --- | --- | --- |
| 5 | correct, first try | reps++, interval grows |
| 3 | correct after retry | reps++, interval grows |
| 1 | wrong | reps=0, interval=1, lapses++, ease−0.2 |

```
reps 0 → 1 day
reps 1 → 3 days
reps ≥2 → interval × ease (rounded, min 1)
ease starts 2.5, clamps 1.3–3.0, +0.06 per success
due = today + interval
```

Word strength for UI:
- unseen → new
- reps ≥ 2 / interval ≥ 21 → strong
- reps ≥ 2 → familiar
- seen → learning

Why SM-2 rather than FSRS: with almost no review history, FSRS parameter fitting has nothing to fit. A transparent SM-2 variant is easier to validate and explain. FSRS is a v2 migration once there is data; the `words` schema already stores `ease`, `interval`, `reps`, and `lapses`, which maps cleanly.

---

## 5. Lesson engine

`buildLessonSession(lesson, { seed })` is deterministic: a seeded PRNG (`mulberry32` over a string hash) chooses distractors and ordering. This makes tests reproducible and lets a retry produce a fresh but stable variant.

Pipeline:
1. Intro for every new word.
2. One recognition drill per word (meaning / hanzi / audio, rotating).
3. A tone question for the first single-syllable word.
4. A 4-pair match.
5. Up to two sentence-build steps (2–8 content tokens).
6. One fill-in-the-blank from a sentence with ≥3 content tokens.
7. One trace step for the first word.
8. Wrong steps are requeued once, then the session finishes.

Distractors:
- Prefer same part of speech.
- Prefer same character length.
- Never duplicate the answer or another option.
- Fall back to the full word pool if a lesson is too small.

Sentence data is **tokenized**:
```js
{ tokens: ['我', '不', '是', '学生', '。'], en: 'I am not a student.' }
```
`zh` and pinyin are derived, which guarantees they stay in sync and makes validation possible.

---

## 6. Audio

- **Bundled clips:** 596 MP3s generated with `zh-CN-XiaoxiaoNeural` cover all 314 dictionary words, 246 sentences, and 36 tone-pair words. The app resolves a clip by content ID; no manifest is needed (`words/<id>.mp3`, `sentences/<id>.mp3`, `tones/<id>.mp3`).
- **Fallback:** if a clip is missing/fails, Android `TextToSpeech` (`BaoNative.speak`) or Web Speech is used. This keeps local development and non-audio builds usable.
- **Slow mode:** HTMLAudio `playbackRate = 0.72`, with TTS slow rate as fallback.
- **SFX:** WebAudio oscillators (correct, wrong, tap, complete, heart). No network.
- **Haptics:** Android `VibrationEffect` via bridge; `navigator.vibrate` on the web.
- **Caveat:** the clips are neural TTS, not human studio recordings. A paid release should use human voice actors and verify TTS licensing.
- **Future:** pronunciation scoring only when it can evaluate tones credibly.

---

## 7. Android shell

- `MainActivity` is a plain `Activity` + `WebView` (no AndroidX, no Compose).
- Assets are served from a fake secure origin:
  `https://appassets.androidplatform.net/assets/www/index.html`
  via `shouldInterceptRequest` → `AssetManager`. This gives ES modules, `localStorage`, and a secure context without a local server.
- `minSdk 26`, `targetSdk 35`, portrait, no cleartext traffic.
- Build-time `Copy` task bundles the web app into `app/src/main/assets/www` from the repo root — no duplicated source.
- Back button calls `BaoApp.handleBack()`; if the web app does not consume it, the activity finishes.
- The APK is built by `.github/workflows/android.yml`; there is no Gradle wrapper jar in the repo (it would be a binary), so CI uses the Gradle action.

### 7.1 Auto-updater

The shell checks the public GitHub Releases API (`/repos/LordGrimTaken/bao-chinese/releases/latest`) and compares the release tag with the installed `versionName`.

Flow:
1. `Updater.check(force)` on launch (6-hour throttle) or from **Me → Check for updates**.
2. Parse `tag_name`, release notes, and the first `.apk` asset (`browser_download_url`, `size`, `digest`).
3. Download to `filesDir/updates` with redirect handling and progress callbacks.
4. Verify the SHA-256 digest from GitHub, the APK's package name, and a higher `versionCode`.
5. Commit a `PackageInstaller` session. The system shows its install confirmation; `InstallResultReceiver` launches the pending-user-action Intent and reports failures.
6. Same package + stable signing key means the installed app updates in place and keeps `localStorage`.

Permissions: `INTERNET` and `REQUEST_INSTALL_PACKAGES`. The first update also requires the user to allow installs from Bao (`ACTION_MANAGE_UNKNOWN_APP_SOURCES`). The web layer exposes this as a friendly sheet via `BaoNative.installUpdate`, `onProgress`, `onInstalling`, `onPermissionNeeded`, and `onInstallError`.

Signing: every build uses a **stable demo key** (`android/keystore/bao-demo.jks.b64`) so Android accepts the update. The key is public and must be replaced with a private release key before Play Store distribution.

Known limitations:
- Blob downloads (export progress) may not work in WebView; the PWA path is the reliable one.
- File picker for import is not wired in the shell.
- TTS voice quality varies by OEM; a “no Chinese voice” nudge is on the roadmap.
- The updater requires a GitHub release; it does not use a private update server yet.

---

## 8. Testing and QA

```bash
node tests/core.test.mjs       # 15 state/SRS/gamification tests
node tests/lesson.test.mjs     # 9 content/engine tests
node tools/validate-content.mjs
node tools/serve.mjs           # http://127.0.0.1:5173
```

Browser QA uses the Chrome DevTools Protocol:
- `tools/cdp.mjs` — layout metrics, overflow detection.
- `tools/shot.mjs` — exact 430×932 screenshots.
- `tools/lesson-flow.mjs` — advance past intros; inspect a question type.
- `tools/e2e-lesson.mjs` — play a full lesson by choosing correct answers, then assert the completion payload.

The E2E run verifies:
- every exercise type renders,
- matching/build/trace interactions work,
- completion applies XP, stars, SRS, and streak state,
- no horizontal overflow at 430 px.

---

## 9. Deployment

- **GitHub Pages** serves the repo root over HTTPS. The manifest uses relative URLs, so it works at `https://<user>.github.io/bao-chinese/`.
- Service worker caches the app shell; updates require a version bump (`bao-v1` → `bao-v2`) to invalidate.
- **APK:** GitHub Actions → artifact `bao-chinese-debug-apk`.
- **PWA install:** Chrome on Android → “Add to Home screen”.

---

## 10. Privacy & security

- No account, no server, no analytics, no third-party scripts.
- Progress lives in `localStorage` on the device; export/import is a local JSON file.
- The Android shell blocks external navigation and disables file/content access.
- No user-generated content or network input.
- If analytics are added later: opt-in, aggregate, no Chinese-learning content or names.

---

## 11. Deliberate shortcuts (and how to pay them back)

| Shortcut | Payback |
| --- | --- |
| TTS instead of recorded audio | License native audio; A/B tone accuracy |
| Self-assessed tracing | Stroke-order data + per-stroke scoring |
| SM-2 instead of FSRS | Migrate when ≥10k reviews exist |
| WebView shell | Move lesson runner to Compose if startup/scroll performance suffers |
| 151 words | Ship the rest of HSK 1; add stories |
| No speech recognition | Evaluate ASR only with tone-aware scoring; otherwise it teaches bad habits |
