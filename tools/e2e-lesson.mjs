/**
 * End-to-end lesson driver against the live page.
 * Usage: node tools/e2e-lesson.mjs [lessonId] [port]
 */
const lessonId = process.argv[2] || 'u1l1';
const port = Number(process.argv[3] || 9223);
const url = `http://127.0.0.1:5173/?demo=lesson&lesson=${lessonId}&v=e2e`;

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((target) => target.type === 'page' && target.url.includes('127.0.0.1:5173'));
if (!page) throw new Error('No Bao page target');
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
const send = (method, params = {}) => {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
};
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 430,
  height: 932,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 430,
  screenHeight: 932,
});
await send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'all' });
await send('Page.navigate', { url });
await sleep(1600);

let lastAction = '';
for (let tick = 0; tick < 120; tick += 1) {
  const status = await evaluate(`(() => {
    const session = window.BaoApp?.session;
    if (!session) return { stage: 'no-session' };
    if (session.result || document.querySelector('.completion')) return { stage: 'complete', result: session.result };
    const step = session.data.steps[session.index];
    if (!step) return { stage: 'no-step' };
    if (session.checked) {
      const cont = document.querySelector('[data-continue]');
      if (cont) { cont.click(); return { stage: 'continue', step: step.type }; }
      return { stage: 'checked-no-button', step: step.type };
    }
    if (step.type === 'intro') {
      const got = document.querySelector('[data-got-it]');
      if (got) { got.click(); return { stage: 'intro', step: step.type }; }
    }
    if (step.type === 'match') {
      const pair = step.pairs.find(p => !(session.matchSolved || []).includes(p.wordId));
      if (!pair) return { stage: 'match-done', step: step.type };
      const zh = document.querySelector('[data-match-side="zh"][data-word-id="' + pair.wordId + '"]');
      const en = document.querySelector('[data-match-side="en"][data-word-id="' + pair.wordId + '"]');
      if (zh && en) {
        const side = session.matchSelection?.side;
        if (side === 'zh') en.click(); else zh.click();
        return { stage: 'match-pair', step: step.type, wordId: pair.wordId };
      }
      return { stage: 'match-missing', step: step.type };
    }
    if (step.type === 'trace') {
      const done = document.querySelector('[data-trace-done]');
      if (done) { done.disabled = false; done.click(); return { stage: 'trace', step: step.type }; }
    }
    if (step.type === 'build') {
      const tiles = [...document.querySelectorAll('[data-tile]')].filter(t => !t.classList.contains('used'));
      const selectedTexts = (session.buildSelected || []).map(key => step.bank.find(t => t.key === key)?.text);
      const nextText = step.answer[selectedTexts.length];
      const tile = tiles.find(t => t.textContent.trim() === nextText);
      if (tile) {
        tile.click();
        return { stage: 'build-tile', step: step.type, text: nextText };
      }
      const check = document.querySelector('[data-check]');
      if (check && !check.disabled) { check.click(); return { stage: 'build-check', step: step.type }; }
      return { stage: 'build-stuck', step: step.type, selected: session.buildSelected, nextText };
    }
    if (step.options?.length) {
      const answer = String(step.answer);
      const match = step.options.find(o => String(o.value) === answer);
      const buttons = [...document.querySelectorAll('.option')];
      const index = step.options.indexOf(match);
      if (buttons[index]) {
        buttons[index].click();
        const check = document.querySelector('[data-check]');
        if (check) check.click();
        return { stage: 'option', step: step.type, answer };
      }
    }
    return { stage: 'unknown', step: step.type, options: step.options?.length };
  })()`);

  if (status.stage === 'complete') {
    console.log('COMPLETE', JSON.stringify(status.result, null, 2));
    const state = await evaluate(`JSON.stringify({
      lesson: window.BaoApp.state.lessons['${lessonId}'],
      xp: window.BaoApp.state.xp,
      streak: window.BaoApp.state.streak,
      words: Object.keys(window.BaoApp.state.words).length,
      answered: window.BaoApp.session.answered,
      correct: window.BaoApp.session.correctCount,
      mistakes: window.BaoApp.session.mistakes.length,
    })`);
    console.log('STATE', state);
    socket.close();
    process.exit(0);
  }
  if (status.stage === 'no-session' || status.stage === 'no-step' || status.stage === 'unknown' || status.stage.endsWith('stuck') || status.stage.endsWith('missing')) {
    console.error('STUCK', JSON.stringify(status));
    socket.close();
    process.exit(1);
  }
  if (status.stage !== lastAction) lastAction = status.stage;
  await sleep(90);
}

console.error('Did not finish within 120 actions');
socket.close();
process.exit(1);
