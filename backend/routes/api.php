<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController; // Don't forget to import this!

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/campaigns', [CampaignController::class, 'index']); // View all active campaigns
Route::get('/campaigns/{id}', [CampaignController::class, 'show']); // View single campaign

// --- Protected Routes (Require Login) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Campaign Routes (Requires Login)
    Route::post('/campaigns', [CampaignController::class, 'store']); // Create campaign
    Route::patch('/campaigns/{id}', [CampaignController::class, 'update']); // Edit campaign
    Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy']); // Delete campaign

    // Admin Routes
    Route::patch('/campaigns/{id}/status', [CampaignController::class, 'updateStatus']);

    // Donation Routes
    Route::post('/donations', [\App\Http\Controllers\DonationController::class, 'store']); // Make a donation
    Route::get('/donations', [\App\Http\Controllers\DonationController::class, 'index']); // UC010: View History
    Route::post('/donations', [\App\Http\Controllers\DonationController::class, 'store']); // UC009: Make Donation

    // Allocation Routes
    Route::post('/campaigns/{campaign_id}/allocations', [\App\Http\Controllers\AllocationController::class, 'store']); 
    Route::post('/campaigns/{campaign_id}/allocations', [\App\Http\Controllers\AllocationController::class, 'store']); 
    Route::patch('/campaigns/{campaign_id}/allocations/{id}', [\App\Http\Controllers\AllocationController::class, 'update']);
});