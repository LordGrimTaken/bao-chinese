# Research & product direction

**Bao Chinese · October 2026**

> Chinese, one bite at a time. A tone-first, offline-first Mandarin starter course for absolute beginners, packaged as an installable Android app.

This document records the market research, learning-science decisions, and product bets behind the first build. It is intentionally opinionated: a starter app cannot do everything, so the goal is to be clearly better than generic apps at the things that make Mandarin hard for beginners.

---

## 1. The opportunity

Mandarin is one of the highest-value language-learning markets and one of the hardest to teach well in a gamified format. The dominant products solve **habit** and **recognition vocabulary**; they are weaker at **tones, character production, grammar explanation, and listening at natural speed**.

Duolingo's Chinese course is a useful benchmark:

| Dimension | Duolingo Chinese | Implication for Bao |
| --- | --- | --- |
| Scope | 200+ lessons, ~1,500 words, roughly HSK 1–3 (old standard) | A focused HSK 3.0 Level 1 starter is a credible wedge. |
| Habit | Best-in-class streaks, leagues, notifications | Match the habit loop, but make it gentler. |
| Tones | Incidental; speech recognition is lenient | Make tones an explicit, trainable skill from lesson one. |
| Characters | Recognition only; no handwriting | Require production through tracing, not just matching. |
| Grammar | Little in-app explanation | Put a one-minute “why” card in every lesson. |
| Speaking | Scripted; forgiving recognition | Start with perception and self-assessment; add ASR carefully. |

