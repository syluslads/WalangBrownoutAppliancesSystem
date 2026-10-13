<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained()->restrictOnDelete();
            $table->string('unit')->default('piece')->comment('Unit of measure, e.g. piece, box, set');
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->boolean('is_perishable')->default(false)->comment('Perishable products require an expiration date on stock-in');
            $table->integer('reorder_point')->default(0)->comment('Minimum stock level before a reorder alert fires');
            $table->integer('safety_stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
