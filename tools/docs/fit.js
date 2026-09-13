// Reports, per .page div, how much content overflows the printable area.
// .page is clamped to 11in with overflow:hidden, so anything over is CLIPPED in the PDF.
const { chromium } = require('playwright');
const SP = '/tmp/claude-0/-home-user-tonys-window-cleaning-previewv2/66e386f7-ce15-5903-aaa2-5c7de54b9f9c/scratchpad';
const files = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  let bad = 0;
  for (const f of files) {
    const p = await b.newPage();
    await p.setViewportSize({ width: 900, height: 1100 });
    await p.goto(`file://${SP}/${f}`, { waitUntil: 'load' }).catch(() => {});
    await p.waitForTimeout(2200);
    const rows = await p.evaluate(() => [...document.querySelectorAll('.page')].map((el, i) => {
      const foot = el.querySelector('.foot');
      // last real content node before the absolutely positioned footer
      const kids = [...el.children].filter(c => c !== foot);
      const last = kids[kids.length - 1];
      const elTop = el.getBoundingClientRect().top;
      const contentBottom = last ? Math.round(last.getBoundingClientRect().bottom - elTop) : 0;
      const footTop = foot ? Math.round(foot.getBoundingClientRect().top - elTop) : 1056;
      return { i: i + 1, scroll: el.scrollHeight, client: el.clientHeight, contentBottom, footTop };
    }));
    console.log(`\n${f}`);
    for (const r of rows) {
      // usable area ends where the footer rule starts, minus a little breathing room
      const limit = r.footTop - 10;
      const over = r.contentBottom - limit;
      const flag = over > 0 ? `OVER by ${over}px` : `fits, ${-over}px spare`;
      if (over > 0) bad++;
      console.log(`  page ${r.i}: content ends ${r.contentBottom}, limit ${limit}  ->  ${flag}`);
    }
    await p.close();
  }
  await b.close();
  console.log(bad ? `\n${bad} page(s) still overflowing` : `\nALL PAGES FIT`);
})();
