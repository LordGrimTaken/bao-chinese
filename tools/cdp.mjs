/**
 * Read-only DevTools inspection helper.
 * Usage: node tools/cdp.mjs [port] [expression]
 */
const port = Number(process.argv[2] || 9223);
const custom = process.argv[3];

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((target) => target.type === 'page' && target.url.includes('127.0.0.1:5173'));
if (!page) {
  console.error('No Bao page target found');
  process.exit(1);
}

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

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const expression =
  custom ||
  `JSON.stringify((() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1) };
    };
    const overflow = [...document.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
    }).slice(0, 12).map((el) => ({ tag: el.tagName, class: String(el.className).slice(0, 50), right: +el.getBoundingClientRect().right.toFixed(1) }));
    return {
      title: document.title,
      innerWidth, innerHeight,
      vv: visualViewport ? { width: visualViewport.width, height: visualViewport.height } : null,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      app: rect('.app'),
      nav: rect('.bottom-nav'),
      guide: rect('.guide-btn'),
      guideLabel: getComputedStyle(document.querySelector('.guide-btn span')).display,
      stats: rect('.home-stats'),
      heart: rect('.stat--hearts'),
      banner: rect('.unit-banner'),
      node: rect('.node--current'),
      optionCount: document.querySelectorAll('.option').length,
      overflow,
    };
  })())`;

const result = await send('Runtime.evaluate', {
  expression,
  returnByValue: true,
  awaitPromise: true,
});
console.log(result.result?.value ?? JSON.stringify(result));
socket.close();
