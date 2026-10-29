/**
 * Capture a 430×932 screenshot through the DevTools protocol.
 * Usage: node tools/shot.mjs <url> <output.png> [port]
 *
 * The browser writes to AppData because this environment's file sandbox
 * denies child-process writes inside the workspace.
 */
import fs from 'node:fs';
import { dirname } from 'node:path';

const url = process.argv[2];
const output = process.argv[3];
const port = Number(process.argv[4] || 9223);
if (!url || !output) {
  console.error('Usage: node tools/shot.mjs <url> <output.png> [port]');
  process.exit(1);
}

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((target) => target.type === 'page' && target.url.includes('127.0.0.1:5173'));
if (!page) {
  console.error('No Bao page target found');
  process.exit(1);
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = new Map();

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  } else if (message.method && events.has(message.method)) {
    for (const handler of events.get(message.method)) handler(message.params);
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function once(method, timeout = 8000) {
  return new Promise((resolve) => {
    const handler = (params) => {
      clearTimeout(timer);
      events.get(method).delete(handler);
      resolve(params);
    };
    if (!events.has(method)) events.set(method, new Set());
    events.get(method).add(handler);
    const timer = setTimeout(() => {
      events.get(method).delete(handler);
      resolve(null);
    }, timeout);
  });
}

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
await send('Storage.clearDataForOrigin', {
  origin: 'http://127.0.0.1:5173',
  storageTypes: 'all',
});

const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url });
await loaded;
await new Promise((resolve) => setTimeout(resolve, 1200));

const screenshot = await send('Page.captureScreenshot', {
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: false,
});
fs.mkdirSync(dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));

const metrics = await send('Runtime.evaluate', {
  expression: `JSON.stringify((() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1) };
    };
    const overflow = [...document.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
    }).slice(0, 10).map((el) => ({ tag: el.tagName, cls: String(el.className).slice(0, 40), right: +el.getBoundingClientRect().right.toFixed(1) }));
    return {
      title: document.title,
      innerWidth, innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      nav: rect('.bottom-nav'),
      guideLabel: document.querySelector('.guide-btn span') ? getComputedStyle(document.querySelector('.guide-btn span')).display : null,
      banner: rect('.unit-banner'),
      screen: document.querySelector('.screen')?.className,
      overflow,
    };
  })())`,
  returnByValue: true,
});
console.log(`saved ${output} (${Math.round(screenshot.data.length / 1024)} KB base64)`);
console.log(metrics.result?.value ?? '');
socket.close();
