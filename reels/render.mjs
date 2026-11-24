// Makes a FaceRep reel's MP4 in Google Chrome: no ffmpeg and nothing installed (the same way as Reel Studio).
// Run from the facerep folder:
//   node reels/render.mjs reels/001-looksmax            <reel>/out/reel.mp4, the still pictures and sheet.jpg
//   node reels/render.mjs reels/001-looksmax --stills   only the still pictures and sheet.jpg
// The page (reels/page/) draws <reel>/reel.js frame by frame. Screens come from the store capture's Simulator
// screenshots (store-screenshots/capture/sim/en/), the font and the icon from app/assets/.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENS = join(repo, 'store-screenshots', 'capture', 'sim', 'en');
const ASSETS = {
  '/font/anton.ttf': join(repo, 'app', 'assets', 'fonts', 'Anton-Regular.ttf'),
  '/brand/icon.png': join(repo, 'app', 'assets', 'brand', 'icon.png'),
};
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript', png: 'image/png', ttf: 'font/ttf' };
const MAX_BYTES = 300 * 1024 * 1024;

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith('--'));
const reel = folder && resolve(folder);
if (!reel || !existsSync(join(reel, 'reel.js'))) {
  console.log('Use: node reels/render.mjs reels/NNN-name [--stills]');
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.log('FAIL Google Chrome must be in /Applications.');
  process.exit(1);
}
const job = { stillsOnly: args.includes('--stills'), fps: 30, bits: 10_000_000 };
const out = join(reel, 'out');
const began = Date.now();
let chrome;
let finished = false;

function finish(code) {
  if (finished) return;
  finished = true;
  chrome?.kill();
  server.close();
  const mp4 = join(out, 'reel.mp4');
  if (code === 0 && !job.stillsOnly) console.log(`     ${relative(process.cwd(), mp4)}  ${(statSync(mp4).size / 1e6).toFixed(1)} MB`);
  if (code === 0) console.log(`Done in ${((Date.now() - began) / 1000).toFixed(1)} s`);
  process.exit(code);
}

function body(req) {
  return new Promise((ok, bad) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES) bad(new Error('too large'));
      else chunks.push(c);
    });
    req.on('end', () => ok(Buffer.concat(chunks)));
    req.on('error', bad);
  });
}

function send(res, file) {
  res.writeHead(200, { 'content-type': TYPES[file.split('.').pop()], 'cache-control': 'no-store' });
  res.end(readFileSync(file));
}

// The page can read only these files, and write only into <reel>/out/.
const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (req.url === '/') return send(res, join(here, 'page', 'index.html'));
      if (req.url === '/job') {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify(job));
      }
      if (req.url === '/reel.js') return send(res, join(reel, 'reel.js'));
      if (ASSETS[req.url]) return send(res, ASSETS[req.url]);
      const code = /^\/page\/([\w-]+\.js)$/.exec(req.url);
      if (code && existsSync(join(here, 'page', code[1]))) return send(res, join(here, 'page', code[1]));
      const screen = /^\/screens\/([\w-]+\.png)$/.exec(req.url);
      if (screen && existsSync(join(SCREENS, screen[1]))) return send(res, join(SCREENS, screen[1]));
    }
    if (req.method === 'POST') {
      if (req.url === '/log') {
        console.log((await body(req)).toString().slice(0, 3000));
        return res.end('ok');
      }
      const save = /^\/save\/(reel\.mp4|still-\d+(?:\.\d+)?\.jpg|sheet\.jpg)$/.exec(req.url);
      if (save) {
        mkdirSync(out, { recursive: true });
        writeFileSync(join(out, save[1]), await body(req));
        return res.end('ok');
      }
      if (req.url === '/done') {
        const ok = (await body(req)).toString() === 'ok';
        res.end('ok');
        return setTimeout(() => finish(ok ? 0 : 1), 200);
      }
    }
    res.writeHead(404);
    res.end();
  } catch (e) {
    res.writeHead(500);
    res.end(String(e.message));
  }
});

server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  const profile = join(tmpdir(), 'facerep-reels-chrome');
  mkdirSync(profile, { recursive: true });
  const flags = ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions', `--user-data-dir=${profile}`];
  chrome = spawn(CHROME, [...flags, url], { stdio: 'ignore' });
  chrome.on('exit', () => {
    console.log('FAIL Chrome closed before the reel was done.');
    finish(1);
  });
  setTimeout(() => {
    console.log('FAIL Stopped: took longer than 10 minutes.');
    finish(1);
  }, 10 * 60 * 1000);
});
