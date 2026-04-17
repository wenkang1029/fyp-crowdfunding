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
            // It is nullable because a donor might just want to donate to the general campaign
            $table->foreignId('allocation_id')->nullable()->constrained()->nullOnDelete()->after('campaign_id');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['allocation_id']);
            $table->dropColumn('allocation_id');
        });
    }
};
