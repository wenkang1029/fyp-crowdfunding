<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->string('purpose');
            $table->decimal('amount', 10, 2);
            $table->string('receipt_path')->nullable();
            $table->string('status')->default('pending'); // The critical column
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disbursements');
    }
};