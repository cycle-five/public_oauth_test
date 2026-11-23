#!/usr/bin/env node
// Drives a real Chrome through a login on the test pages, then reports which
// browser storage tables gained rows. Prints ROW COUNTS and TABLE NAMES ONLY.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
// Resolve playwright from tests/node_modules regardless of cwd.
const { chromium } = createRequire(path.join(here, 'package.json'))('playwright');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
};

function parseArgs(argv) {
  const rnd = () => Math.random().toString(36).slice(2, 10);
  const o = { url: '/login/any.html', mode: 'typed', policy: 'none', headed: true, channel: 'chrome',
    username: `canary-${rnd()}`, password: `secret-${rnd()}` };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--headed') o.headed = true;
    else if (a === '--headless') o.headed = false;
    else if (['--url', '--mode', '--policy', '--channel', '--username', '--password'].includes(a)) o[a.slice(2)] = argv[++i];
    else throw new Error(`unknown flag: ${a}`);
  }
  if (!['typed', 'script'].includes(o.mode)) throw new Error('--mode must be typed|script');
  if (!['none', 'protected'].includes(o.policy)) throw new Error('--policy must be none|protected');
  if (!['chrome', 'chromium'].includes(o.channel)) throw new Error('--channel must be chrome|chromium');
  return o;
}

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(ROOT, '.' + pathname);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function sqlite(db, sql) {
  return execFileSync('sqlite3', ['-readonly', db, sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

// Returns { tables: [...], counts: {table: n|'absent'} } -- never reads value columns.
function inspect(copyPath, wanted) {
  if (!fs.existsSync(copyPath)) return { tables: null, counts: Object.fromEntries(wanted.map((t) => [t, 'absent'])) };
  const tables = sqlite(copyPath, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").split('\n').filter(Boolean);
  const counts = {};
  for (const t of wanted) counts[t] = tables.includes(t) ? Number(sqlite(copyPath, `SELECT count(*) FROM "${t}";`)) : 'absent';
  return { tables, counts };
}

const opts = parseArgs(process.argv.slice(2));
const server = await startServer();
const serverURL = `http://127.0.0.1:${server.address().port}`;
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-control-profile-'));
const copyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-control-copy-'));
let exitCode = 0;

try {
  if (opts.policy === 'protected') {
    fs.mkdirSync(path.join(userDataDir, 'Default'), { recursive: true });
    fs.writeFileSync(path.join(userDataDir, 'Default', 'Preferences'), JSON.stringify({
      credentials_enable_service: false,
      profile: { password_manager_enabled: false },
      autofill: { profile_enabled: false, credit_card_enabled: false },
    }));
    console.log('policy=protected via profile preference (credentials_enable_service=false, autofill disabled) — NOTE: this emulates a managed policy as a per-profile USER preference; a true enterprise managed policy lives in /etc/opt/chrome/policies/managed/ and is system-wide + root, intentionally not written by this script.');
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: opts.channel,
    headless: !opts.headed,
    args: ['--password-store=basic', '--no-first-run', '--no-default-browser-check'],
  });
  try {
    const page = context.pages()[0] || (await context.newPage());
    const target = /^https?:\/\//.test(opts.url) ? opts.url : serverURL + opts.url;
    await page.goto(target);
    await page.waitForSelector('#login-form[data-ready="true"]', { timeout: 15000 });

    if (opts.mode === 'typed') {
      await page.locator('#username').focus();
      await page.locator('#username').pressSequentially(opts.username);
      await page.locator('#password').focus();
      await page.locator('#password').pressSequentially(opts.password);
    } else {
      await page.evaluate(([u, p]) => {
        for (const [sel, val] of [['#username', u], ['#password', p]]) {
          const el = document.querySelector(sel);
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, [opts.username, opts.password]);
    }

    const nav = page.waitForURL('**/login/welcome.html**', { timeout: 15000 }).catch(() => null);
    await page.click('#submit');
    await nav;
    await page.waitForTimeout(1500);
  } finally {
    await context.close();
  }

  const def = path.join(userDataDir, 'Default');
  const copies = {};
  for (const name of ['Login Data', 'Web Data']) {
    const src = path.join(def, name);
    const dst = path.join(copyDir, name.replace(' ', '_') + '.db');
    if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    copies[name] = dst;
  }
  const ld = inspect(copies['Login Data'], ['logins', 'stats']);
  const wd = inspect(copies['Web Data'], ['autofill']);
  const fmt = (x) => (x.tables ? `[${x.tables.join(', ')}]` : 'absent');
  console.log(`RUN url=${opts.url} mode=${opts.mode} policy=${opts.policy} channel=${opts.channel} headed=${opts.headed}`);
  console.log(`Login Data: logins=${ld.counts.logins} stats=${ld.counts.stats}`);
  console.log(`Web Data:   autofill=${wd.counts.autofill}`);
  console.log(`tables: Login Data=${fmt(ld)}; Web Data=${fmt(wd)}`);
} catch (e) {
  console.error('ERROR:', e.message);
  exitCode = 1;
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.rmSync(copyDir, { recursive: true, force: true });
}
process.exit(exitCode);
