<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('max_stock_level')->default(0)->after('reorder_point')
                ->comment('Maximum stock level before overstock alert fires');
            $table->boolean('is_seasonal')->default(false)->after('is_perishable')
                ->comment('Mark products as seasonal for special monitoring');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['max_stock_level', 'is_seasonal']);
        });
    }
};
