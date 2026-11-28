// Makes a FaceRep reel's MP4 in Google Chrome: no ffmpeg and nothing installed (the same way as Reel Studio).
// Run from the reels-studio folder:
//   node reels/render.mjs reels/001-looksmax            <reel>/out/reel.mp4, the still pictures and sheet.jpg
//   node reels/render.mjs reels/001-looksmax --stills   only the still pictures and sheet.jpg
//   node reels/render.mjs reels/001-looksmax --ffmpeg   in a Claude Code cloud session: the MP4 made by the ffmpeg
//                                                         already there (jsdelivr, the page's encoder, is blocked)
// The page (reels/page/) draws <reel>/reel.js frame by frame. Screens are the app's real screens in reels/screens/
// (copied from FaceRep's store capture by reels/screens.mjs), the font and the icon from reels/assets/, and a reel's
// own pictures from <reel>/art/ (REEL.art: names without .png).

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// The owner's Mac, then Chrome for Testing in a Claude Code cloud session.
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync);
const SCREENS = (name) => [join(here, 'screens', `${name}.jpg`)];
const ASSETS = {
  '/font/anton.ttf': join(here, 'assets', 'Anton-Regular.ttf'),
  '/brand/icon.png': join(here, 'assets', 'icon.png'),
};
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript', png: 'image/png', jpg: 'image/jpeg', ttf: 'font/ttf', wav: 'audio/wav' };
const MAX_BYTES = 300 * 1024 * 1024;

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith('--'));
const reel = folder && resolve(folder);
if (!reel || !existsSync(join(reel, 'reel.js'))) {
  console.log('Use: node reels/render.mjs reels/NNN-name [--stills]');
  process.exit(1);
}
if (!CHROME) {
  console.log('FAIL Google Chrome must be in /Applications (or /usr/bin/google-chrome).');
  process.exit(1);
}
const job = { stillsOnly: args.includes('--stills'), ffmpeg: args.includes('--ffmpeg'), fps: 30, bits: 10_000_000 };
job.voice = existsSync(join(reel, 'voice')); // the voice clips made by reels/voice.mjs
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

// --ffmpeg: the page's frames (JPEG) go into ffmpeg's input in order, with out/sound.wav; ffmpeg writes out/reel.mp4.
let ff = null;
function toFfmpeg(frame) {
  if (!ff) {
    const mp4 = join(out, 'reel.mp4');
    ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(job.fps),
      '-c:v', 'mjpeg', '-i', '-', '-i', join(out, 'sound.wav'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', mp4], { stdio: ['pipe', 'ignore', 'pipe'] });
    ff.errors = '';
    ff.stderr.on('data', (d) => (ff.errors += d));
    ff.exited = new Promise((ok) => ff.on('close', ok));
  }
  return new Promise((ok) => (ff.stdin.write(frame) ? ok('ok') : ff.stdin.once('drain', () => ok('ok'))));
}
async function endFfmpeg() {
  if (!ff) return 'no frames';
  ff.stdin.end();
  if ((await ff.exited) !== 0) return ff.errors.slice(0, 500) || 'failed';
  const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,sample_rate:format=duration',
    '-of', 'compact=p=0:nk=1', join(out, 'reel.mp4')], { encoding: 'utf8' });
  console.log(`     ${probe.trim().split('\n').join(' · ')} s`);
  return 'ok';
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
      const code = /^\/page\/((?:[\w-]+\/)?[\w-]+\.js)$/.exec(req.url); // reels/page/*.js and one folder down
      if (code && existsSync(join(here, 'page', code[1]))) return send(res, join(here, 'page', code[1]));
      const art = /^\/art\/([\w-]+\.png)$/.exec(req.url); // the reel's own pictures (REEL.art)
      if (art && existsSync(join(reel, 'art', art[1]))) return send(res, join(reel, 'art', art[1]));
      const clip = /^\/voice\/([\w-]+\.wav)$/.exec(req.url);
      if (clip && existsSync(join(reel, 'voice', clip[1]))) return send(res, join(reel, 'voice', clip[1]));
      const screen = /^\/screens\/([\w-]+)\.png$/.exec(req.url);
      const shot = screen && SCREENS(screen[1]).find(existsSync);
      if (shot) return send(res, shot);
    }
    if (req.method === 'POST') {
      if (req.url === '/log') {
        console.log((await body(req)).toString().slice(0, 3000));
        return res.end('ok');
      }
      if (req.url === '/frame') return res.end(await toFfmpeg(await body(req)));
      if (req.url === '/frames/end') return res.end(await endFfmpeg());
      const save = /^\/save\/(reel\.mp4|sound\.wav|still-\d+(?:\.\d+)?\.(?:jpg|png)|sheet\.jpg)$/.exec(req.url);
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
