import { SENTENCES, WORD_BY_ID } from '../../data/course.js';
import { formatDuration, loseHeart } from '../core.js';
import { buildReviewSession, hashString, mulberry32, shuffle } from '../lesson-engine.js';
import { toneName } from '../pinyin.js';
import { escapeHtml, icon, panda, toneSparkline, toneSummary } from './common.js';

const OPTION_TYPES = new Set(['meaning', 'hanzi', 'audio', 'fill', 'tone']);

export function renderLesson(app) {
  const session = app.session;
  if (!session) {
    return `<div class="screen"><div class="empty-state">${panda('think')}<h3>No lesson loaded</h3><p>Head back to the path and pick a lesson.</p></div></div>`;
  }
  if (session.result) return renderCompletion(app);

  const step = session.data.steps[session.index];
  if (!step) return renderCompletion(app);
  const total = session.data.steps.length;
  const progress = Math.min(1, (session.index + (session.checked ? 1 : 0)) / total);
  const hearts = app.state.profile.unlimitedHearts ? '∞' : app.state.hearts;

  return `<div class="lesson-screen" data-lesson-screen>
    <div class="lesson-top">
      <button class="lesson-close" data-close-lesson aria-label="Leave lesson">${icon('close')}</button>
      <div class="progress-track" role="progressbar" aria-valuenow="${Math.round(progress * 100)}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width:${Math.round(progress * 100)}%"></div>
      </div>
      <div class="lesson-hearts ${app.state.hearts === 0 ? 'is-empty' : ''}" aria-label="${hearts} hearts">
        ${icon(app.state.hearts === 0 && !app.state.profile.unlimitedHearts ? 'heartOutline' : 'heart')}
        <span>${hearts}</span>
      </div>
    </div>
    <div class="lesson-body" data-lesson-body>
      ${renderStep(app, step)}
    </div>
    ${renderFooter(app, step)}
  </div>`;
}

function renderStep(app, step) {
  if (step.type === 'intro') return renderIntro(app, step);
  if (step.type === 'match') return renderMatch(app, step);
  if (step.type === 'build') return renderBuild(app, step);
  if (step.type === 'fill') return renderFill(app, step);
  if (step.type === 'trace') return renderTrace(app, step);
  if (step.type === 'tone') return renderTone(app, step);
  if (step.type === 'audio') return renderAudio(app, step);
  return renderChoice(app, step);
}

function promptHeader(label) {
  return `<div class="prompt-label">${escapeHtml(label)}</div>`;
}

function speakerButton(text, big = false) {
  return `<button class="speaker-btn ${big ? 'audio-orb' : ''}" data-speak="${escapeHtml(text)}" aria-label="Play audio">${icon('speaker')}</button>`;
}

function renderIntro(app, step) {
  const word = WORD_BY_ID.get(step.wordId);
  if (!word) return '';
  const example = SENTENCES.find((sentence) => sentence.tokens.includes(word.zh));
  return `<div class="intro-screen"><div class="intro-card">
    <div class="prompt-label">New word</div>
    <div class="intro-hanzi">${escapeHtml(word.zh)}</div>
    <div class="intro-pinyin">${escapeHtml(word.pinyin)}</div>
    <div class="intro-en">${escapeHtml(word.en)}</div>
    <div class="tone-badge">${toneSparkline(word.tones?.[0] || 5)}${escapeHtml(toneSummary(word.tones))}</div>
    ${word.note ? `<p class="intro-note">${escapeHtml(word.note)}</p>` : ''}
    <div class="audio-hero" style="margin-top:12px">${speakerButton(word.zh, true)}</div>
    ${
      example
        ? `<div class="examples">
            <button class="speak-btn example-speak" data-speak="${escapeHtml(example.zh)}" aria-label="Hear the example">${icon('speaker')}</button>
            <div class="ex-zh">${escapeHtml(example.zh)}</div>
            <div class="ex-py">${escapeHtml(example.pinyin)}</div>
            <div class="ex-en">${escapeHtml(example.en)}</div>
          </div>`
        : ''
    }
  </div></div>`;
}

