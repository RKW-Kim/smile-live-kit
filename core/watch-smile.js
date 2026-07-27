// SMILE CHART WATCHER · dev-free mirror of the open chart.
// It opens a REAL smile.co.ke window you trade in; OBS Window-Captures that window for the
// chart frame, and this script reads the active symbol and writes active.json for the bridge.
// ONE-TIME: in this folder run   npm init -y   then   npm i puppeteer
// Then send me the SELECTOR below (right-click the symbol on /trading -> Inspect -> Copy selector)
// and I'll hand you this file pre-filled. With SELECTOR empty, this script safely does nothing.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SMILE_URL = 'https://smile.co.ke/trading';
const SELECTOR  = '';                 // <-- the active-symbol element, e.g. '#chart-symbol' or '.instrument-name'
const OUT       = path.join(__dirname, 'active.json');
const PROFILE   = path.join(__dirname, 'smile-profile');   // keeps your login between runs

if (!SELECTOR) { console.log('No SELECTOR set yet. Send it to me and I will pre-fill this file.'); process.exit(0); }

(async () => {
  const browser = await puppeteer.launch({ headless: false, userDataDir: PROFILE, args: ['--start-maximized'] });
  const page = (await browser.pages())[0] || await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(SMILE_URL, { waitUntil: 'networkidle2' }).catch(() => {});
  console.log('Watching', SMILE_URL, '- trade in THIS window. Close it to stop.');
  let last = '';
  setInterval(async () => {
    try {
      const sym = await page.$eval(SELECTOR, el => (el.textContent || '').trim()).catch(() => '');
      if (sym && sym !== last) { last = sym; fs.writeFileSync(OUT, JSON.stringify({ symbol: sym, ts: Date.now() })); console.log('active ->', sym); }
    } catch (e) {}
  }, 2000);
})();