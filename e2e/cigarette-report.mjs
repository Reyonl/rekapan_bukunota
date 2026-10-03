// Verifikasi fitur Laporan Rokok: UI → DB → API. Semua entitas uji berprefix "TEST E2E".
const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:8000';
const { chromium } = await import('playwright');

const results = [];
const ok = (name, cond, extra = '') => {
    results.push({ name, pass: !!cond, extra });
    console.log(`${cond ? 'PASS' : 'FAIL'} :: ${name}${extra ? ' — ' + extra : ''}`);
};

async function api(path, opts = {}) {
    const r = await fetch(BASE + '/api' + path, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...opts,
    });
    return { status: r.status, body: await r.json().catch(() => null) };
}

// ---------- sweep sisa uji run sebelumnya ----------
{
    const txs = await api('/transactions?per_page=100');
    for (const t of txs.body.data) {
        if (t.customer?.name?.startsWith('TEST E2E')) await api(`/transactions/${t.id}`, { method: 'DELETE' });
    }
    const cs = await api('/customers?search=TEST');
    for (const c of (Array.isArray(cs.body) ? cs.body : cs.body.data || [])) {
        if (c.name.startsWith('TEST E2E')) await api(`/customers/${c.id}`, { method: 'DELETE' });
    }
}

// ---------- setup data via API ----------
const cust = (await api('/customers', { method: 'POST', body: JSON.stringify({ name: 'TEST E2E Rokok', phone: '0899000001' }) })).body;
const prods = (await api('/products')).body;
const list = Array.isArray(prods) ? prods : prods.data;
const rokokProd = list.find((p) => (p.category?.name || '').toLowerCase().includes('rokok'));
const nonProd = list.find((p) => !(p.category?.name || '').toLowerCase().includes('rokok') && p.is_active);
if (!rokokProd) { console.error('tidak ada produk kategori Rokok di dev DB'); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const bon = (await api('/transactions', { method: 'POST', body: JSON.stringify({ customer_id: cust.id, transaction_date: today }) })).body;
// item 1: produk kategori Rokok (CASE 1)
await api(`/transactions/${bon.id}/items`, { method: 'POST', body: JSON.stringify({ product_id: rokokProd.id, product_name: rokokProd.name, quantity: 2, unit_price: rokokProd.default_price }) });
// item 2: manual name mengandung rokok (CASE 3)
await api(`/transactions/${bon.id}/items`, { method: 'POST', body: JSON.stringify({ product_name: 'ROKOK SAMPOERNA MANUAL', quantity: 1, unit_price: 30000 }) });
// item 3: manual name + description rokok (CASE 7)
await api(`/transactions/${bon.id}/items`, { method: 'POST', body: JSON.stringify({ product_name: 'bungkus uji', description: 'rokok surya baru', quantity: 3, unit_price: 25000 }) });
// item 4: non-rokok (pengganggu, tidak boleh masuk)
await api(`/transactions/${bon.id}/items`, { method: 'POST', body: JSON.stringify({ product_id: nonProd.id, product_name: nonProd.name, quantity: 5, unit_price: 5000 }) });
await api(`/transactions/${bon.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) });

// bon DRAFT dengan rokok — tidak boleh masuk laporan
const bonDraft = (await api('/transactions', { method: 'POST', body: JSON.stringify({ customer_id: cust.id, transaction_date: today }) })).body;
await api(`/transactions/${bonDraft.id}/items`, { method: 'POST', body: JSON.stringify({ product_name: 'rokok draft tidak dihitung', quantity: 9, unit_price: 1000 }) });
// validasi store item menuntut product_name selalu ada (termasuk untuk item manual) — sudah dipatuhi.
const chk = await api(`/transactions/${bonDraft.id}`);
if (chk.body.items.length !== 1) { console.error('GAGAH seed draft', JSON.stringify(chk.body.items)); }
if ((await api(`/transactions/${bon.id}`)).body.items.length !== 4) { console.error('GAGAH seed bon — cek 422 item store'); }

// hitung harapan dari DB
const fresh = (await api(`/transactions/${bon.id}`)).body;
const q1 = fresh.items.filter((i) => i.id)[0];
const expQty = 2 + 1 + 3;
const expSales = 2 * rokokProd.default_price + 30000 + 3 * 25000;

// ---------- API assertions ----------
const rep = await api(`/reports/cigarettes?date_from=${today}&date_to=${today}`);
ok('API 200 + struktur', rep.status === 200 && rep.body.summary && rep.body.items && rep.body.transactions && rep.body.products, JSON.stringify(Object.keys(rep.body)));
ok('API summary qty benar (rokok, bukan draft/non)', rep.body.summary.cigarette_quantity === expQty, `${rep.body.summary.cigarette_quantity} vs ${expQty}`);
ok('API summary sales benar', rep.body.summary.cigarette_sales === expSales, `${rep.body.summary.cigarette_sales} vs ${expSales}`);
ok('API bon_count ≥ 1 & draft tidak masuk', rep.body.summary.bon_count >= 1);
const names = rep.body.items.map((i) => i.product_name.toLowerCase());
ok('API item kategori-rokok masuk', names.includes(rokokProd.name.toLowerCase()), rokokProd.name);
ok('API manual uppercase masuk', names.includes('rokok sampoerna manual'));
ok('API manual via description masuk', names.includes('bungkus uji'));
ok('API non-rokok tidak masuk', !names.some((n) => n.includes('aqua') || n === nonProd.name.toLowerCase()), nonProd.name);
ok('API products dropdown ada', rep.body.products.length >= 1, rep.body.products.slice(0, 3).join(','));

const noBon = rep.body.transactions.data.find((t) => t.id === bonDraft.id);
ok('API draft tidak muncul di bon list', !noBon);

const filtered = await api(`/reports/cigarettes?date_from=${today}&date_to=${today}&product=${encodeURIComponent('sampoerna')}`);
ok('API filter produk bekerja', filtered.body.summary.cigarette_quantity === 1, `${filtered.body.summary.cigarette_quantity} vs 1`);

const bonRep = await api(`/transactions/${bon.id}/cigarettes`);
ok('API bon summary: 3 item rokok', bonRep.status === 200 && bonRep.body.items.length === 3, String(bonRep.body.items?.length));
ok('API bon summary total', bonRep.body.total_quantity === expQty && bonRep.body.total_amount === expSales);

const bonNoRokok = await api(`/transactions/${bonDraft.id}/cigarettes`);
ok('API bon tanpa-rokok-completed: items tetap terisi draft? (hanya dibaca)', bonNoRokok.status === 200);

// ---------- UI ----------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const jsErrs = [];
page.on('pageerror', (e) => jsErrs.push(String(e)));

await page.goto(`${BASE}/laporan/rokok`, { waitUntil: 'networkidle' });
await page.waitForSelector('h1:text-is("Laporan Rokok")', { timeout: 8000 });
await page.waitForSelector(`section[aria-label="Penjualan per item"] span:text-is("${rokokProd.name}")`, { timeout: 8000 });
ok('UI halaman render + item muncul', true);
const totalTxt = await page.locator('span.tnum', { hasText: 'Rp' }).first().textContent();
const apiSales = String(rep.body.summary.cigarette_sales);
ok('UI ringkasan total sesuai API', totalTxt.replace(/[^\d]/g, '') === apiSales.slice(0, apiSales.length) && totalTxt.replace(/[^\d]/g, '').startsWith(apiSales), `${totalTxt} vs ${apiSales}`);
ok('UI preset Hari ini aktif', await page.locator('button', { hasText: 'Hari ini' }).first().isVisible());
ok('UI tabel bon menampilkan nomor', await page.locator('a', { hasText: bon.transaction_number }).first().isVisible(), bon.transaction_number);

// klik bon → detail → section Penjualan Rokok harus ada
await page.locator('a', { hasText: bon.transaction_number }).first().click();
await page.waitForSelector('h1', { timeout: 8000 });
const rokokRows = page.locator('div.divide-y span.truncate');
await page.locator('h2:text-is("Penjualan Rokok")').waitFor({ state: 'visible', timeout: 8000 });
ok('UI detail bon: section Penjualan Rokok', true);
const rowTexts = await rokokRows.allTextContents();
ok('UI detail bon: baris manual masuk', rowTexts.includes('ROKOK SAMPOERNA MANUAL'), rowTexts.join('|'));
ok('UI detail bon: baris description masuk', rowTexts.includes('bungkus uji'));
ok('UI detail bon: kategori rokok masuk', rowTexts.includes(rokokProd.name));
ok('UI detail bon: non-rokok tidak di section', !rowTexts.includes(nonProd.name));

// draft: section boleh tampil (per-bon semua status), tapi laporan tidak menghitung — sudah diverifikasi di API.
await page.goto(`${BASE}/laporan/rokok`, { waitUntil: 'networkidle' });
await page.waitForSelector('button:has-text("Kemarin")');
await page.locator('button', { hasText: 'Kemarin' }).first().click();
await page.waitForTimeout(700);
ok('UI preset Kemarin → zero state', await page.locator('text=Tidak ada penjualan rokok pada periode ini').isVisible().catch(() => false));

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobErr = [];
mob.on('pageerror', (e) => mobErr.push(String(e)));
await mob.goto(`${BASE}/laporan/rokok`, { waitUntil: 'networkidle' });
await mob.waitForSelector('h1:text-is("Laporan Rokok")', { timeout: 8000 });
const overflow = await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
ok('UI mobile 390: render + bottom-nav Rokok', (await mob.locator('nav[aria-label="Navigasi utama"] a', { hasText: 'Rokok' }).first().isVisible()) && !overflow, 'overflow=' + overflow);

ok('UI tanpa JS error', jsErrs.length === 0 && mobErr.length === 0, [...jsErrs, ...mobErr].slice(0, 2).join(' | '));

await browser.close();

// ---------- cleanup ----------
await api(`/transactions/${bon.id}`, { method: 'DELETE' });
await api(`/transactions/${bonDraft.id}`, { method: 'DELETE' });
await api(`/customers/${cust.id}`, { method: 'DELETE' });
const sweep = await api('/customers?search=TEST');
const sw = Array.isArray(sweep.body) ? sweep.body : sweep.body.data;
ok('Cleanup DB dev bersih', sw.every((c) => !c.name.startsWith('TEST E2E')), JSON.stringify(sw.map((c) => c.name)));

const failed = results.filter((r) => !r.pass);
console.log(failed.length ? `CIGARETTE REPORT: ${failed.length} FAILURE(S)` : 'CIGARETTE REPORT: SEMUA LULUS');
process.exit(failed.length ? 1 : 0);
