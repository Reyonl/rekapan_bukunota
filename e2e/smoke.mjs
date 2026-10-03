// Smoke test: semua route utama di desktop + mobile viewport, cek JS error & overflow.
// Jalankan: node e2e/smoke.mjs   (butuh server jalan, mis. http://rekapan_warung.test)
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE || 'http://rekapan_warung.test';
const ROUTES = [
    ['/', 'Dashboard'],
    ['/bon', 'Riwayat Bon'],
    ['/bon/buat', 'Buat Bon'],
    ['/pelanggan', 'Pelanggan'],
    ['/pelanggan/tambah', 'Tambah Pelanggan'],
    ['/item', 'Item'],
    ['/item/kategori', 'Kategori'],
    ['/laporan/rokok', 'Laporan Rokok'],
    ['/pengaturan', 'Pengaturan'],
];
const VIEWS = [
    ['desktop-1280', { width: 1280, height: 900 }],
    ['mobile-390', { width: 390, height: 844 }],
];

const browser = await chromium.launch();
let fails = 0;

for (const [label, vp] of VIEWS) {
    const ctx = await browser.newContext({ viewport: vp });
    for (const [path, name] of ROUTES) {
        const page = await ctx.newPage();
        const errs = [];
        page.on('pageerror', (e) => errs.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
        let status = 'OK';
        let detail = '';
        try {
            const resp = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 });
            if (!resp.ok()) { status = 'HTTP'; detail = resp.status(); }
            else {
                const h1 = await page.locator('h1').first();
                if (!(await h1.isVisible().catch(() => false))) { status = 'NO-H1'; }
                const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
                if (overflow > 1) { status = 'OVERFLOW'; detail = `${overflow}px`; }
            }
        } catch (e) {
            status = 'ERR'; detail = e.message.split('\n')[0];
        }
        if (errs.length) { status = 'JS-ERR'; detail = errs.slice(0, 2).join(' | ').slice(0, 160); }
        if (status !== 'OK') fails++;
        console.log(`[${label}] ${path.padEnd(20)} ${name.padEnd(18)} ${status}${detail ? ' :: ' + detail : ''}`);
        await page.close();
    }
    await ctx.close();
}

// navigasi in-app: klik tab Bon dari dashboard (SPA routing + bottom nav)
{
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.locator('nav[aria-label="Navigasi utama"] a', { hasText: 'Riwayat' }).first().click();
    await page.waitForURL('**/bon');
    const ok = await page.locator('h1').first().isVisible().catch(() => false);
    console.log('[mobile-390] in-app nav Riwayat -> /bon', ok ? 'OK' : 'FAIL');
    if (!ok) fails++;
    await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
process.exit(fails ? 1 : 0);
