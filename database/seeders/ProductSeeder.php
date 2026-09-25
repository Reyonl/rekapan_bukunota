<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $minuman = Category::where('name', 'Minuman')->first();
        $makanan = Category::where('name', 'Makanan')->first();
        $jajanan = Category::where('name', 'Jajanan')->first();
        $rokok   = Category::where('name', 'Rokok')->first();
        $lainnya = Category::where('name', 'Lainnya')->first();

        $products = [
            // Minuman
            ['category_id' => $minuman->id, 'name' => 'Kopi',        'default_price' => 5000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Es Kopi',     'default_price' => 7000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Teh',         'default_price' => 4000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Teh Tubruk',  'default_price' => 5000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Es Teh',      'default_price' => 5000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Aqua',        'default_price' => 4000,  'unit' => 'botol'],
            ['category_id' => $minuman->id, 'name' => 'Aqua Galon',  'default_price' => 20000, 'unit' => 'galon'],
            ['category_id' => $minuman->id, 'name' => 'Susu',        'default_price' => 6000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Jeruk',       'default_price' => 6000,  'unit' => 'gelas'],
            ['category_id' => $minuman->id, 'name' => 'Es Jeruk',    'default_price' => 7000,  'unit' => 'gelas'],

            // Makanan
            ['category_id' => $makanan->id, 'name' => 'Makan',       'default_price' => 10000, 'unit' => 'porsi'],
            ['category_id' => $makanan->id, 'name' => 'Nasi',        'default_price' => 4000,  'unit' => 'porsi'],
            ['category_id' => $makanan->id, 'name' => 'Telur',       'default_price' => 3000,  'unit' => 'butir'],
            ['category_id' => $makanan->id, 'name' => 'Mie',         'default_price' => 8000,  'unit' => 'porsi'],
            ['category_id' => $makanan->id, 'name' => 'Mie Rebus',   'default_price' => 10000, 'unit' => 'porsi'],
            ['category_id' => $makanan->id, 'name' => 'Mie Goreng',  'default_price' => 10000, 'unit' => 'porsi'],

            // Jajanan
            ['category_id' => $jajanan->id, 'name' => 'Donat',       'default_price' => 2000,  'unit' => 'pcs'],
            ['category_id' => $jajanan->id, 'name' => 'Ketan',       'default_price' => 3000,  'unit' => 'pcs'],
            ['category_id' => $jajanan->id, 'name' => 'Nagasari',    'default_price' => 2000,  'unit' => 'pcs'],
            ['category_id' => $jajanan->id, 'name' => 'Sosis Solo',  'default_price' => 2000,  'unit' => 'pcs'],
            ['category_id' => $jajanan->id, 'name' => 'Gorengan',    'default_price' => 1000,  'unit' => 'pcs'],

            // Rokok
            ['category_id' => $rokok->id, 'name' => 'Rokok',         'default_price' => 25000, 'unit' => 'bungkus'],
            ['category_id' => $rokok->id, 'name' => 'Rokok Batang',  'default_price' => 2000,  'unit' => 'batang'],

            // Lainnya
            ['category_id' => $lainnya->id, 'name' => 'Item Lainnya', 'default_price' => 0,    'unit' => 'pcs'],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name'], 'category_id' => $product['category_id']],
                $product
            );
        }
    }
}
