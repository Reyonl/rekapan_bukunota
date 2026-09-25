<?php
$names = ['Doni', 'Kris', 'Bang Lee', 'Pak Ade', 'Uni Chanta', 'Bin Bin', 'Rama', 'Sandi', 'Untung', 'Somay', 'Bakhir', 'Riski', 'Prem', 'Ibu Tempe', 'Taryo', 'Frozen', 'Utar', 'Edi Ayam', 'Aris', 'Aidil', 'Opung', 'Ali Daging', 'Fauzi', 'Mama Sasa', 'Marco', 'Deni Cue', 'Galang', 'Andres', 'Uni Rinda', 'Agus', 'Irfan', 'Ade', 'Daun', 'Roji'];
foreach ($names as $name) {
    \App\Models\Customer::firstOrCreate(['name' => $name]);
}
echo "Added " . count($names) . " customers.\n";
