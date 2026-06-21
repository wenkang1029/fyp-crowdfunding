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
        Schema::table('donations', function (Blueprint $table) {
            $table->boolean('request_tax_receipt')->default(false)->after('payment_method');
            $table->string('tax_name')->nullable()->after('request_tax_receipt');
            $table->string('tax_id_number')->nullable()->after('tax_name');
            $table->text('tax_address')->nullable()->after('tax_id_number');
            $table->string('tax_receipt_number')->nullable()->after('tax_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn([
                'request_tax_receipt',
                'tax_name',
                'tax_id_number',
                'tax_address',
                'tax_receipt_number'
            ]);
        });
    }
};
