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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            // FIX: Make user_id nullable for guest donations
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); 
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            
            // NEW: Capture the name of anonymous donors!
            $table->string('donor_name')->default('Anonymous'); 
            
            $table->decimal('amount', 10, 2);
            
            // FIX: Default to 'success' for now since we haven't built the payment gateway yet
            $table->enum('status', ['pending', 'success', 'failed'])->default('success'); 
            $table->string('transaction_id')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
