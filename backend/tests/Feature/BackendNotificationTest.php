<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use App\Models\Disbursement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BackendNotificationTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a default admin for notifications that alert admins
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active'
        ]);
    }

    public function test_ngo_registration_notifies_admins(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test NGO Organizer',
            'email' => 'ngo@example.com',
            'password' => 'password321',
            'password_confirmation' => 'password321',
            'role' => 'ngo',
            'org_name' => 'Charity Trust',
            'org_reg_number' => 'REG-NGO-888',
            'org_description' => 'Disaster relief efforts.',
            'mailing_address' => '456 Relief Blvd, Kuala Lumpur',
            'permit_file' => UploadedFile::fake()->create('permit.pdf', 100),
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $this->admin->id,
            'type' => \App\Notifications\NewNgoRegisteredNotification::class,
        ]);
    }

    public function test_campaign_submission_notifies_admins(): void
    {
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active'
        ]);
        Sanctum::actingAs($ngo);

        $response = $this->postJson('/api/campaigns', [
            'title' => 'Feed the Homeless Campaign',
            'description' => 'Providing daily meals to street dwellers.',
            'target_amount' => 1000,
            'start_date' => now()->toIso8601String(),
            'end_date' => now()->addDays(30)->toIso8601String(),
            'use_default_image' => true,
            'allocations' => [
                ['purpose' => 'Meals', 'amount' => 1000]
            ]
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $this->admin->id,
            'type' => \App\Notifications\NewCampaignSubmittedNotification::class,
        ]);
    }

    public function test_donation_notifies_donor_and_ngo_and_checks_goal_reached(): void
    {
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active'
        ]);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'School Build Fund',
            'description' => 'Building classroom blocks.',
            'target_amount' => 1000,
            'current_amount' => 0,
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);

        $donor = User::factory()->create([
            'role' => 'donor',
            'status' => 'active'
        ]);
        Sanctum::actingAs($donor);

        // Perform a donation that does NOT reach the target
        $response = $this->postJson("/api/campaigns/{$campaign->id}/donate", [
            'amount' => 600,
            'payment_method' => 'card'
        ]);

        $response->assertStatus(200);

        // Assert donor success notification exists
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $donor->id,
            'type' => \App\Notifications\DonationSuccessNotification::class,
        ]);

        // Assert NGO received notification exists
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $ngo->id,
            'type' => \App\Notifications\DonationReceivedNotification::class,
        ]);

        // Assert CampaignGoalReached was NOT triggered yet
        $this->assertDatabaseMissing('notifications', [
            'notifiable_id' => $ngo->id,
            'type' => \App\Notifications\CampaignGoalReachedNotification::class,
        ]);

        // Perform a donation that reaches the target
        $response2 = $this->postJson("/api/campaigns/{$campaign->id}/donate", [
            'amount' => 450,
            'payment_method' => 'card'
        ]);

        $response2->assertStatus(200);

        // Assert CampaignGoalReached notification is now triggered
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $ngo->id,
            'type' => \App\Notifications\CampaignGoalReachedNotification::class,
        ]);
    }

    public function test_disbursement_request_notifies_admins(): void
    {
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active'
        ]);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Medical Clinic Fund',
            'description' => 'Buying vaccines.',
            'target_amount' => 2000,
            'current_amount' => 1500, // NGO raised enough to request payout
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);
        Sanctum::actingAs($ngo);

        $response = $this->postJson("/api/campaigns/{$campaign->id}/disbursements", [
            'purpose' => 'Buying syringes and gloves',
            'amount' => 500
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $this->admin->id,
            'type' => \App\Notifications\NewDisbursementRequestNotification::class,
        ]);
    }

    public function test_disbursement_moderation_decision_notifies_ngo(): void
    {
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active',
            'stripe_account_id' => 'acct_test',
            'stripe_onboarding_completed' => true
        ]);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Refugee Shelter Fund',
            'description' => 'Building tents.',
            'target_amount' => 5000,
            'current_amount' => 3000,
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);
        
        $disbursement = Disbursement::create([
            'campaign_id' => $campaign->id,
            'purpose' => 'Tent canvas sheets',
            'amount' => 1000,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($this->admin);

        // Approve disbursement
        $response = $this->patchJson("/api/admin/disbursements/{$disbursement->id}/status", [
            'status' => 'approved'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $ngo->id,
            'type' => \App\Notifications\DisbursementDecidedNotification::class,
        ]);
    }
}
