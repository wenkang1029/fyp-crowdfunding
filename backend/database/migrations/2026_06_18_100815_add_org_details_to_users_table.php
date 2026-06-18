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
            $table->string('org_name')->nullable()->after('role');
            $table->string('org_reg_number')->nullable()->after('org_name');
            $table->text('org_description')->nullable()->after('org_reg_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['org_name', 'org_reg_number', 'org_description']);
        });
    }
};
