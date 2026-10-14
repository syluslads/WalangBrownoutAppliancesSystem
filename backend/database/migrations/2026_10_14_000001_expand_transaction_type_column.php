<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            // Expand from varchar(10) to varchar(30) to support extended types
            // such as PRODUCT_CREATED, PRODUCT_UPDATED, SETTING_UPDATED, etc.
            $table->string('type', 30)->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->string('type', 10)->change();
        });
    }
};
