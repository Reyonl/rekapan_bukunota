// Alur fungsional transaksi penuh lewat UI: buat bon → item manual → hapus item →
// payment toggle → simpan → cek DB → edit qty → cek DB → cleanup.
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:8000';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|favicon/.test(m.text())) errs.push(m.text()); });

const step = (n, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} :: ${n}${extra ? ' — ' + extra : ''}`); if (!ok) process.exitCode = 1; };

await page.goto(BASE + '/bon/buat', { waitUntil: 'networkidle' });

// 1. pilih pelanggan (react-select: klik control, panah, enter)
const openSelect = async (which) => {
    // which: 0 = pelanggan, 1 = item. react-select control selalu ber-class "*-control".
    await page.locator('div[class*="-control"]').nth(which).locator('input').first().click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);
};
await openSelect(0);
const custChosen = (await page.getByText('Cari pelanggan...').count()) === 0;
step('1. pelanggan terpilih', custChosen);

// 2. header disimpan -> redirect /bon/:id/edit
await page.getByRole('button', { name: /Lanjut ke Input Item/ }).click();
await page.waitForURL(/\/bon\/\d+\/edit/, { timeout: 10000 });
const bonId = page.url().match(/\/bon\/(\d+)\/edit/)[1];
step('2. header tersimpan & redirect', !!bonId, 'bon id=' + bonId);

// 3. item manual pertama
await openSelect(1); // opsi teratas = "+ Input Manual / Item Lain"
await page.locator('input[placeholder="Nama item"]').fill('TEST E2E Item');
await page.locator('input[placeholder="Contoh: Tegar"]').fill('catatan e2e');
await page.locator('input[type="number"]').fill('2');
await page.locator('input[inputmode="numeric"]').fill('4500');
await page.getByRole('button', { name: /Tambah Item/ }).click();
await page.waitForSelector('text=TEST E2E Item', { timeout: 8000 }).catch(() => {});
const itemsAfterAdd1 = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('3. item 1 masuk (DB: 1 item)', itemsAfterAdd1.items?.length === 1 && itemsAfterAdd1.items[0].product_name === 'TEST E2E Item');

// 4. item kedua — mode manual masih aktif (perilaku asli app), isi langsung
await page.locator('input[placeholder="Nama item"]').fill('TEST E2E Item2');
await page.locator('input[type="number"]').fill('1');
await page.locator('input[inputmode="numeric"]').fill('1000');
await page.getByRole('button', { name: /Tambah Item/ }).click();
await page.waitForTimeout(1500);
const total1 = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('4. dua item, total 10000 di DB', total1.total_amount == 10000, 'total=' + total1.total_amount);

// 5. hapus item2 via ConfirmDialog (pengganti window.confirm)
await page.locator('button[aria-label*="Hapus item TEST E2E Item2"]').first().click();
const dialogShown = await page.getByText('Hapus item ini?').isVisible().catch(() => false);
step('5a. ConfirmDialog hapus item tampil', dialogShown);
await page.getByRole('button', { name: 'Hapus' }).last().click();
await page.waitForTimeout(1500);
const afterDel = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('5b. item2 terhapus di DB, total 9000', afterDel.items?.length === 1 && afterDel.total_amount == 9000);

// 6. toggle payment
await page.getByRole('button', { name: /Sudah Dibayar/ }).click();
await page.waitForTimeout(1000);
const afterPay = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('6. payment paid tersimpan di DB', afterPay.payment_status === 'paid');

// 7. finalize
await page.getByRole('button', { name: /Simpan Bon/ }).click();
await page.waitForURL(new RegExp(`/bon/${bonId}$`), { timeout: 10000 });
await page.waitForSelector('.thermal-receipt-preview', { timeout: 10000 }).catch(() => {});
const h1Visible = await page.locator('h1').first().isVisible().catch(() => false);
step('7. finalize -> detail bon', h1Visible || (await page.locator('.thermal-receipt-preview').count()) > 0, 'url=' + page.url());
const afterFinal = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('7b. status completed di DB', afterFinal.status === 'completed');

// 8. receipt preview & QR ada
step('8. preview struk tampil', await page.locator('.thermal-receipt-preview').first().isVisible().catch(() => false));

// 9. edit qty lewat UI -> DB (link header 'Edit Bon' unik, bukan tombol sticky 'Simpan Bon')
await page.getByRole('link', { name: /^Edit Bon$/ }).first().click();
await page.waitForTimeout(1500);
await page.locator('button[aria-label*="Edit item"]').first().click();
await page.locator('input[type="number"]').fill('3');
await page.getByRole('button', { name: /Update Item/ }).click();
await page.waitForTimeout(1500);
const afterEdit = await (await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } })).json();
step('9. edit qty 2->3 tersimpan (total 13500)', afterEdit.total_amount == 13500, 'total=' + afterEdit.total_amount);

// 10. tanpa JS error sepanjang alur
step('10. tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));

// cleanup bon uji
const del = await fetch(`${BASE}/api/transactions/${bonId}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
const gone = await fetch(`${BASE}/api/transactions/${bonId}`, { headers: { Accept: 'application/json' } });
step('11. cleanup bon uji dari DB', del.ok && gone.status >= 400, 'gone=' + gone.status);

await browser.close();
console.log(process.exitCode ? 'FLOW: ADA KE-GAGALAN' : 'FLOW: SEMUA LULUS');
