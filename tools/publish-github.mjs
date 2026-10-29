/**
 * Publish the current working tree to GitHub using the Git Data API.
 * No local git binary or .git directory is required.
 *
 * Usage:
 *   $env:GH_TOKEN = & "C:\Program Files\GitHub CLI\gh.exe" auth token
 *   node tools/publish-github.mjs
 *
 * Optional env:
 *   GH_OWNER (default LordGrimTaken)
 *   GH_REPO  (default bao-chinese)
 *   GH_VISIBILITY (public|private, default public)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const OWNER = process.env.GH_OWNER || 'LordGrimTaken';
const REPO = process.env.GH_REPO || 'bao-chinese';
const VISIBILITY = process.env.GH_VISIBILITY || 'public';
const TOKEN = process.env.GH_TOKEN;
const API = 'https://api.github.com';

if (!TOKEN) {
  console.error('GH_TOKEN is required. Run: $env:GH_TOKEN = & gh auth token');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'bao-chinese-publisher',
};

async function api(method, endpoint, body) {
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const error = new Error(`${method} ${endpoint} → ${response.status}: ${text.slice(0, 500)}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  '.edge-profile',
  '.edge-run',
  '.edge-cdp',
  'build',
  '.gradle',
  'assets-cache',
]);
const EXCLUDED_FILES = new Set([
  'node-test.txt',
  'test.txt',
  'python-test.png',
  'pwsh-python-test.png',
  'curl-test.txt',
  'write-test.txt',
  'home.png',
]);

function walk(dir, base = '') {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.edge-')) continue;
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      if (base === 'android/app/src/main' && entry.name === 'assets') continue;
      entries.push(...walk(path.join(dir, entry.name), path.join(base, entry.name)));
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name)) continue;
      const relative = path.join(base, entry.name).replaceAll('\\', '/');
      if (relative.startsWith('screenshots/')) continue;
      entries.push({ relative, absolute: path.join(dir, entry.name) });
    }
  }
  return entries;
}

const PENDING = [
  ['final-home.png', 'screenshots/home.png'],
  ['final-onboarding.png', 'screenshots/onboarding.png'],
  ['final-review.png', 'screenshots/review.png'],
  ['final-words.png', 'screenshots/words.png'],
  ['final-profile.png', 'screenshots/profile.png'],
  ['final-lesson.png', 'screenshots/lesson.png'],
  ['final-question.png', 'screenshots/lesson-question.png'],
  ['final-complete.png', 'screenshots/complete.png'],
  ['update.png', 'screenshots/update.png'],
  ['tone-pairs.png', 'screenshots/tone-pairs.png'],
];

const SHOTS_DIR = process.env.BAO_SHOTS_DIR || 'C:\\Users\\Austin\\AppData\\Local\\BaoShots';

const files = walk(ROOT);
for (const [source, destination] of PENDING) {
  const absolute = path.join(SHOTS_DIR, source);
  if (fs.existsSync(absolute)) files.push({ relative: destination, absolute });
}

console.log(`Publishing ${files.length} files to ${OWNER}/${REPO} (${VISIBILITY})`);

// 1. Ensure the repository exists.
let repo;
try {
  repo = await api('GET', `/repos/${OWNER}/${REPO}`);
} catch (error) {
  if (error.status !== 404) throw error;
  console.log('Repository not found — creating it…');
  repo = await api('POST', '/user/repos', {
    name: REPO,
    description: 'Bao Chinese — a five-minute, tone-first Mandarin starter for Android.',
    private: VISIBILITY === 'private',
    has_issues: true,
    has_wiki: false,
    auto_init: false,
  });
}
console.log(`Repo: ${repo.html_url}`);

// 2. Get the current main commit, if any.
let parentSha = null;
try {
  const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  parentSha = ref.object.sha;
} catch (error) {
  if (error.status !== 404 && error.status !== 409) throw error;
}

// An empty repository cannot accept blobs through the Git Data API. Create
// one small commit first, then replace its tree with the full snapshot.
if (!parentSha) {
  console.log('Empty repository — creating an initial commit…');
  await api('PUT', `/repos/${OWNER}/${REPO}/contents/README.md`, {
    message: 'Initialize Bao Chinese',
    content: Buffer.from('# Bao Chinese\n').toString('base64'),
  });
  const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  parentSha = ref.object.sha;
}

// 3. Upload blobs.
const tree = [];
let cursor = 0;
const concurrency = 6;
async function worker() {
  while (cursor < files.length) {
    const file = files[cursor];
    cursor += 1;
    const content = fs.readFileSync(file.absolute);
    const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64',
    });
    tree.push({ path: file.relative, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`\nUploaded ${tree.length} blobs`);

// 4. Commit the full snapshot.
const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, { tree });
const message = `Bao Chinese v0.1 — ${new Date().toISOString().slice(0, 10)}`;
const commit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
  message,
  tree: newTree.sha,
  parents: parentSha ? [parentSha] : [],
});

if (parentSha) {
  await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
    sha: commit.sha,
    force: true,
  });
} else {
  await api('POST', `/repos/${OWNER}/${REPO}/git/refs`, {
    ref: 'refs/heads/main',
    sha: commit.sha,
  });
}
console.log(`Committed ${commit.sha}`);

// 5. Enable GitHub Pages from main /.
try {
  await api('POST', `/repos/${OWNER}/${REPO}/pages`, {
    source: { branch: 'main', path: '/' },
  });
  console.log('Pages enabled');
} catch (error) {
  if (error.status === 409) {
    await api('PUT', `/repos/${OWNER}/${REPO}/pages`, {
      source: { branch: 'main', path: '/' },
    });
    console.log('Pages updated');
  } else {
    console.warn(`Pages setup warning: ${error.message}`);
  }
}

// 6. Ask for a build and print the expected URL.
try {
  await api('POST', `/repos/${OWNER}/${REPO}/pages/builds`);
} catch {
  /* a push normally triggers the build */
}
const pages = await api('GET', `/repos/${OWNER}/${REPO}/pages`);
console.log(`Pages URL: ${pages.html_url || `https://${OWNER.toLowerCase()}.github.io/${REPO}/`}`);
console.log('Done.');
