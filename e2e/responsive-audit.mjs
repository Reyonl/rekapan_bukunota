// Audit responsif: 360/390/430/768/1024/1280/1440 — overflow, tombol keluar layar, modal.
import { chromium } from 'playwright';
const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:8000';
const VPS = [360, 390, 430, 768, 1024, 1280, 1440];
const ROUTES = ['/', '/bon', '/bon/buat', '/pelanggan', '/item', '/item/kategori', '/pengaturan'];

const browser = await chromium.launch();
let fails = 0;
for (const w of VPS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    for (const path of ROUTES) {
        const page = await ctx.newPage();
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 });
        const res = await page.evaluate(() => {
            const dw = document.documentElement.clientWidth;
            const scroll = document.documentElement.scrollWidth;
            const off = [];
            document.querySelectorAll('button, a, input, select').forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && (r.right > dw + 2 || r.left < -2) && getComputedStyle(el).position !== 'fixed') {
                    off.push(`${el.tagName}:${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}`);
                }
            });
            return { scroll, dw, off: off.slice(0, 5) };
        });
        if (res.scroll - res.dw > 1 || res.off.length) {
            fails++;
            console.log(`FAIL ${w}px ${path} overflow=${res.scroll - res.dw}px offscreen=[${res.off.join(', ')}]`);
        }
        await page.close();
    }
    // modal check di 360 & 768 hanya di /item (buka dialog tambah)
    if (w === 360 || w === 768) {
        const page = await ctx.newPage();
        await page.goto(BASE + '/item', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: 'Tambah Item' }).first().click();
        await page.waitForSelector('[role="dialog"]');
        await page.waitForTimeout(450); // tunggu animasi modal selesai
        const m = await page.evaluate(() => {
            const d = document.querySelector('[role="dialog"]');
            const r = d.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, w: r.width, vw: document.documentElement.clientWidth, vh: window.innerHeight };
        });
        const bad = m.w > m.vw || m.top < -2 || (w >= 640 && m.bottom > m.vh + 2) || (w < 640 && m.bottom > m.vh + 6);
        if (bad) { fails++; console.log(`FAIL ${w}px modal overflow ${JSON.stringify(m)}`); }
        else console.log(`ok   ${w}px modal ${JSON.stringify(m)}`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        const closed = await page.locator('[role="dialog"]').count() === 0;
        if (!closed) { fails++; console.log(`FAIL ${w}px Esc tidak menutup modal`); }
        await page.close();
    }
    await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} RESPONSIVE FAILURES` : 'RESPONSIVE: ALL PASS');
process.exit(fails ? 1 : 0);
