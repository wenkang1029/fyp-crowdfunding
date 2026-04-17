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

    // Dashboard Routes
    Route::get('/dashboard/ngo', [\App\Http\Controllers\DashboardController::class, 'ngoDashboard']);
    Route::get('/dashboard/admin', [\App\Http\Controllers\DashboardController::class, 'adminDashboard']);
    Route::get('/dashboard/ngo/disbursements', [\App\Http\Controllers\DashboardController::class, 'ngoDisbursementDashboard']); // UC018

    // Admin Account Management Routes
    Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminUserController::class, 'destroy']);

    // Disbursement Routes
    Route::post('/campaigns/{campaign_id}/disbursements', [\App\Http\Controllers\DisbursementController::class, 'store']);

    // Profile Management
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

    // System Settings (Admin Only)
    Route::get('/admin/settings', [\App\Http\Controllers\SettingController::class, 'index']);
    Route::post('/admin/settings', [\App\Http\Controllers\SettingController::class, 'store']);

    // Report Routes
    Route::get('/campaigns/{campaign_id}/reports/allocations', [\App\Http\Controllers\ReportController::class, 'allocationReport']);
    Route::get('/campaigns/{campaign_id}/reports/disbursements', [\App\Http\Controllers\ReportController::class, 'disbursementReport']);
    
    // Notification Routes (Available to ALL logged-in users)
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});

// AI Chatbot Webhook (Public, so external bot servers can reach it)
Route::post('/chatbot/webhook', [\App\Http\Controllers\ChatbotController::class, 'handleWebhook']);