<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->string('product_name'); // snapshot - tidak berubah meski master berubah
            $table->string('description')->nullable();
            $table->decimal('quantity', 8, 0)->default(1);
            $table->string('unit')->default('pcs');
            $table->decimal('unit_price', 12, 0)->default(0); // snapshot harga aktual
            $table->decimal('subtotal', 12, 0)->default(0);   // quantity × unit_price
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
