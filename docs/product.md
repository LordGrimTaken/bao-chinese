# Product specification

**Bao Chinese v0.1 · the five-minute Mandarin habit that does not skip the hard parts**

---

## 1. One-liner

A friendly, offline Android app that teaches absolute beginners to **hear tones, read characters, and say something real** in five minutes a day.

**Brand:** Bao (包) — a steamed bun, a treasure, and a panda named Bao. Warm paper, seal red, jade, bamboo. The tone is encouraging, never childish.

**Tagline:** *Chinese, one bite at a time.*

---

## 2. Audience

### Primary: the curious absolute beginner
- 18–40, phone-first, has tried Duolingo or watched a C-drama.
- Knows zero Mandarin or a few phrases.
- Wants to travel, connect with family, or simply prove they can learn it.
- Has 5–10 minutes, not 45.
- Fears “Chinese is impossible”, tones, and looking foolish.

### Secondary: the restarting learner
- Studied a little, forgot most of it.
- Needs a placement path and a reason to return.
- Values grammar explanations and character writing.

### Not the target (yet)
- HSK 4+ exam candidates.
- Heritage speakers who read fluently.
- Classroom teachers needing a dashboard.

---

## 3. Jobs to be done

| When… | I want to… | So I can… |
| --- | --- | --- |
| I have five minutes | finish a lesson | feel progress, not guilt |
| I hear Chinese | tell tones apart | stop guessing from context |
| I see a character | recognise and write it | read a menu/sign |
| I freeze in conversation | have a few useful phrases ready | survive the moment |
| I keep forgetting | review the right words | remember them next week |
| I miss a day | keep my streak | come back without shame |
| I don't trust an app | use it offline, no account | try it privately |

---

## 4. Product principles

1. **Five minutes is a complete session.**
2. **Tone is never optional.**
3. **Recognition ≠ mastery.** Every lesson has production.
4. **Explain one pattern per lesson.**
5. **Offline, private, no account.**
6. **Gentle gamification.** Hearts can be disabled; review is never blocked.
7. **Hanzi first, English as scaffolding.**
8. **No dark patterns.** No fake timers, no pay-to-win, no public league at launch.

---

## 5. Core journeys

### First run (60 seconds)
1. Brand + value prop.
2. “Why are you learning?” (travel/family/work/culture/brain/curious).
3. “How much time a day?” (5/10/15/20 min → 15/30/50/70 XP).
4. Name + privacy note.
5. Land on the path with lesson 1 unlocked and a “Start” bubble.

### Daily session
1. Open → greeting + due count + daily goal ring.
2. Tap the current node → lesson.
3. Intro cards → mixed retrieval → production → feedback.
4. Completion: XP, accuracy, stars, time, streak, new achievements, next lesson.
5. Optional review if words are due.

### Review
- Due queue (SRS), weak words, tone gym, listening, tracing.
- No hearts in tone/listening/tracing.
- Completing a review counts toward the streak.

### Word lookup
- Search hanzi / pinyin / English.
- Word sheet: audio, tone summary, example, mastery stats, practice, trace.

### Streak repair
- Miss one day → freeze auto-consumes (if owned).
- Out of hearts → wait, refill with gems, or practise for free.
- No shame copy; “Mistakes are how learning works.”

---

## 6. Shipped features (v0.1)

| Area | Requirement | Status |
| --- | --- | --- |
| Onboarding | 4 steps, reason, goal, name, skip | ✅ |
| Path | 13 units, 39 lessons, alternating nodes, trail, stars, locked/current | ✅ |
| Lessons | Intro, meaning, hanzi, audio, tone, match, build, fill, trace | ✅ |
| Feedback | Correct/incorrect states, answer reveal, retry queue | ✅ |
| Audio | Android TTS bridge; browser speech synthesis; slow mode | ✅ |
| Gamification | XP, levels, gems, hearts + refill, streak + freeze, daily goal | ✅ |
| Review | Due SRS, weak words, tone pairs, listening, tracing | ✅ |
| Tone pairs | 9 four-way minimal-pair sets, audio-first, character hidden until answer | ✅ v0.1.2 |
| Words | 314-entry dictionary (full HSK 1 deck), search/filter, word sheet, practice | ✅ |
| Audio | 576 bundled neural Mandarin clips + TTS fallback | ✅ v0.1.3 |
| Profile | Streak/XP/words/lessons, weekly chart, 9 achievements, settings | ✅ |
| Persistence | localStorage, export/import JSON, reset | ✅ |
| Offline | Service worker, manifest, installable PWA | ✅ |
| Android | WebView shell, asset interception, TTS/haptics bridge, CI APK | ✅ (CI build) |
| Auto-update | GitHub release check, SHA-256, PackageInstaller, in-place update | ✅ v0.1.1 |
| Accessibility | Focus states, labels, 44px targets, reduced motion, pinyin toggle | ✅ |
| Dark mode | — | ⏳ |
| Speech recognition | — | ⏳ |
| Native audio | — | ⏳ |
| Accounts/sync | — | Not planned for v1 |

---

## 7. Screen requirements

### Learn
- Sticky header: brand, streak, gems, hearts.
- Greeting + due count.
- Daily goal ring + copy; no dead-end states.
- Unit banner: number, title, subtitle, guidebook, progress, stars.
- Path: current node has a “Start” bubble; completed nodes show stars; locked nodes are visibly disabled and explain why on tap.
- Current unit shows a panda encouragement.
- Bottom nav: Learn, Review, Words, Me; due dot on Review.

