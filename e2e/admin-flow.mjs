// Alur fungsional halaman manajemen lewat UI: pelanggan, item, kategori (CRUD penuh + cleanup).
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:8000';

// sapu bersih sisa entitas uji dari run sebelumnya (idempotent, aman: hanya nama TEST E2E)
async function sweep() {
    for (const p of ['/products', '/categories', '/customers']) {
        const all = await (await fetch(BASE + '/api' + p, { headers: { Accept: 'application/json' } })).json();
        for (const row of (all.data ?? all)) {
            if (String(row.name).startsWith('TEST E2E')) {
                await fetch(`${BASE}/api${p}/${row.id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
            }
        }
    }
}
await sweep();

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
const step = (n, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} :: ${n}${extra ? ' — ' + extra : ''}`); if (!ok) process.exitCode = 1; };

// ===== PELANGGAN =====
await page.goto(BASE + '/pelanggan/tambah', { waitUntil: 'networkidle' });
await page.locator('#name').fill('TEST E2E Pelanggan');
await page.locator('#phone').fill('081234567890');
await page.getByRole('button', { name: 'Tambah Pelanggan' }).click();
await page.waitForURL(/\/pelanggan$/, { timeout: 8000 });
let list = await (await fetch(`${BASE}/api/customers?search=TEST%20E2E`, { headers: { Accept: 'application/json' } })).json();
let cust = (list.data ?? list)[0];
step('P1 tambah pelanggan -> DB', !!cust && cust.phone === '081234567890', cust?.name);

await page.goto(BASE + '/pelanggan', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Semua' }).click();
await page.waitForTimeout(500);
await page.locator('button[aria-label*="Nonaktifkan TEST E2E"]').first().click();
await page.waitForTimeout(1200);
list = await (await fetch(`${BASE}/api/customers/${cust.id}`, { headers: { Accept: 'application/json' } })).json();
step('P2 toggle nonaktif tersimpan di DB', list.data?.is_active === false || list.is_active === false);

await page.locator('button[aria-label*="Hapus pelanggan TEST E2E"]').first().click();
let dlg = await page.getByRole('dialog').isVisible().catch(() => false);
step('P3 confirm dialog hapus tampil', dlg);
await page.locator('[role="dialog"]').getByRole('button', { name: 'Hapus', exact: true }).click();
await page.waitForTimeout(1200);
const custGone = await (await fetch(`${BASE}/api/customers/${cust.id}`, { headers: { Accept: 'application/json' } })).status;
step('P4 pelanggan terhapus dari DB', custGone >= 400 || custGone === 200 ? custGone >= 400 : false, 'status=' + custGone);

// ===== ITEM (kategori + produk) =====
await page.goto(BASE + '/item/kategori', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Tambah Kategori/ }).first().click();
await page.locator('input[aria-label="Nama kategori baru"]').fill('TEST E2E Kat');
await page.locator('form button:has-text("Simpan")').first().click();
await page.waitForSelector('text=TEST E2E Kat', { timeout: 8000 });
let cats = await (await fetch(`${BASE}/api/categories`, { headers: { Accept: 'application/json' } })).json();
const kat = (cats.data ?? cats).find((c) => c.name === 'TEST E2E Kat');
step('K1 kategori bertambah', !!kat, kat?.name);

await page.locator('button[aria-label*="Edit kategori TEST E2E Kat"]').first().click();
await page.locator('input[aria-label*="Edit nama kategori"]').fill('TEST E2E Kat2');
await page.locator('form button:has-text("Simpan")').first().click();
await page.waitForTimeout(1200);
cats = await (await fetch(`${BASE}/api/categories`, { headers: { Accept: 'application/json' } })).json();
const katRenamed = (cats.data ?? cats).find((c) => c.name === 'TEST E2E Kat2');
step('K2 rename kategori via inline edit', !!katRenamed);

await page.goto(BASE + '/item', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Tambah Item' }).first().click();
await page.waitForSelector('[role="dialog"]');
await page.locator('[role="dialog"] select').selectOption(String(katRenamed.id));
await page.locator('[role="dialog"] input[placeholder*="Teh Manis"]').fill('TEST E2E Produk');
await page.locator('[role="dialog"] input[type="number"]').fill('4500');
await page.locator('[role="dialog"] button:has-text("Tambah Item")').click();
await page.waitForTimeout(1500);
let prods = await (await fetch(`${BASE}/api/products?search=TEST%20E2E`, { headers: { Accept: 'application/json' } })).json();
const prod = (prods.data ?? prods)[0];
step('I1 produk bertambah lewat modal', !!prod && prod.default_price == 4500 && prod.category_id == katRenamed.id, prod?.name);

// hapus produk -> category jadi boleh dihapus
await page.locator('button[aria-label*="Hapus item TEST E2E Produk"]').first().click();
await page.locator('[role="dialog"]').getByRole('button', { name: 'Hapus', exact: true }).click();
await page.waitForTimeout(1500);
prods = await (await fetch(`${BASE}/api/products/${prod?.id}`, { headers: { Accept: 'application/json' } }));
step('I2 produk terhapus (confirm dialog)', prods.status >= 400, 'status=' + prods.status);

await page.goto(BASE + '/item/kategori', { waitUntil: 'networkidle' });
await page.locator('button[aria-label*="Hapus kategori TEST E2E Kat2"]').first().click();
await page.locator('[role="dialog"]').getByRole('button', { name: 'Hapus', exact: true }).click();
await page.waitForTimeout(1500);
cats = await (await fetch(`${BASE}/api/categories`, { headers: { Accept: 'application/json' } })).json();
step('K3 kategori terhapus setelah kosong', !(cats.data ?? cats).some((c) => c.name === 'TEST E2E Kat2'));

step('X tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));

// ---- sapu bersih sisa entitas uji (idempotent) ----
await sweep();
const leftovers = [];
for (const p of ['/products', '/categories', '/customers']) {
    const all = await (await fetch(BASE + '/api' + p, { headers: { Accept: 'application/json' } })).json();
    leftovers.push(...(all.data ?? all).filter((r) => String(r.name).startsWith('TEST E2E')));
}
step('Z DB dev bersih dari sisa uji', leftovers.length === 0, JSON.stringify(leftovers.map((l) => l.name)));

await browser.close();
console.log(process.exitCode ? 'ADMIN FLOW: ADA KE-GAGALAN' : 'ADMIN FLOW: SEMUA LULUS');
