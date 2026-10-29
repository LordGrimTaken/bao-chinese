/**
 * Drive onboarding end-to-end and capture the result.
 * Usage: node tools/onboarding-flow.mjs <port>
 */
import fs from 'node:fs';
import { dirname } from 'node:path';

const port = Number(process.argv[2] || 9223);
const output = 'C:\\Users\\Austin\\AppData\\Local\\BaoShots\\onboarded-home.png';
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
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?demo=onboarding&v=ob' });
await sleep(1200);

const click = async (selector) => {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`Missing ${selector}`);
  await sleep(350);
};

await click('[data-action="next"]');
await click('[data-reason="travel"]');
await click('[data-action="next"]');
await click('[data-goal="30"]');
await click('[data-action="next"]');
await evaluate(`(() => {
  const input = document.querySelector('#name-input');
  if (!input) return false;
  input.value = 'Austin';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await click('[data-action="finish"]');
await sleep(900);

const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
fs.mkdirSync(dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));

const result = await evaluate(`JSON.stringify({
  onboarded: BaoApp.state.profile.onboarded,
  name: BaoApp.state.profile.name,
  reason: BaoApp.state.profile.reason,
  goal: BaoApp.state.profile.dailyGoalXp,
  route: BaoApp.route,
  greeting: document.querySelector('.home-greeting h1')?.textContent,
  nodes: document.querySelectorAll('.node').length,
})`);
console.log(result);
console.log(`saved ${output}`);
socket.close();
