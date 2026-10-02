import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const logs = [];
p.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 200)));
p.on('pageerror', e => logs.push('PAGEERROR: ' + String(e).slice(0, 300)));
await p.goto('http://rekapan_warung.test/bon/buat', { waitUntil: 'networkidle' });
const info = await p.evaluate(() => {
    const dw = document.documentElement.clientWidth;
    const bad = [];
    const bEl = document.querySelector('b');
    document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > dw + 1 || r.left < -1) bad.push(`${el.tagName}.${String(el.className).slice(0, 60)} L=${Math.round(r.left)} R=${Math.round(r.right)}`);
    });
    return {
        title: document.title,
        h1: [...document.querySelectorAll('h1')].map(x => x.textContent.trim()).slice(0, 3),
        navs: [...document.querySelectorAll('nav')].map(n => n.getAttribute('aria-label') || 'anon'),
        bHTML: bEl ? String(bEl.outerHTML).slice(0, 120) : null,
        appRoot: document.getElementById('app')?.firstChild?.nodeName + ' / ' + String(document.getElementById('app')?.innerHTML).slice(0, 100),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: dw,
        bottomNav: !!document.querySelector('nav[aria-label]'),
        navLabel: document.querySelector('nav[aria-label]')?.getAttribute('aria-label') || null,
        bad: bad.slice(0, 8),
    };
});
console.log(JSON.stringify(info, null, 1));
console.log(logs.slice(0, 6).join('\n'));
await b.close();
