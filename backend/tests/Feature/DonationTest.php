<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use App\Models\Allocation;
use App\Models\Donation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DonationTest extends TestCase
{
    use RefreshDatabase;

    private $ngo;
    private $donor;
    private $campaign;
    private $allocations;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active',
            'stripe_account_id' => 'acct_test_123',
            'stripe_onboarding_completed' => true
        ]);

        $this->donor = User::factory()->create([
            'role' => 'donor',
            'status' => 'active'
        ]);

        $this->campaign = Campaign::create([
            'user_id' => $this->ngo->id,
            'title' => 'Save the Forests',
            'description' => 'Help us plant 1000 trees.',
            'target_amount' => 5000,
            'current_amount' => 0,
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);

        $this->allocations = [
            Allocation::create(['campaign_id' => $this->campaign->id, 'purpose' => 'Seeds', 'amount' => 2000]),
            Allocation::create(['campaign_id' => $this->campaign->id, 'purpose' => 'Tools', 'amount' => 2000]),
            Allocation::create(['campaign_id' => $this->campaign->id, 'purpose' => 'Watering', 'amount' => 1000]),
        ];
    }

    public function test_donor_can_create_single_allocation_donation_draft(): void
    {
        Sanctum::actingAs($this->donor);

        $response = $this->postJson('/api/donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 150,
            'allocation_id' => $this->allocations[0]->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 150.00,
            'allocation_id' => $this->allocations[0]->id,
            'status' => 'pending',
        ]);
    }

    public function test_donor_can_create_multi_allocation_split_donation_draft(): void
    {
        Sanctum::actingAs($this->donor);

        $response = $this->postJson('/api/donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 150,
            'allocation_ids' => [
                $this->allocations[0]->id,
                $this->allocations[1]->id,
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        // Verify that 2 distinct pending records of RM 75.00 each were created
        $this->assertDatabaseHas('donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 75.00,
            'allocation_id' => $this->allocations[0]->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 75.00,
            'allocation_id' => $this->allocations[1]->id,
            'status' => 'pending',
        ]);
    }

    public function test_multi_allocation_split_donation_stripe_webhook_settlement(): void
    {
        Sanctum::actingAs($this->donor);

        // 1. Create a split donation draft
        $response = $this->postJson('/api/donations', [
            'campaign_id' => $this->campaign->id,
            'amount' => 150,
            'allocation_ids' => [
                $this->allocations[0]->id,
                $this->allocations[1]->id,
            ],
        ]);

        $response->assertStatus(201);
        
        // Find the generated pending donations
        $donations = Donation::where('campaign_id', $this->campaign->id)->get();
        $this->assertCount(2, $donations);
        $donationIds = $donations->pluck('id')->implode(',');

        // 2. Trigger Stripe succeeded webhook
        $webhookResponse = $this->postJson('/api/webhooks/stripe', [
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'ch_mock_12345',
                    'metadata' => [
                        'donation_ids' => $donationIds,
                        'campaign_id' => $this->campaign->id,
                    ],
                ],
            ],
        ]);

        $webhookResponse->assertStatus(200);

        // Verify all related donations are set to success
        foreach ($donations as $donation) {
            $this->assertDatabaseHas('donations', [
                'id' => $donation->id,
                'status' => 'success',
                'transaction_id' => 'ch_mock_12345',
            ]);
        }

        // Verify campaign progress increased by total 150
        $this->assertEquals(150.00, $this->campaign->fresh()->current_amount);
    }
}
