# Bao Chinese 包

**Chinese, one bite at a time.** A friendly, offline-first Mandarin starter course for Android — tone-first, character-first, and built for five-minute sessions.

[![Tests](https://github.com/LordGrimTaken/bao-chinese/actions/workflows/ci.yml/badge.svg)](https://github.com/LordGrimTaken/bao-chinese/actions/workflows/ci.yml)
[![Android APK](https://github.com/LordGrimTaken/bao-chinese/actions/workflows/android.yml/badge.svg)](https://github.com/LordGrimTaken/bao-chinese/actions/workflows/android.yml)

**[Open the app](https://lordgrimtaken.github.io/bao-chinese/)** · **[Download the Android APK](https://github.com/LordGrimTaken/bao-chinese/releases/latest)** · **[Read the research](docs/research.md)** · **[Product spec](docs/product.md)** · **[Curriculum](docs/curriculum.md)**

![Bao Chinese home screen](screenshots/home.png)

## What it is

Bao is a Duolingo-shaped Mandarin course that refuses to skip the parts generic apps skip:

- **Tones are explicit.** Every word has audio, pinyin, and a tone contour; tone questions are audio-first.
- **You produce characters.** Trace the character you just learned; recognition is not treated as mastery.
- **Grammar gets one minute.** Every lesson has a plain-English “why” card.
- **Five minutes is enough.** 14–22 interactions, with a real completion screen.
- **It works offline.** No account, no server, no ads, no tracking. Your progress is local and exportable.
- **It updates itself.** The Android build checks GitHub Releases, verifies the APK checksum, and hands it to Android's installer.
- **Gentle gamification.** Streaks, XP, gems, and hearts — with an unlimited-hearts setting and free review.

It is a **starter subset of HSK 3.0 Level 1**: 8 units, 24 lessons, **151 words**, 128 sentences, 24 grammar cards. It is not a complete HSK course or exam prep.

## Screens

| Learn | Lesson | Review |
| --- | --- | --- |
| ![Learn](screenshots/home.png) | ![Lesson](screenshots/lesson.png) | ![Review](screenshots/review.png) |

| Words | Profile | Completion |
| --- | --- | --- |
| ![Words](screenshots/words.png) | ![Profile](screenshots/profile.png) | ![Complete](screenshots/complete.png) |

## Try it locally

Requires Node 20+ (no npm dependencies).

```bash
cd bao-chinese
node tools/serve.mjs
# http://127.0.0.1:5173
```

Demo routes for screenshots and QA:

```
/?demo=onboarding
/?demo=home
/?demo=review
/?demo=words
/?demo=profile
/?demo=lesson&lesson=u2l2
/?demo=lesson&lesson=u1l1&type=build
/?demo=complete
```

## Test

```bash
node tests/core.test.mjs        # 15 state, SRS, streak, hearts, gamification tests
node tests/lesson.test.mjs      # 9 content + exercise-generator tests
node tools/validate-content.mjs # token/pinyin/lesson integrity
```

The full lesson can be played headlessly against a running Chrome/Edge with the DevTools protocol:

```bash
node tools/e2e-lesson.mjs u1l1
```

## Android

There are two Android paths:

1. **Install the PWA** from the GitHub Pages URL in Chrome → “Add to Home screen”. It is offline-capable and uses Web Speech for audio.
2. **Install the APK** — [download the latest debug build](https://github.com/LordGrimTaken/bao-chinese/releases/latest) (Android 8.0+, ~0.9 MB). It is a thin WebView shell with native Android TTS and haptics. The `Android APK` workflow rebuilds it on every push to `main`.

The current APK is **demo-signed** for testing. Enable “Install unknown apps” for your browser/file manager, then open the downloaded `app-debug.apk`.

### Auto-update

The Android app checks `api.github.com/repos/LordGrimTaken/bao-chinese/releases/latest` on launch (throttled to once every 6 hours) and from **Me → Check for updates**.

When a newer release exists, it:

1. Downloads the APK to app-private storage.
2. Verifies the GitHub SHA-256 digest, package name, and version code.
3. Opens Android's `PackageInstaller` confirmation.

The first update needs “Allow from this source” for Bao. Progress stays on the device; the app does not use an account.

**One-time note:** v0.1.0 was signed with a throwaway CI debug key and has no updater code. Reinstall v0.1.1 once; every build after that is signed with the stable demo key and can update in place. The demo key is intentionally public for this prototype — see [android/keystore/README.md](android/keystore/README.md) before a Play Store release.

![Update sheet](screenshots/update.png)

```bash
# requires JDK 17, Android SDK 35, and Gradle 8.9+
gradle -p android :app:assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

The Android build copies the web app from the repo root at build time — there is no duplicated `www/` source. See [android/README.md](android/README.md).

## How it is built

- **No build step.** Vanilla ES modules, CSS, and JSON-free typed JS content. The service worker caches the shell.
- **Pure core.** `src/js/core.js` owns state, SRS, streaks, hearts, XP, and achievements; it is tested in Node.
- **Deterministic lessons.** `src/js/lesson-engine.js` turns a lesson into exercises with a seeded PRNG.
- **Single content source.** 151 typed words and 128 tokenized sentences; pinyin is stored in numbered form and rendered with tone marks.
- **Thin native shell.** Android `WebView` + asset interception at a secure fake origin, with a `BaoNative` TTS/vibration bridge.

Read [docs/architecture.md](docs/architecture.md) for the full design.

## Coverage

| Unit | Theme | Lessons | Words |
| --- | --- | ---: | ---: |
| 1 | First Hellos | 3 | 20 |
| 2 | People & Family | 3 | 19 |
| 3 | Numbers & Time | 3 | 21 |
| 4 | Food & Drink | 3 | 19 |
| 5 | Getting Around | 3 | 18 |
| 6 | Daily Life | 3 | 18 |
| 7 | Describe It | 3 | 18 |
| 8 | Connect & Chat | 3 | 18 |
| **Total** | | **24** | **151** |

What a learner can do after v0.1: greet, introduce themselves, talk about family, count, tell time, order basic food, talk about places/transport, describe simple things, and connect ideas.

## Research & decisions

The short version:

- Duolingo is excellent at habit and recognition, but its Chinese course is weak on tones, handwriting, grammar, and natural listening. ([review](https://www.coco-chinese.com/blog/duolingo-chinese-review))
- The new HSK 3.0 Level 1 has **302 words** (not 150), so “HSK 1” is a bigger promise than it used to be. ([HSK 3.0 guide](https://graphchinese.com/hsk-3-0))
- A starter app should win on **tone training + character production + grammar clarity + offline simplicity**, not on catalog size.
- SM-2 is the right scheduler for a cold start; FSRS comes later. ([Anki docs](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm))

Full sources and reasoning: [docs/research.md](docs/research.md).

## Roadmap

- **v0.2:** native-speaker audio, tone-pair gym, mini-stories, placement check.
- **v1.0:** complete HSK 1 (302 words / 70 grammar points), stroke-order handwriting, traditional toggle, beta on Google Play.
- **Later:** HSK 2, graded readers, FSRS, accounts/sync, AI conversation with honest tone feedback.

See [docs/product.md](docs/product.md) for the full roadmap and metrics.

## License

MIT. Content (words, sentences, grammar explanations) is original to this project. Emoji are rendered by the platform. See [LICENSE](LICENSE).
