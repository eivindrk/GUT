const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5500/index.html';
const outDir = '/tmp/gut-menu-test';

async function runOnce(page, deviceName, outSubdir) {
  if (!fs.existsSync(outSubdir)) fs.mkdirSync(outSubdir, { recursive: true });

  const logs = [];
  const errors = [];

  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => errors.push({ type: 'pageerror', message: err.message }));
  page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), errorText: req.failure && req.failure.errorText }));

  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });
  await page.screenshot({ path: path.join(outSubdir, `${deviceName}-01-home.png`), fullPage: true });

  // Click hamburger menu
  try {
    await page.$eval('.hamburger-icon', el => el.click());
    await page.waitForSelector('.dropdown-menu', { visible: true, timeout: 3000 });
    await page.screenshot({ path: path.join(outSubdir, `${deviceName}-02-dropdown-open.png`), fullPage: true });
  } catch (e) {
    errors.push({ type: 'interaction', message: 'hamburger click/open failed', error: e.message });
  }

  // Click close button
  try {
    await page.$eval('.close-button', el => el.click());
    await page.waitForSelector('.dropdown-menu', { hidden: true, timeout: 3000 });
    await page.screenshot({ path: path.join(outSubdir, `${deviceName}-03-dropdown-closed.png`), fullPage: true });
  } catch (e) {
    errors.push({ type: 'interaction', message: 'close button click failed', error: e.message });
  }

  const hrefs = await page.$$eval('.menu-wrapper a, .header-left .menu-tab', els => els.map(e => e.getAttribute('href')).filter(Boolean));
  const results = [];

  for (let i = 0; i < hrefs.length; i++) {
    const href = hrefs[i];
    const full = new URL(href, BASE_URL).href;
    try {
      const resp = await page.goto(full, { waitUntil: 'networkidle2', timeout: 10000 });
      const status = resp && resp.status ? resp.status() : null;
      const title = await page.title();
      const screenshot = path.join(outSubdir, `${deviceName}-page-${i + 1}-${path.basename(href)}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({ href: href, url: full, status, title, screenshot });
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });
    } catch (e) {
      errors.push({ type: 'navigation', href, message: e.message });
    }
  }

  return { logs, errors, results };
}

async function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  const runs = [
    {
      name: 'laptop-1366x768',
      setup: async (page) => {
        await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      }
    },
    {
      name: 'iphone-15-pro-like',
      setup: async (page) => {
        const devices = puppeteer.devices || {};
        const device = devices['iPhone 14 Pro'] || devices['iPhone X'] || {
          name: 'iphone-like',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          viewport: { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
        };
        await page.emulate(device);
      }
    }
  ];

  const aggregate = [];

  for (const runCfg of runs) {
    const page = await browser.newPage();
    await runCfg.setup(page);
    const runOutDir = path.join(outDir, runCfg.name);
    const result = await runOnce(page, runCfg.name, runOutDir);
    const reportPath = path.join(runOutDir, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ run: runCfg.name, ...result }, null, 2));
    aggregate.push({ run: runCfg.name, report: reportPath });
    await page.close();
  }

  await browser.close();

  const summaryPath = path.join(outDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(aggregate, null, 2));
  console.log('Done — reports and screenshots in', outDir);
}

run().catch(err => {
  console.error('TEST FAILED', err && err.stack || err);
  process.exit(2);
});
