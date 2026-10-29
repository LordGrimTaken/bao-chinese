import fs from 'node:fs';
import { dirname } from 'node:path';

const port = Number(process.argv[2] || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((target) => target.type === 'page' && target.url.includes('127.0.0.1:5173'));
if (!page) throw new Error('No Bao page');
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
  width: 430, height: 932, deviceScaleFactor: 1, mobile: true, screenWidth: 430, screenHeight: 932,
});
await send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'all' });
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?demo=review&v=review' });
await sleep(1300);

const before = await evaluate(`JSON.stringify({
  due: document.querySelector('.due-count')?.textContent.trim(),
  practiceCards: document.querySelectorAll('[data-practice]').length,
  words: document.querySelectorAll('.word-row').length,
})`);
console.log('REVIEW', before);

await evaluate(`document.querySelector('[data-action="start-review"]')?.click()`);
await sleep(700);

const after = await evaluate(`JSON.stringify({
  mode: BaoApp.session?.data?.mode,
  title: BaoApp.session?.data?.title,
  steps: BaoApp.session?.data?.steps?.length,
  stepType: BaoApp.session?.data?.steps?.[0]?.type,
  hearts: BaoApp.state.hearts,
  options: document.querySelectorAll('.option').length,
  overflow: [...document.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); }).length,
})`);
console.log('SESSION', after);

const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
const output = 'C:\\Users\\Austin\\AppData\\Local\\BaoShots\\review-session.png';
fs.mkdirSync(dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));
console.log(`saved ${output}`);
socket.close();