Sources: [Coco Chinese's Duolingo review](https://www.coco-chinese.com/blog/duolingo-chinese-review) (note: a competitor's analysis), [Duolingo Chinese course data](https://en.namu.wiki/w/%EB%93%80%EC%98%AC%EB%A7%81%EA%B3%A0/%EC%A4%91%EA%B5%AD%EC%96%B4/%EC%83%81%EC%84%B8%20%EA%B3%BC%EC%A0%95#1).

### Competitive landscape

| App | Strong at | Gap / opening |
| --- | --- | --- |
| **Duolingo** | Habit, free access, polish | Tones, writing, grammar, listening depth |
| **HelloChinese** | All-in-one beginner course, speech, handwriting, SRS, 2,000+ videos; 20M+ users | Busy UX, premium upsell, less “just five minutes” simplicity |
| **ChineseSkill** | Free Duolingo-style course | Dated content, thinner advanced path |
| **SuperChinese** | Conversation and AI speaking, HSK 1–6 | Less polished, speaking-first |
| **LingoDeer** | Explicit grammar for Asian languages | Less playful, paywalled |
| **Skritter** | Best-in-class handwriting + SRS | Single-purpose, subscription |
| **Du Chinese** | Graded reading with audio | Reading only |
| **Pleco** | Dictionary, OCR, handwriting | Not a course |

Sources: [HelloChinese](https://www.hellochinese.cc/), [Unstore comparison](https://unstore.io/discover/best-chinesia-alternatives/).

**Positioning:** *the friendly five-minute Chinese habit that does not skip the hard parts.* Tone-first, write-one-character-a-day, one grammar insight per lesson, fully offline.

---

## 2. What beginners actually struggle with

1. **Tones are lexical, not decorative.** `mā` (mother), `má` (hemp), `mǎ` (horse), `mà` (scold) are different words. A learner who ignores tone builds vocabulary on sand.
2. **Pinyin is a crutch and a bridge.** It makes the first month possible, but learners over-rely on it and stop hearing the word. Pinyin should fade, not vanish.
3. **Characters are a separate skill.** Recognition (pick 谢 out of four) is not production (write 谢). Both matter; production is what generic apps skip.
4. **Grammar is not optional at scale.** Word order, measure words, `了`, `的`, and complement structures are hard to infer from translation drills alone.
5. **Listening at natural speed is the real bottleneck.** Scripted, slow audio creates “classroom Chinese” that collapses in conversation.
6. **Motivation is fragile.** Beginners stop. A streak is powerful, but anxiety-based mechanics (hearts, loss aversion, leagues) can also drive churn and unhealthy study.
7. **The first two weeks decide everything.** The app must deliver a usable win fast: greet someone, say your name, order tea, read a real character.

---

## 3. Evidence-informed design

### 3.1 Retrieval practice, not re-reading
Testing yourself (recall) beats reviewing notes. Every lesson is a sequence of retrieval attempts: choose, listen, build, type/trace, and retry mistakes. New words are introduced once, then immediately used in a different modality.

### 3.2 Spaced repetition
Bao uses an SM-2-inspired scheduler, deliberately simpler than FSRS:

- First correct: 1 day.
- Second: 3 days.
- Then interval × ease (ease starts at 2.5, adjusts).
- A lapse resets to 1 day and lowers ease.
- Due words feed the Review screen; weak words are surfaced separately.

FSRS is the modern state of the art in Anki and is on the roadmap once there is enough review data to fit parameters. For a new app with sparse data, a transparent SM-2 variant is safer and easier to reason about. Source: [Anki's scheduler FAQ](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm).

### 3.3 Interleaving and variation
Lessons mix meaning, character recognition, listening, tone identification, sentence building, and tracing. The learner must retrieve the same word through different cues instead of memorising one screen.

### 3.4 Comprehensible input, in small doses
Every new word appears in a short, level-appropriate sentence. The sentence is shown with hanzi, pinyin, and English on the intro card, then used as a production prompt later. This is not a replacement for graded reading; it is the bridge to it.

### 3.5 Output and corrective feedback
- **Tracing** builds character production and stroke confidence.
- **Sentence building** forces word order.
- **Tone gym** trains perception before production.
- Wrong answers are shown with the correct answer, requeued once at the end, and recorded for SRS. The aim is correction, not punishment.

### 3.6 Tone-first pedagogy
- Tone contours are visualised for every new word.
- Single-syllable words get explicit tone questions.
- Tones are shown with pinyin, but ear-training steps hide the character/pinyin.
- Tone changes (sandhi) are noted where relevant; the dictionary form is displayed to avoid overloading beginners.
- Future: minimal-pair listening sets (`mā/má/mǎ/mà`), shadowing, and ASR with tone feedback.

### 3.7 Grammar “why” cards
Each lesson contains a one-sentence pattern + explanation, written for adults, not linguists. Example: `是` links two nouns; `吗` turns a statement into a yes/no question; `没有` is the negative of `有` (never `不有`).

### 3.8 Gamification with guardrails
- **Streak:** daily habit, with a freeze that can be earned/bought.
- **XP and levels:** progress feedback, not a leaderboard rat race.
- **Hearts:** 5, refill over 15 minutes, can be disabled in settings (“practice mode”).
- **Gems:** earned by finishing; spent on hearts/freezes, not required to learn.
- **No ads. No energy gates on review. No pay-to-win.**
- **No public leagues at launch.** Social comparison is powerful but can harm beginners; a private weekly goal is enough for v1.

This is a deliberate departure from maximal engagement. The product should be sticky because learning feels good, not because the learner is afraid to lose a number.

---

## 4. HSK 3.0 alignment

The Chinese Proficiency Grading Standards (HSK 3.0) introduced nine levels in three stages. The first worldwide HSK 3.0 sitting is scheduled for **13 December 2026**. Under the new standard, HSK 1 alone contains **302 words** (the old HSK 1 had 150), plus **70 grammar points** and a character list.

| Level | New words | Cumulative words |
| --- | --- | --- |
| HSK 1 | 302 | 302 |
| HSK 2 | 198 | 500 |
| HSK 3 | 491 | 991 |
| HSK 4 | 991 | 1,982 |
| HSK 5 | 1,580 | 3,562 |
| HSK 6 | 1,778 | 5,340 |
| HSK 7–9 | 5,562 | 10,902 |

Source: [GraphChinese HSK 3.0 guide](https://graphchinese.com/hsk-3-0), [HSK 1 vocabulary list](https://graphchinese.com/new-hsk-1-vocabulary).

**What Bao v1 covers:** 12 units, 36 lessons, **235 lesson words**, 208 sentences, and 36 grammar cards, plus the **complete 302-word HSK 1 vocabulary deck** in the dictionary (79 still deck-only; 314 dictionary entries including extras). It is a starter course, not a complete HSK 1 lesson sequence or exam preparation. The curriculum is sequenced by communicative function and grammar dependency, not by the alphabetical HSK list.

**What this means:** a learner who finishes the 36 lessons can greet, introduce themselves, talk about family, count, tell time and dates, order basic food, shop for clothes and food, talk about places/transport, describe their home and devices, talk about school and work, describe simple things, and connect ideas. The HSK 1 deck adds audio, meaning, and spaced review for every remaining official word, but 79 words do not yet have dedicated sentence lessons. They will still need mock tests and more output practice before sitting the exam.

---

## 5. Product principles

1. **Five minutes must be enough.** A lesson is 12–20 interactions, not a 30-minute commitment.
2. **Never skip the tone.** Every word has audio, pinyin, and a tone contour.
3. **Recognition is not mastery.** At least one production task per lesson (build or trace).
4. **Explain the pattern.** One grammar card per lesson, in plain English.
5. **Offline by default.** No account, no network required after install.
6. **Gentle gamification.** Streaks and XP, but hearts can be turned off and review is never blocked.
7. **Show the Chinese, not just the translation.** Hanzi is always primary; English is support.
8. **Respect the learner's time and intelligence.** No fake urgency, no dark patterns.

### Non-goals for v1
- Full HSK 1–9 curriculum
- Live tutors, social feed, leagues
- Speech recognition scoring (planned; needs careful tone handling)
- Traditional characters (planned toggle)
- Native-speaker recorded audio (TTS now; recordings later)
- Account sync across devices (local-first; export/import now)

---

## 6. Risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| TTS quality varies by device | Wrong or robotic tones teach bad pronunciation | Prefer installed zh-CN neural voices; show a “voice unavailable” hint; roadmap: licensed native audio |
| 151 words is thin | Learners finish in ~2 weeks | Ship v2 units (HSK 1 remainder), graded stories, and review depth |
| Hearts frustrate beginners | Churn at the first hard lesson | Unlimited-hearts setting, free review, generous refill |
| Content errors | Tone/pinyin mistakes destroy trust | Typed pinyin + automated validation; native-speaker review before store launch |
| WebView “not native” perception | Performance/feel | The shell is thin and offline; migrate hot screens to Compose later if needed |
| Copyright | Example sentences and audio must be original | All sentences authored for Bao; TTS is generated on-device |
| Over-gamification | Anxiety, unhealthy streaks | No public leagues, streak freeze, goal-based not loss-based |
| Privacy | Learners are often minors | No account, no analytics by default, local storage only |

---

## 7. Success metrics

**North star:** weekly learners who complete ≥3 lessons and ≥1 review.

| Funnel | Metric | Target (first 90 days) |
| --- | --- | --- |
| Activation | Complete lesson 1 after install | ≥ 60% |
| Habit | D7 retention | ≥ 25% |
| Learning | Words reaching “familiar” (reps ≥ 2) | ≥ 40 per active learner |
| Tone | Tone-question accuracy after 2 weeks | ≥ 75% |
| Course | Unit 1 completion | ≥ 35% |
| Quality | Crash-free sessions | ≥ 99.5% |
| Sentiment | “Would recommend” | ≥ 4.5/5 |

Avoid vanity metrics (total registered users, raw streak length). Track **learning-adjusted** retention: are learners remembering words two weeks later?

---

## 8. Sources

- Coco Chinese, *Duolingo Chinese Review* (2026): https://www.coco-chinese.com/blog/duolingo-chinese-review
- GraphChinese, *HSK 3.0: the complete guide*: https://graphchinese.com/hsk-3-0
- GraphChinese, *New HSK 1 vocabulary list*: https://graphchinese.com/new-hsk-1-vocabulary
- GraphChinese, *New HSK 1 grammar list*: https://graphchinese.com/new-hsk-1-grammar
- HelloChinese official site: https://www.hellochinese.cc/
- Unstore, *Best Chinesia alternatives* (competitor comparison): https://unstore.io/discover/best-chinesia-alternatives/
- Anki manual, *What spaced repetition algorithm does Anki use?*: https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm
- Duolingo Chinese course overview: https://en.namu.wiki/w/%EB%93%80%EC%98%AC%EB%A7%81%EA%B3%A0/%EC%A4%91%EA%B5%AD%EC%96%B4/%EC%83%81%EC%84%B8%20%EA%B3%BC%EC%A0%95#1

*Competitor claims are directional and should be re-checked before a store launch. Coco Chinese is a competing app; its critique is used for specific, checkable gaps, not as neutral market research.*
