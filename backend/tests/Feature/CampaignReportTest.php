<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Disbursement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CampaignReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_ngo_can_stream_report_for_owned_campaign(): void
    {
        $ngo = User::factory()->create(['role' => 'ngo']);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Test Campaign',
            'description' => 'Test Description',
            'status' => 'active',
            'target_amount' => 5000,
            'current_amount' => 1500,
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);

        // Add dummy donations
        Donation::create([
            'campaign_id' => $campaign->id,
            'donor_name' => 'John Doe',
            'amount' => 1500,
            'status' => 'success',
        ]);

        // Add dummy disbursements
        Disbursement::create([
            'campaign_id' => $campaign->id,
            'purpose' => 'Rent space',
            'amount' => 500,
            'status' => 'approved',
        ]);

        Sanctum::actingAs($ngo);

        $response = $this->get("/api/campaigns/{$campaign->id}/reports/summary");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }

    public function test_ngo_cannot_stream_report_for_unowned_campaign(): void
    {
        $ngo1 = User::factory()->create(['role' => 'ngo']);
        $ngo2 = User::factory()->create(['role' => 'ngo']);
        $campaign = Campaign::create([
            'user_id' => $ngo2->id,
            'title' => 'Test Campaign',
            'description' => 'Test Description',
            'target_amount' => 1000,
            'current_amount' => 0,
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);

        Sanctum::actingAs($ngo1);

        $response = $this->getJson("/api/campaigns/{$campaign->id}/reports/summary");

        $response->assertStatus(403);
    }

    public function test_admin_can_stream_report_for_any_campaign(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $ngo = User::factory()->create(['role' => 'ngo']);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Test Campaign',
            'description' => 'Test Description',
            'target_amount' => 1000,
            'current_amount' => 0,
            'status' => 'active',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(10),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->get("/api/campaigns/{$campaign->id}/reports/summary");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
