<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity_received');
            $table->integer('quantity_available');
            $table->date('received_date');
            $table->date('expiration_date')->nullable()->comment('Required for perishable products');
            $table->string('batch_number')->nullable()->comment('Optional supplier batch or lot number');
            $table->string('location')->nullable()->comment('Warehouse location / bin reference');
            $table->decimal('unit_cost', 10, 2)->nullable()->comment('Cost per unit at time of receipt');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
