/**
 * Drive the lesson past its intro cards and capture the first question.
 * Usage: node tools/lesson-flow.mjs <url> <output.png> [port]
 */
import fs from 'node:fs';
import { dirname } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:5173/?demo=lesson&lesson=u2l2';
const output = process.argv[3] || 'C:\\Users\\Austin\\AppData\\Local\\BaoShots\\lesson-question.png';
const port = Number(process.argv[4] || 9223);
const answerMode = process.argv[5] === 'answer';
const answerIndex = Number(process.argv[6] || 0);

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

for (let i = 0; i < 12; i += 1) {
  const state = await evaluate(`(() => {
    const got = document.querySelector('[data-got-it]');
    if (got) { got.click(); return 'intro'; }
    if (document.querySelector('[data-check]')) return 'question';
    if (document.querySelector('[data-trace-done]')) return 'trace';
    if (document.querySelector('.completion')) return 'complete';
    return 'other';
  })()`);
  if (state !== 'intro') break;
  await sleep(320);
}

if (answerMode) {
  await evaluate(`(() => {
    const options = [...document.querySelectorAll('.option')];
    if (options[${answerIndex}]) options[${answerIndex}].click();
    const check = document.querySelector('[data-check]');
    if (check) check.click();
    return true;
  })()`);
  await sleep(500);
}

await sleep(400);
const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
fs.mkdirSync(dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));

const details = await evaluate(`JSON.stringify((() => {
  const step = window.BaoApp?.session?.data?.steps?.[window.BaoApp.session.index];
  const rect = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1) };
  };
  return {
    step: step ? { type: step.type, prompt: step.prompt, answer: step.answer, options: step.options?.map(o => o.label) } : null,
    prompt: document.querySelector('.prompt-en, .prompt-hanzi')?.textContent,
    options: [...document.querySelectorAll('.option')].map(el => el.textContent.trim()),
    footer: rect('.lesson-footer'),
    feedback: rect('.lesson-feedback'),
    progress: document.querySelector('.progress-fill')?.style.width,
    hearts: document.querySelector('.lesson-hearts')?.textContent.trim(),
    checked: window.BaoApp?.session?.checked,
    correct: window.BaoApp?.session?.correct,
    feedback: document.querySelector('.lesson-feedback')?.textContent.replace(/\\s+/g, ' ').trim(),
    overflow: [...document.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 6).map(el => String(el.className)),
  };
})())`);
console.log(`saved ${output}`);
console.log(details);
socket.close();
