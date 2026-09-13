// Render a document HTML file to a Letter PDF plus per-page PNG previews.
//   NODE_PATH=$(npm root -g) node render.js <input.html> <output.pdf> <pageCount>
const { chromium } = require('playwright');
const path = require('path');
const [src, out, pages = '1'] = process.argv.slice(2);
if (!src || !out) { console.error('usage: render.js <input.html> <output.pdf> [pages]'); process.exit(1); }
const dir = path.dirname(path.resolve(src));
const n = parseInt(pages, 10);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.setViewportSize({ width: 830, height: 1056 * n + 20 });
  await p.goto('file://' + path.resolve(src), { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(2200);
  await p.pdf({ path: out, format: 'Letter', printBackground: true,
                margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  for (let i = 0; i < n; i++) {
    await p.screenshot({ path: path.join(dir, `preview-${i + 1}.png`),
                         clip: { x: 7, y: i * 1056, width: 816, height: 1056 } });
  }
  await b.close();
  console.log('wrote', out);
})();
