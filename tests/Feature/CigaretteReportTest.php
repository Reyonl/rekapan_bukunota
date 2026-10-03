<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\CigaretteReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CigaretteReportTest extends TestCase
{
    use RefreshDatabase;

    private CigaretteReportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CigaretteReportService();
    }

    private static int $seq = 0;

    private function makeItem(array $overrides = []): TransactionItem
    {
        $customer = Customer::create(['name' => 'Pembeli', 'phone' => '0812']);
        $transaction = Transaction::create([
            'customer_id' => $customer->id,
            'transaction_number' => 'INV-TEST-' . (++self::$seq),
            'transaction_date' => '2026-10-03',
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);

        return TransactionItem::create(array_merge([
            'transaction_id' => $transaction->id,
            'product_name' => 'Kopi',
            'quantity' => 1,
            'unit' => 'pcs',
            'unit_price' => 5000,
            'subtotal' => 5000,
        ], $overrides));
    }

    private function productWithCategory(string $product, string $category): Product
    {
        $cat = Category::create(['name' => $category]);

        return Product::create([
            'category_id' => $cat->id,
            'name' => $product,
            'default_price' => 25000,
            'unit' => 'pcs',
        ]);
    }

    // ---------- TEST CASE WAJIB CLASSIFIER ----------

    public function test_case1_category_rokok_detected(): void
    {
        $product = $this->productWithCategory('Magnum Max', 'Rokok');
        $item = $this->makeItem(['product_id' => $product->id, 'product_name' => 'Magnum Max']);

        $this->assertTrue($this->service->isCigarette($item->fresh(['product.category'])));
    }

    public function test_case2_product_name_rokok_in_other_category(): void
    {
        $product = $this->productWithCategory('Sampoerna Mild', 'Lainnya');
        $item = $this->makeItem([
            'product_id' => $product->id,
            'product_name' => 'Rokok Sampoerna Mild',
        ]);

        $this->assertTrue($this->service->isCigarette($item->fresh(['product.category'])));
    }

    public function test_case3_manual_item_lowercase(): void
    {
        $item = $this->makeItem(['product_id' => null, 'product_name' => 'rokok sampoerna mild']);

        $this->assertTrue($this->service->isCigarette($item->fresh()));
    }

    public function test_case4_manual_item_uppercase(): void
    {
        $item = $this->makeItem(['product_id' => null, 'product_name' => 'ROKOK MAGNUM']);

        $this->assertTrue($this->service->isCigarette($item->fresh()));
    }

    public function test_case4b_mixed_case_with_extra_spaces(): void
    {
        $item = $this->makeItem(['product_id' => null, 'product_name' => '  RoKoK   Magnum  ']);

        $this->assertTrue($this->service->isCigarette($item->fresh()));
    }

    public function test_case5_kopi_minuman_not_cigarette(): void
    {
        $product = $this->productWithCategory('Kopi', 'Minuman');
        $item = $this->makeItem(['product_id' => $product->id, 'product_name' => 'Kopi']);

        $this->assertFalse($this->service->isCigarette($item->fresh(['product.category'])));
    }

    // ---------- REGRESI BUG: kategori = sumber utama, bukan nama ----------

    public function test_bang_lee_category_rokok_without_keyword_in_name(): void
    {
        // Kategori "Rokok" + produk "Bang Lee" (tanpa kata rokok) => WAJIB rokok.
        $product = $this->productWithCategory('Bang Lee', 'Rokok');
        $item = $this->makeItem(['product_id' => $product->id, 'product_name' => 'Bang Lee']);

        $this->assertTrue($this->service->isCigarette($item->fresh(['product.category'])));

        // dan masuk laporan (item breakdown + summary + per bon).
        $report = $this->service->report('2026-10-03', '2026-10-03');
        $this->assertSame(1, $report['summary']['cigarette_quantity']);
        $this->assertSame(5000, $report['summary']['cigarette_sales']);
        $this->assertContains('Bang Lee', array_column($report['items'], 'product_name'));
        $this->assertSame(1, $report['summary']['bon_count']);
    }

    public function test_bang_lee_uppercase_and_spaces_still_via_category(): void
    {
        $product = $this->productWithCategory('BANG   LEE', 'ROKOK');
        $item = $this->makeItem(['product_id' => $product->id, 'product_name' => 'BANG   LEE']);

        $this->assertTrue($this->service->isCigarette($item->fresh(['product.category'])));
    }

    public function test_non_rokok_product_with_similar_text_not_swallowed(): void
    {
        // "Korokok" & "Roket" BUKAN substring "rokok" — tidak boleh ikut.
        $p1 = $this->productWithCategory('Koroko Keras', 'Jajanan');
        $i1 = $this->makeItem(['product_id' => $p1->id, 'product_name' => 'Koroko Keras']);
        $this->assertFalse($this->service->isCigarette($i1->fresh(['product.category'])));

        $i2 = $this->makeItem(['product_id' => null, 'product_name' => 'Roket-ropetan', 'description' => 'mainan anak']);
        $this->assertFalse($this->service->isCigarette($i2->fresh()));

        // kategori "Rokok" tapi item manual (product_id null) dengan nama tanpa rokok → tidak tertangkap
        // via kategori (relasi tidak ada) — sesuai design; masuk laporan hanya bila nama/desc mengandung rokok.
        $i3 = $this->makeItem(['product_id' => null, 'product_name' => 'Bang Lee']);
        $this->assertFalse($this->service->isCigarette($i3->fresh()));
    }

    public function test_case6_manual_aqua_not_cigarette(): void
    {
        $item = $this->makeItem(['product_id' => null, 'product_name' => 'Aqua']);

        $this->assertFalse($this->service->isCigarette($item->fresh()));
    }

    public function test_case7_description_rokok_detected(): void
    {
        $item = $this->makeItem([
            'product_id' => null,
            'product_name' => 'Surya',
            'description' => 'Rokok Surya',
        ]);

        $this->assertTrue($this->service->isCigarette($item->fresh()));
    }

    public function test_case8_matched_by_category_and_name_counted_once(): void
    {
        $product = $this->productWithCategory('Rokok Magnum Max', 'Rokok');
        $item = $this->makeItem([
            'product_id' => $product->id,
            'product_name' => 'Rokok Magnum Max',
            'quantity' => 2,
            'unit_price' => 25000,
            'subtotal' => 50000,
        ]);

        // Boolean classifier: tidak bisa true dua kali.
        $this->assertTrue($this->service->isCigarette($item->fresh(['product.category'])));

        $report = $this->service->report('2026-10-03', '2026-10-03');

        // Dihitung SATU kali: qty 2 subtotal 50.000 (bukan 4/100.000).
        $this->assertSame(2, $report['summary']['cigarette_quantity']);
        $this->assertSame(50000, $report['summary']['cigarette_sales']);
        $this->assertCount(1, $report['items']);
    }

    // ---------- AGREGASI LAPORAN ----------

    private function seedBon(string $number, string $date, string $status, string $payment, array $items): Transaction
    {
        $customer = Customer::firstOrCreate(['name' => 'Pelapor ' . $number], ['phone' => '0812']);
        $transaction = Transaction::create([
            'customer_id' => $customer->id,
            'transaction_number' => $number,
            'transaction_date' => $date,
            'status' => $status,
            'payment_status' => $payment,
            'total_amount' => 0,
        ]);

        foreach ($items as $line) {
            $qty = $line['quantity'];
            $price = $line['unit_price'];
            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'product_name' => $line['name'],
                'quantity' => $qty,
                'unit' => 'pcs',
                'unit_price' => $price,
                'subtotal' => $qty * $price,
            ]);
        }

        return $transaction->fresh();
    }

    public function test_report_aggregation_expected_totals(): void
    {
        // Magnum Max masuk lewat KATEGORI Rokok (case 1), yang lain lewat nama.
        $magnum = $this->productWithCategory('Magnum Max', 'Rokok');
        $bonA = $this->seedBon('INV-A', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Magnum Max', 'quantity' => 2, 'unit_price' => 25000],
        ]);
        $bonA->items()->update(['product_id' => $magnum->id]);
        $this->seedBon('INV-B', '2026-10-03', 'completed', 'unpaid', [
            ['name' => 'Rokok Sampoerna Mild', 'quantity' => 3, 'unit_price' => 30000],
        ]);
        $this->seedBon('INV-C', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Kopi', 'quantity' => 5, 'unit_price' => 5000],
        ]);

        $report = $this->service->report('2026-10-03', '2026-10-03');

        $this->assertSame(5, $report['summary']['cigarette_quantity']);
        $this->assertSame(140000, $report['summary']['cigarette_sales']);
        $this->assertSame(2, $report['summary']['bon_count']);

        $names = array_column($report['items'], 'product_name');
        $this->assertNotContains('Kopi', $names);

        // completed + unpaid tetap masuk penjualan.
        $bonNumbers = array_column($report['transactions']['data'], 'transaction_number');
        $this->assertContains('INV-B', $bonNumbers);

        // paid/unpaid breakdown informasi tambahan.
        $this->assertSame(50000, $report['summary']['paid_sales']);
        $this->assertSame(90000, $report['summary']['unpaid_sales']);
    }

    public function test_draft_transactions_excluded(): void
    {
        $this->seedBon('INV-DRAFT', '2026-10-03', 'draft', 'unpaid', [
            ['name' => 'Rokok Surya', 'quantity' => 4, 'unit_price' => 30000],
        ]);

        $report = $this->service->report('2026-10-03', '2026-10-03');

        $this->assertSame(0, $report['summary']['cigarette_quantity']);
        $this->assertSame(0, $report['summary']['cigarette_sales']);
        $this->assertSame(0, $report['summary']['bon_count']);
    }

    public function test_filter_by_transaction_date_not_created_at(): void
    {
        // Bon terjadi 1 Okt, "dicatat" hari ini via seeding test — transaction_date yang dipakai.
        $this->seedBon('INV-LAMA', '2026-10-01', 'completed', 'paid', [
            ['name' => 'Rokok Surya', 'quantity' => 2, 'unit_price' => 30000],
        ]);

        $today = $this->service->report('2026-10-03', '2026-10-03');
        $this->assertSame(0, $today['summary']['cigarette_quantity']);

        $range = $this->service->report('2026-10-01', '2026-10-03');
        $this->assertSame(2, $range['summary']['cigarette_quantity']);
        $this->assertSame(60000, $range['summary']['cigarette_sales']);
    }

    public function test_product_filter_and_search(): void
    {
        $this->seedBon('INV-F1', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Rokok Magnum', 'quantity' => 1, 'unit_price' => 25000],
        ]);
        $this->seedBon('INV-F2', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Rokok Sampoerna', 'quantity' => 2, 'unit_price' => 30000],
        ]);

        $filtered = $this->service->report('2026-10-03', '2026-10-03', 'Rokok Magnum');
        $this->assertSame(1, $filtered['summary']['cigarette_quantity']);
        $this->assertCount(1, $filtered['items']);

        $searchByNumber = $this->service->report(null, null, null, 'INV-F2');
        $this->assertSame(1, $searchByNumber['summary']['bon_count']);
        $this->assertSame(2, $searchByNumber['summary']['cigarette_quantity']);

        // Daftar nama untuk dropdown filter produk.
        $all = $this->service->report('2026-10-03', '2026-10-03');
        $this->assertContains('Rokok Magnum', $all['products']);
        $this->assertContains('Rokok Sampoerna', $all['products']);
    }

    public function test_historical_snapshot_survives_product_rename(): void
    {
        $product = $this->productWithCategory('Sampoerna Mild', 'Rokok');
        $this->seedBon('INV-H', '2026-10-02', 'completed', 'paid', [
            ['name' => 'Rokok Sampoerna Mild', 'quantity' => 1, 'unit_price' => 30000],
        ]);
        // Item snapshot memakai product master lama:
        TransactionItem::query()->update(['product_id' => $product->id]);

        // Master diganti nama + kategori jadi "Lainnya".
        $other = Category::create(['name' => 'Lainnya']);
        $product->update(['name' => 'Sampoerna Mild 16', 'category_id' => $other->id]);

        $report = $this->service->report('2026-10-01', '2026-10-03');
        $this->assertSame(1, $report['summary']['cigarette_quantity']);
        $this->assertContains('Rokok Sampoerna Mild', array_column($report['items'], 'product_name'));
    }

    // ---------- API ----------

    public function test_api_report_endpoint(): void
    {
        $this->seedBon('INV-API', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Rokok Magnum', 'quantity' => 2, 'unit_price' => 25000],
        ]);

        $res = $this->getJson('/api/reports/cigarettes?date_from=2026-10-03&date_to=2026-10-03');
        $res->assertOk()
            ->assertJsonPath('summary.cigarette_quantity', 2)
            ->assertJsonPath('summary.cigarette_sales', 50000)
            ->assertJsonStructure(['summary', 'items', 'transactions' => ['data', 'total'], 'products']);
    }

    public function test_api_bon_cigarettes_endpoint(): void
    {
        $product = $this->productWithCategory('Magnum Max', 'Rokok');
        $transaction = $this->seedBon('INV-BON1', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Magnum Max', 'quantity' => 2, 'unit_price' => 25000],
            ['name' => 'Rokok Sampoerna Mild', 'quantity' => 1, 'unit_price' => 30000],
            ['name' => 'Kopi', 'quantity' => 5, 'unit_price' => 5000],
        ]);
        // "Magnum Max" masuk lewat KATEGORI (case spec), bukan nama → product_id di-link.
        $transaction->items()->where('product_name', 'Magnum Max')->update(['product_id' => $product->id]);

        $res = $this->getJson("/api/transactions/{$transaction->id}/cigarettes");
        $res->assertOk()
            ->assertJsonPath('total_quantity', 3)
            ->assertJsonPath('total_amount', 80000)
            ->assertJsonCount(2, 'items');
    }

    public function test_bon_summary_without_rokok_is_empty(): void
    {
        $transaction = $this->seedBon('INV-NOROK', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Kopi', 'quantity' => 1, 'unit_price' => 5000],
        ]);

        $summary = $this->service->bonSummary($transaction);
        $this->assertSame([], $summary['items']);
        $this->assertSame(0, $summary['total_quantity']);
    }

    // ---------- PREFILTER SQL == CLASSIFIER (konsistensi) ----------

    public function test_sql_prefilter_matches_php_classifier(): void
    {
        $rokokCat = Category::create(['name' => 'ROKOK']);
        $minuman = Category::create(['name' => 'Minuman']);
        $pRokok = Product::create(['category_id' => $rokokCat->id, 'name' => 'Magnum', 'default_price' => 25000, 'unit' => 'pcs']);
        $pKopi = Product::create(['category_id' => $minuman->id, 'name' => 'Kopi', 'default_price' => 5000, 'unit' => 'pcs']);

        $customer = Customer::create(['name' => 'Konsisten', 'phone' => '0812']);
        $t = Transaction::create([
            'customer_id' => $customer->id,
            'transaction_number' => 'INV-K1',
            'transaction_date' => '2026-10-03',
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);

        $rows = [
            ['product_id' => $pRokok->id, 'product_name' => 'Magnum', 'subtotal' => 25000],          // category
            ['product_id' => $pKopi->id, 'product_name' => 'rOKok Kopi Susu', 'subtotal' => 8000],  // name (ganjil, harus tetap masuk)
            ['product_id' => $pKopi->id, 'product_name' => 'Kopi', 'description' => 'Rokok dibungkus', 'subtotal' => 5000], // desc
            ['product_id' => null, 'product_name' => 'Aqua', 'subtotal' => 3000],                   // tidak
            ['product_id' => $pKopi->id, 'product_name' => 'Kopi', 'subtotal' => 5000],             // tidak
        ];
        foreach ($rows as $r) {
            TransactionItem::create([
                'transaction_id' => $t->id,
                'product_id' => $r['product_id'],
                'product_name' => $r['product_name'],
                'description' => $r['description'] ?? null,
                'quantity' => 1,
                'unit' => 'pcs',
                'unit_price' => $r['subtotal'],
                'subtotal' => $r['subtotal'],
            ]);
        }

        $phpMatched = $t->items()
            ->with('product.category')
            ->get()
            ->filter(fn ($i) => $this->service->isCigarette($i))
            ->pluck('product_name')
            ->sort()
            ->values();

        $sqlMatched = CigaretteReportService::applyItemFilter(TransactionItem::query()->where('transaction_id', $t->id))
            ->get()
            ->pluck('product_name')
            ->sort()
            ->values();

        $this->assertEquals($phpMatched, $sqlMatched);
        $this->assertCount(3, $phpMatched);
    }

    public function test_existing_transaction_flow_untouched(): void
    {
        // Regresi: total bon tetap = jumlah semua item (rokok maupun bukan).
        $transaction = $this->seedBon('INV-REG', '2026-10-03', 'completed', 'paid', [
            ['name' => 'Rokok Magnum', 'quantity' => 2, 'unit_price' => 25000],
            ['name' => 'Kopi', 'quantity' => 1, 'unit_price' => 5000],
        ]);

        $res = $this->getJson("/api/transactions/{$transaction->id}");
        $res->assertOk()->assertJsonPath('total_amount', 55000);
    }
}
