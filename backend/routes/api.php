<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (Anyone can access these)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{id}', [CampaignController::class, 'show']);
Route::post('/campaigns/{id}/donate', [CampaignController::class, 'donate']);

// AI Chatbot Webhook (Public, so external bot servers can reach it)
Route::post('/chatbot/webhook', [\App\Http\Controllers\ChatbotController::class, 'handleWebhook']);


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Requires Login / Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

    // Campaign Actions (Create, Update, Delete)
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::put('/campaigns/{id}', [CampaignController::class, 'update']);
    Route::patch('/campaigns/{id}', [CampaignController::class, 'update']);
    Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy']);

    // Donation Routes
    Route::post('/donations', [\App\Http\Controllers\DonationController::class, 'store']); 
    Route::get('/donations', [\App\Http\Controllers\DonationController::class, 'index']);

    // Allocation & Disbursement Routes
    Route::post('/campaigns/{campaign_id}/allocations', [\App\Http\Controllers\AllocationController::class, 'store']); 
    Route::patch('/campaigns/{campaign_id}/allocations/{id}', [\App\Http\Controllers\AllocationController::class, 'update']);
    Route::post('/campaigns/{campaign_id}/disbursements', [\App\Http\Controllers\DisbursementController::class, 'store']);

    // Dashboard Routes
    Route::get('/dashboard/ngo', [\App\Http\Controllers\DashboardController::class, 'ngoDashboard']);
    Route::get('/dashboard/admin', [\App\Http\Controllers\DashboardController::class, 'adminDashboard']);
    Route::get('/dashboard/ngo/disbursements', [\App\Http\Controllers\DashboardController::class, 'ngoDisbursementDashboard']);

    // Admin Specific Routes
    Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminUserController::class, 'destroy']);
    Route::get('/admin/settings', [\App\Http\Controllers\SettingController::class, 'index']);
    Route::post('/admin/settings', [\App\Http\Controllers\SettingController::class, 'store']);

    // Admin Disbursement Moderation
    Route::get('/admin/disbursements', [\App\Http\Controllers\DisbursementController::class, 'indexAdmin']);
    Route::patch('/admin/disbursements/{id}/status', [\App\Http\Controllers\DisbursementController::class, 'updateStatus']);

    // Report Routes
    Route::get('/campaigns/{campaign_id}/reports/allocations', [\App\Http\Controllers\ReportController::class, 'allocationReport']);
    Route::get('/campaigns/{campaign_id}/reports/disbursements', [\App\Http\Controllers\ReportController::class, 'disbursementReport']);
    
    // Notification Routes
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});