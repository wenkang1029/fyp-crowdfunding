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
        Schema::table('users', function (Blueprint $table) {
            $table->string('identification_number')->nullable()->after('status');
            $table->text('mailing_address')->nullable()->after('identification_number');
            $table->boolean('is_tax_exempt')->default(false)->after('mailing_address');
            $table->string('lhdn_reference')->nullable()->after('is_tax_exempt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['identification_number', 'mailing_address', 'is_tax_exempt', 'lhdn_reference']);
        });
    }
};