function renderChoice(app, step) {
  const isHanzi = step.type === 'hanzi';
  const showPinyin = app.state.profile.showPinyin;
  return `<div class="lesson-prompt">
    ${promptHeader(
      step.type === 'meaning'
        ? 'What does this mean?'
        : isHanzi
          ? 'Which characters match?'
          : 'Choose the right word'
    )}
    ${
      isHanzi
        ? `<div class="prompt-en">${escapeHtml(step.prompt)}</div>`
        : `<div class="prompt-hanzi">${escapeHtml(step.prompt)}</div>
           ${showPinyin && step.pinyin ? `<div class="prompt-pinyin">${escapeHtml(step.pinyin)}</div>` : ''}
           <div class="audio-hero">${speakerButton(step.audioText || step.prompt, true)}</div>`
    }
  </div>
  ${renderOptions(step, app)}`;
}

function renderAudio(app, step) {
  return `<div class="lesson-prompt">
    ${promptHeader('Listen and choose')}
    <div class="audio-hero" style="margin-top:26px">${speakerButton(step.audioText, true)}</div>
    <p class="prompt-sub">Tap the speaker to hear it again. No pinyin — trust your ear.</p>
  </div>
  ${renderOptions(step, app)}`;
}

function renderTone(app, step) {
  return `<div class="lesson-prompt">
    ${promptHeader('Which tone do you hear?')}
    <div class="audio-hero" style="margin-top:34px">${speakerButton(step.audioText || step.prompt, true)}</div>
    <p class="prompt-sub" style="max-width:300px;margin:14px auto 0">One syllable. Listen for the pitch shape: flat, rising, dipping, or falling.</p>
  </div>
  <div class="options" data-tone-options>
    ${[1, 2, 3, 4]
      .map(
        (tone) => `<button class="option ${optionClass(app, step, tone)}" data-value="${tone}" ${app.session.checked ? 'disabled' : ''}>
          <span class="option-key">${tone}</span>
          <span class="option-text">${toneName(tone)}</span>
          ${toneSparkline(tone)}
        </button>`
      )
      .join('')}
  </div>`;
}

function optionClass(app, step, value) {
  if (!app.session.checked) return '';
  const selected = String(app.session.selection) === String(value);
  const answer = String(step.answer) === String(value);
  return `${selected ? 'selected' : ''} ${answer ? 'correct' : ''} ${selected && !answer ? 'wrong' : ''}`;
}

function renderOptions(step, app) {
  return `<div class="options" data-options>
    ${step.options
      .map(
        (option, index) => `<button class="option ${optionClass(app, step, option.value)}" data-value="${escapeHtml(String(option.value))}" ${app.session.checked ? 'disabled' : ''}>
          <span class="option-key">${index + 1}</span>
          <span class="option-text">${escapeHtml(String(option.label))}
          </span>
        </button>`
      )
      .join('')}
  </div>`;
}

function renderFill(app, step) {
  return `<div class="lesson-prompt">
    ${promptHeader('Fill in the blank')}
    <div class="fill-sentence">${step.parts
      .map((part) => (part.blank ? '<span class="blank">?</span>' : escapeHtml(part.text)))
      .join('')}</div>
    <p class="prompt-sub">${escapeHtml(step.prompt)}</p>
  </div>
  ${renderOptions(step, app)}`;
}

function renderBuild(app, step) {
  const selected = app.session.buildSelected || [];
  const selectedTiles = selected
    .map((key) => step.bank.find((tile) => tile.key === key))
    .filter(Boolean);
  return `<div class="lesson-prompt">
    ${promptHeader('Build the translation')}
    <div class="prompt-en" style="margin-top:10px">${escapeHtml(step.prompt)}</div>
  </div>
  <div class="build-answer" data-build-answer>
    ${selectedTiles
      .map(
        (tile) =>
          `<button class="tile in-answer" data-remove-tile="${tile.key}"><span class="tile-text">${escapeHtml(tile.text)}</span></button>`
      )
      .join('')}
  </div>
  <div class="tile-bank" data-tile-bank>
    ${step.bank
      .map(
        (tile) =>
          `<button class="tile ${selected.includes(tile.key) ? 'used' : ''}" data-tile="${tile.key}"><span class="tile-text">${escapeHtml(tile.text)}</span></button>`
      )
      .join('')}
  </div>
  <p class="trace-note">Tap words to add them. Tap a word above to remove it.</p>`;
}