### Lesson
- Top: close, progress, hearts.
- Intro: big hanzi, pinyin, English, tone summary, audio orb, example.
- Questions: one clear prompt, 4 options or tiles; keyboard 1–4; Check disabled until an answer.
- Feedback: full-width panel, correct answer, explanation, Continue.
- Trace: ghost character, crosshair, brush, clear, Done; self-assessed.
- Completion: confetti, panda, stars, XP/accuracy/time, daily goal, achievements, next lesson, review mistakes.
- Exit confirmation; progress in an abandoned lesson is not counted.

### Review
- Due card with count + Start.
- Practice gym: tone, listening, tracing, weak words.
- Strength bar: new/learning/familiar/strong.
- Weak list + recent words.

### Words
- Search (hanzi/pinyin/English), filters, unit grouping, mastery dots, audio per row.
- Word sheet: tone summary, example, seen/correct/missed, practice/trace.
- Rows must not wrap hanzi (regression tested at 430 px).

### Profile
- Avatar, name, level/title, join date, XP bar.
- 4 stat cards, 7-day chart, 9 achievements.
- Settings: daily goal, shop, sound, pinyin, slow audio, unlimited hearts, install, export, import, reset.
- About/version.

### Shop
- Gems balance.
- Streak freeze 50 (max 3), heart refill 100.
- Disabled states with reasons; no real-money purchases in v1.

---

## 8. Gamification economy

| Action | XP | Gems |
| --- | ---: | ---: |
| Lesson, <80% | 10 | 3 |
| Lesson, ≥80% | 13 | 3 |
| Lesson, 100% | 15 | 5 |
| Review | 6–9 | 2–4 |
| Tone/listening | 5–8 | 2–4 |
| Trace | 4–7 | 2–4 |
| Word practice | 4–7 | 2–4 |

- Hearts: 5, 15-minute refill, 100 gems.
- Freeze: 50 gems, max 3, auto-consumes on a one-day gap.
- Start: 120 gems, 1 freeze.
- No purchasable XP. No ads.
- Achievements: First bite, On a roll (3 days), Week of bao (7), Word collector (25), Word hoard (75), Five stars (5 perfect), Ten bowls (10 lessons), Century (100 XP), Tone tamer (20 tone answers).

**Ethics:** hearts are a pacing mechanic, not a paywall. The unlimited-hearts setting is visible, and review/practice are free. No public leaderboard in v1.

---

## 9. Accessibility

- All controls are real buttons with labels; focus-visible outlines.
- Text contrast meets WCAG AA on the paper palette.
- Tap targets ≥44 px; bottom nav 54 px.
- `prefers-reduced-motion` disables bobbing/confetti animations.
- Pinyin can be hidden in settings for learners ready to drop the crutch.
- Audio has visual alternatives; tone questions include contour labels.
- Content uses plain English; grammar notes avoid jargon.
- No time limits, no forced waiting except the heart timer (which can be bypassed with practice).

---

## 10. Analytics & experiments (privacy-first)

No analytics in v1. When added, opt-in and aggregate only:
- Lesson started/completed, mode, duration, accuracy band.
- Word mastery transitions.
- Tone accuracy over time.
- Review due/completed.
- Settings toggles (unlimited hearts, pinyin).
- **Never** store names, audio, or free-text.

Experiments:
1. Pinyin always-on vs fade-after-unit-2.
2. Hearts on/off for new learners (retention + learning).
3. 5 vs 10 minute default goal.
4. Tone-first vs meaning-first intro order.
5. Trace vs build as the first production task.

---

## 11. Roadmap

### Now → 4 weeks (v0.2)
- Native-speaker audio for 151 words + 128 sentences.
- ~~Tone-pair gym with minimal pairs.~~ Shipped in v0.1.2.
- Fix WebView export/import.
- Add 8 mini-stories using known words.
- Onboarding placement check (3 questions) for restarting learners.
- CI APK verification on a real device/emulator.

### 1–3 months (v1.0)
- Complete HSK 3.0 Level 1 vocabulary (302 words) and 70 grammar points.
- Stroke-order data + scored handwriting.
- Speech recording + self-shadowing (no fake ASR scores).
- Traditional character toggle.
- Dark mode.
- Opt-in analytics + crash reporting.
- Closed beta on Google Play (internal testing).

### 3–6 months
- HSK 1 mock test.
- Graded reader library (20 stories).
- FSRS scheduler migration.
- Account sync + web/desktop.
- Premium: native audio library, stories, offline packs (no pay-to-learn core).

### 6–12 months
- HSK 2 content.
- AI conversation partner with tone-aware feedback (only if evaluation is honest).
- Classroom/teacher dashboard.
- Localization of the interface (ES, PT, ID, VI, JA, KO).

---

## 12. Launch checklist

- [ ] Native-speaker review of all 151 words, 128 sentences, 24 grammar notes.
- [ ] Tone/pinyin automated validation in CI.
- [ ] 10 real-device tests (low-end Android, no Chinese TTS voice, offline).
- [ ] Privacy policy + terms (no data collection).
- [ ] Store listing: 8 screenshots, icon, feature graphic, short description.
- [ ] Accessibility pass (TalkBack, font scaling, reduced motion).
- [ ] Backup/restore tested.
- [ ] APK signed with a release keystore (CI debug only for now).
