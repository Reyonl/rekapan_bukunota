<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['name' => 'Mas Bakir'],
            ['name' => 'Pak Udin'],
            ['name' => 'Bu Siti'],
            ['name' => 'Mas Andi'],
            ['name' => 'Pak Joko'],
            ['name' => 'Tegar'],
            ['name' => 'Wawan'],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(['name' => $customer['name']], $customer);
        }
    }
}