function renderMatch(app, step) {
  const solved = app.session.matchSolved || [];
  const random = mulberry32(hashString(step.id + 'right'));
  const right = shuffle(step.pairs, random);
  const left = step.pairs;
  return `<div class="lesson-prompt">
    ${promptHeader('Match the pairs')}
    <p class="prompt-sub">Tap a Chinese word, then its English meaning.</p>
  </div>
  <div class="match-board">
    <div class="match-col">
      ${left
        .map(
          (pair) => `<button class="match-item zh ${solved.includes(pair.wordId) ? 'matched' : ''} ${
            app.session.matchSelection?.side === 'zh' && app.session.matchSelection?.wordId === pair.wordId ? 'selected' : ''
          }" data-match-side="zh" data-word-id="${pair.wordId}" ${solved.includes(pair.wordId) ? 'disabled' : ''}>${escapeHtml(pair.zh)}</button>`
        )
        .join('')}
    </div>
    <div class="match-col">
      ${right
        .map(
          (pair) => `<button class="match-item ${solved.includes(pair.wordId) ? 'matched' : ''} ${
            app.session.matchSelection?.side === 'en' && app.session.matchSelection?.wordId === pair.wordId ? 'selected' : ''
          }" data-match-side="en" data-word-id="${pair.wordId}" ${solved.includes(pair.wordId) ? 'disabled' : ''}>${escapeHtml(pair.en)}</button>`
        )
        .join('')}
    </div>
  </div>`;
}

function renderTrace(app, step) {
  return `<div class="lesson-prompt">
    ${promptHeader('Write the character')}
    <div class="prompt-en" style="margin-top:6px">${escapeHtml(step.en)}</div>
    <div class="prompt-sub">Trace over the ghost character. Slow and steady beats fast and messy.</div>
  </div>
  <div class="trace-wrap">
    <div class="trace-canvas-wrap">
      <div class="trace-ghost">${escapeHtml(step.char)}</div>
      <canvas class="trace-canvas" data-trace-canvas aria-label="Trace ${escapeHtml(step.char)}"></canvas>
    </div>
    <div class="trace-tools">
      <button class="btn btn-sm btn-secondary" data-trace-clear>Clear</button>
      <button class="speak-btn" data-speak="${escapeHtml(step.char)}" aria-label="Hear the character">${icon('speaker')}</button>
    </div>
    <p class="trace-note">${escapeHtml(step.pinyin || '')} · ${escapeHtml(step.char)}</p>
  </div>`;
}

function renderFooter(app, step) {
  const session = app.session;
  if (session.checked) return renderFeedback(app, step);
  if (step.type === 'match') {
    return `<div class="lesson-footer"><div class="trace-note" style="margin:0">Match all four pairs to continue.</div></div>`;
  }
  if (step.type === 'intro') {
    return `<div class="lesson-footer">
      <button class="btn btn-primary btn-block" data-got-it>Got it ${icon('arrowRight')}</button>
      <small>Tap the speaker to hear it again</small>
    </div>`;
  }
  if (step.type === 'trace') {
    return `<div class="lesson-footer">
      <button class="btn btn-primary btn-block" data-trace-done disabled>Done tracing</button>
      <small>Sign it with your finger or mouse</small>
    </div>`;
  }
  const selected = step.type === 'build'
    ? (session.buildSelected || []).length > 0
    : session.selection !== null && session.selection !== undefined;
  return `<div class="lesson-footer">
    <button class="btn btn-primary btn-block" data-check ${selected ? '' : 'disabled'}>Check</button>
    <small>${step.type === 'build' ? 'Build the sentence, then check' : 'Choose an answer'}</small>
  </div>`;
}

function renderFeedback(app, step) {
  const session = app.session;
  const good = session.correct;
  const answer = correctAnswer(step);
  return `<div class="lesson-feedback ${good ? 'good' : 'bad'}">
    <div class="feedback-head">
      <div class="feedback-icon">${icon(good ? 'check' : 'close')}</div>
      <div class="feedback-copy">
        <strong>${good ? goodTitle(step) : 'Not quite'}</strong>
        <p>${good ? goodCopy(step) : 'The correct answer is below. We will bring it back at the end.'}</p>
        ${answer ? `<div class="fb-answer">${answer}</div>` : ''}
      </div>
    </div>
    <button class="btn ${good ? 'btn-primary' : 'btn-red'} btn-block" data-continue>Continue ${icon('arrowRight')}</button>
  </div>`;
}

function goodTitle(step) {
  const titles = {
    meaning: 'Nailed it!',
    hanzi: 'Character spotter!',
    audio: 'Nice ears!',
    tone: 'Tone tamer!',
    fill: 'Exactly right!',
    build: 'Sentence builder!',
    match: 'Perfect match!',
    trace: 'Beautifully traced!',
  };
  return titles[step.type] || '对了! Nice work!';
}

function goodCopy(step) {
  if (step.type === 'tone') return `${toneName(Number(step.answer))}. Feel the shape of the pitch.`;
  if (step.type === 'build') return 'Word order is coming together.';
  if (step.type === 'trace') return 'Every stroke makes the character more familiar.';
  if (step.type === 'match') return 'Four pairs, no slips.';
  return 'Keep going — repetition is how it sticks.';
}

function correctAnswer(step) {
  const word = step.wordId ? WORD_BY_ID.get(step.wordId) : null;
  if (step.type === 'tone') {
    return `${toneName(Number(step.answer))} · ${word ? escapeHtml(word.pinyin) : ''}`;
  }
  if (step.type === 'build') {
    return `<span style="font-family:var(--hanzi);font-size:22px">${escapeHtml(step.answer.join(''))}${escapeHtml(step.punctuation || '')}</span>`;
  }
  if (step.type === 'fill') {
    const sentence = step.sentenceId
      ? SENTENCES.find((item) => item.id === step.sentenceId)
      : null;
    return `<span style="font-family:var(--hanzi);font-size:22px">${escapeHtml(sentence?.zh || step.answer)}</span>`;
  }
  if (step.type === 'match' || step.type === 'intro' || step.type === 'trace') return '';
  if (word) return `${escapeHtml(word.zh)} — ${escapeHtml(word.pinyin)} — ${escapeHtml(word.en)}`;
  return escapeHtml(String(step.answer));
}

export function mountLesson(app) {
  const session = app.session;
  if (!session) return;
  if (session.result) return mountCompletion(app);

  const root = document.querySelector('[data-lesson-screen]');
  const body = document.querySelector('[data-lesson-body]');
  if (body && session.scrollTop) body.scrollTop = session.scrollTop;

  document.querySelector('[data-close-lesson]')?.addEventListener('click', () => app.confirmExitLesson());

  const step = session.data.steps[session.index];
  if (!step) return;

  // Options
  root?.querySelectorAll('[data-options] .option, [data-tone-options] .option').forEach((button) => {
    button.addEventListener('click', () => {
      if (session.checked) return;
      root.querySelectorAll('.option').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      session.selection = button.dataset.value;
      const check = root.querySelector('[data-check]');
      if (check) check.disabled = false;
      app.sfx('tap');
    });
  });

  // Build tiles
  root?.querySelectorAll('[data-tile]').forEach((button) => {
    button.addEventListener('click', () => {
      if (session.checked) return;
      const key = button.dataset.tile;
      session.buildSelected = session.buildSelected || [];
      if (session.buildSelected.includes(key)) return;
      session.buildSelected.push(key);
      const tile = step.bank.find((item) => item.key === key);
      button.classList.add('used');
      const answer = root.querySelector('[data-build-answer]');
      answer?.insertAdjacentHTML(
        'beforeend',
        `<button class="tile in-answer" data-remove-tile="${key}"><span class="tile-text">${escapeHtml(tile?.text || '')}</span></button>`
      );
      const remove = answer?.lastElementChild;
      remove?.addEventListener('click', () => removeTile(app, key));
      root.querySelector('[data-check]').disabled = false;
      app.sfx('tap');
    });
  });
  root?.querySelectorAll('[data-remove-tile]').forEach((button) => {
    button.addEventListener('click', () => removeTile(app, button.dataset.removeTile));
  });

  // Match
  root?.querySelectorAll('[data-match-side]').forEach((button) => {
    button.addEventListener('click', () => onMatch(app, step, button));
  });

  // Trace
  if (step.type === 'trace') mountTrace(app, step);

  // Footer actions
  root?.querySelector('[data-check]')?.addEventListener('click', () => evaluate(app, step));
  root?.querySelector('[data-got-it]')?.addEventListener('click', () => advance(app));
  root?.querySelector('[data-trace-done]')?.addEventListener('click', () => evaluate(app, step));
  root?.querySelector('[data-continue]')?.addEventListener('click', () => {
    if (session.outOfHearts) {
      app.showHeartsGate({
        onRefill: () => {
          session.outOfHearts = false;
          advance(app);
        },
      });
      return;
    }
    advance(app);
  });

  // Speaker buttons
  root?.querySelectorAll('[data-speak]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      app.speak(button.dataset.speak);
    });
  });

  // Auto-play audio for ear-training steps.
  if (!session.checked && step.audioText && (step.autoPlay || step.type === 'audio' || step.type === 'tone')) {
    setTimeout(() => {
      if (app.session === session && !session.checked) app.speak(step.audioText);
    }, 320);
  }
}

function removeTile(app, key) {
  const session = app.session;
  session.buildSelected = (session.buildSelected || []).filter((item) => item !== key);
  const root = document.querySelector('[data-lesson-screen]');
  root?.querySelector(`[data-remove-tile="${key}"]`)?.remove();
  root?.querySelector(`[data-tile="${key}"]`)?.classList.remove('used');
  const check = root?.querySelector('[data-check]');
  if (check) check.disabled = session.buildSelected.length === 0;
  app.sfx('tap');
}

function onMatch(app, step, button) {
  const session = app.session;
  if (session.checked) return;
  const side = button.dataset.matchSide;
  const wordId = button.dataset.wordId;
  const selection = session.matchSelection;

  if (!selection) {
    session.matchSelection = { side, wordId };
    button.classList.add('selected');
    app.sfx('tap');
    return;
  }
  if (selection.side === side) {
    document.querySelectorAll(`[data-match-side="${side}"]`).forEach((item) => item.classList.remove('selected'));
    session.matchSelection = { side, wordId };
    button.classList.add('selected');
    app.sfx('tap');
    return;
  }

  if (selection.wordId === wordId) {
    session.matchSolved = [...(session.matchSolved || []), wordId];
    session.matchSelection = null;
    recordResult(app, step, wordId, true);
    session.answered += 1;
    session.correctCount += 1;
    app.sfx('correct');
    app.vibrate(8);
    session.scrollTop = document.querySelector('[data-lesson-body]')?.scrollTop || 0;
    if (session.matchSolved.length >= step.pairs.length) {
      session.checked = true;
      session.correct = true;
    }
    app.save();
    app.render();
    return;
  }

  recordResult(app, step, selection.wordId, false);
  session.answered += 1;
  session.matchSelection = null;
  const gameOver =
    app.state.profile.unlimitedHearts || session.noHearts ? false : loseHeart(app.state, new Date());
  app.save();
  app.sfx('wrong');
  app.vibrate([12, 40, 12]);
  document.querySelectorAll('.match-item').forEach((item) => item.classList.remove('selected'));
  button.classList.add('wrong');
  setTimeout(() => button.classList.remove('wrong'), 380);
  if (gameOver) {
    session.outOfHearts = true;
    setTimeout(() => {
      app.showHeartsGate({
        onRefill: () => {
          session.outOfHearts = false;
          app.render();
        },
      });
    }, 450);
  }
}

function recordResult(app, step, wordId, correct) {
  if (!wordId) return;
  const results = app.session.results;
  if (!results[wordId]) results[wordId] = { correct: 0, wrong: 0 };
  if (correct) results[wordId].correct += 1;
  else results[wordId].wrong += 1;
  if (step.type === 'tone' && correct) app.session.toneCorrect = (app.session.toneCorrect || 0) + 1;
}

function evaluate(app, step) {
  const session = app.session;
  if (session.checked) return;
  let correct = false;
  if (step.type === 'trace') {
    correct = true;
  } else if (step.type === 'build') {
    const selected = (session.buildSelected || []).map((key) => step.bank.find((tile) => tile.key === key)?.text);
    correct = selected.length === step.answer.length && selected.every((token, index) => token === step.answer[index]);
  } else if (OPTION_TYPES.has(step.type)) {
    correct =
      step.type === 'tone'
        ? Number(session.selection) === Number(step.answer)
        : String(session.selection) === String(step.answer);
  }

  session.answered += 1;
  if (correct) session.correctCount += 1;
  if (step.wordId) recordResult(app, step, step.wordId, correct);
  if (!correct) {
    const gameOver =
      app.state.profile.unlimitedHearts || session.noHearts ? false : loseHeart(app.state, new Date());
    if (gameOver) session.outOfHearts = true;
    if (!session.retryIds.includes(step.id)) {
      session.retryIds.push(step.id);
      session.retryQueue.push({ ...step, retry: true });
    }
    session.mistakes.push(step);
    app.sfx('wrong');
    app.vibrate([12, 40, 12]);
  } else {
    app.sfx('correct');
    app.vibrate(8);
  }
  session.checked = true;
  session.correct = correct;
  session.scrollTop = document.querySelector('[data-lesson-body]')?.scrollTop || 0;
  app.save();
  app.render();
}

function advance(app) {
  const session = app.session;
  session.index += 1;
  if (session.index >= session.data.steps.length) {
    if (session.retryQueue.length) {
      session.data.steps.push(...session.retryQueue);
      session.retryQueue = [];
      session.checked = false;
      session.correct = false;
      session.selection = null;
      session.buildSelected = [];
      session.scrollTop = 0;
      app.render();
      return;
    }
    app.finishSession();
    return;
  }
  session.checked = false;
  session.correct = false;
  session.selection = null;
  session.buildSelected = [];
  session.matchSelection = null;
  session.scrollTop = 0;
  app.render();
}

function mountTrace(app, step) {
  const canvas = document.querySelector('[data-trace-canvas]');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2b2118';
  let drawing = false;
  let last = null;
  let hasInk = false;

  const pos = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event) => {
    event.preventDefault();
    drawing = true;
    last = pos(event);
    canvas.setPointerCapture?.(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(last.x + 0.1, last.y + 0.1);
    ctx.stroke();
    if (!hasInk) {
      hasInk = true;
      const done = document.querySelector('[data-trace-done]');
      if (done) done.disabled = false;
    }
  };
  const move = (event) => {
    if (!drawing) return;
    event.preventDefault();
    const point = pos(event);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last = point;
  };
  const end = (event) => {
    drawing = false;
    last = null;
    try {
      canvas.releasePointerCapture?.(event.pointerId);
    } catch {
      /* noop */
    }
  };

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);

  document.querySelector('[data-trace-clear]')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, width, height);
    hasInk = false;
    const done = document.querySelector('[data-trace-done]');
    if (done) done.disabled = true;
  });
}

export function handleLessonKey(app, event) {
  const session = app.session;
  if (!session || session.result) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    app.confirmExitLesson();
    return;
  }
  const step = session.data.steps[session.index];
  if (!step) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    if (session.checked) {
      document.querySelector('[data-continue]')?.click();
    } else {
      const check = document.querySelector('[data-check]');
      if (check && !check.disabled) check.click();
    }
    return;
  }
  if (!session.checked && OPTION_TYPES.has(step.type) && /^[1-9]$/.test(event.key)) {
    const index = Number(event.key) - 1;
    const options = document.querySelectorAll('[data-options] .option, [data-tone-options] .option');
    if (options[index]) {
      event.preventDefault();
      options[index].click();
    }
  }
}

function renderCompletion(app) {
  const result = app.session.result;
  const isLesson = result.mode === 'lesson';
  const starsCount = result.stars || 0;
  const accuracy = Math.round((result.accuracy || 0) * 100);
  const totalSteps = app.session.answered || 0;
  const mistakes = app.session.mistakes || [];
  const nextLesson = app.nextLessonAfter(app.session.data.lessonId);
  const confetti = Array.from({ length: 26 }, (_, index) => {
    const colors = ['#e8503a', '#1fa97a', '#f0ad2e', '#3d8fd1', '#9b59b6'];
    const left = (index * 37) % 100;
    const delay = ((index * 13) % 24) / 10;
    const duration = 2.2 + ((index * 7) % 16) / 10;
    const drift = ((index * 11) % 60) - 30;
    return `<span style="left:${left}%;background:${colors[index % colors.length]};--dur:${duration}s;--delay:${delay}s;--drift:${drift}px"></span>`;
  }).join('');

  return `<div class="completion">
    <div class="confetti" aria-hidden="true">${confetti}</div>
    ${panda('celebrate')}
    <span class="eyebrow">${isLesson ? 'Lesson complete' : 'Session complete'}</span>
    <h1>${isLesson ? '你做到了！' : 'Nice work!'}</h1>
    <p class="comp-sub">${isLesson ? 'One more brick in your Chinese foundation.' : 'Your brain just did something difficult. 太棒了.'}</p>
    ${isLesson ? `<div class="completion-stars">${[0, 1, 2].map((i) => `<span class="${i < starsCount ? 'on' : ''}">${icon('star')}</span>`).join('')}</div>` : ''}
    <div class="comp-stats">
      <div class="comp-stat"><strong>+${result.xp}</strong><span>XP</span></div>
      <div class="comp-stat"><strong>${accuracy}%</strong><span>Accuracy</span></div>
      <div class="comp-stat"><strong>${formatDuration(app.session.durationMs || 0)}</strong><span>Time</span></div>
    </div>
    ${
      result.dailyGoalMet
        ? `<div class="comp-goal">🎯 Daily goal complete! You hit ${result.dailyXp} XP today.</div>`
        : `<div class="comp-goal" style="background:var(--paper-deep);color:var(--ink-soft)">${result.dailyXp} / ${result.dailyGoalXp} XP toward today's goal</div>`
    }
    ${
      result.newAchievements?.length
        ? `<div class="comp-achievements">${result.newAchievements
            .map((achievement) => `<span class="achv-pill">${achievement.icon} ${escapeHtml(achievement.title)}</span>`)
            .join('')}</div>`
        : ''
    }
    <div class="completion-actions">
      ${
        isLesson && nextLesson
          ? `<button class="btn btn-primary" data-next-lesson="${nextLesson.id}">Next: ${escapeHtml(nextLesson.title)} ${icon('arrowRight')}</button>`
          : ''
      }
      ${
        mistakes.length
          ? `<button class="btn btn-secondary" data-review-mistakes>Review ${mistakes.length} mistake${mistakes.length === 1 ? '' : 's'}</button>`
          : ''
      }
      <button class="btn ${isLesson && nextLesson ? 'btn-secondary' : 'btn-primary'}" data-go-home>${isLesson ? 'Back to path' : 'Done'}</button>
    </div>
    <p class="comp-sub" style="margin-top:14px;font-size:11px">${isLesson ? 'Streak protected. See you tomorrow?' : 'Every review makes the next one easier.'}</p>
  </div>`;
}

function mountCompletion(app) {
  document.querySelector('[data-go-home]')?.addEventListener('click', () => app.go('learn'));
  document.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => {
    const lesson = app.nextLessonAfter(app.session.data.lessonId);
    if (lesson) app.startLesson(lesson);
  });
  document.querySelector('[data-review-mistakes]')?.addEventListener('click', () => {
    const wordIds = [...new Set((app.session.mistakes || []).map((step) => step.wordId).filter(Boolean))];
    if (!wordIds.length) {
      app.toast('No word-level mistakes to review. Nice!');
      return;
    }
    const session = buildReviewSession(wordIds, { limit: 10, seed: 'mistakes' });
    session.title = 'Mistake review';
    session.subtitle = 'Second chances';
    app.startSession(session);
  });
}


