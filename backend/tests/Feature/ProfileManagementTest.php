<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile_info(): void
    {
        $donor = User::factory()->create([
            'role' => 'donor',
            'status' => 'active',
        ]);
        Sanctum::actingAs($donor);

        $response = $this->patchJson('/api/profile', [
            'name' => 'Updated Donor Name',
            'identification_number' => '123456-10-1234',
            'mailing_address' => 'No 12, Jalan Ampang, Kuala Lumpur',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'name' => 'Updated Donor Name',
            'identification_number' => '123456-10-1234',
            'mailing_address' => 'No 12, Jalan Ampang, Kuala Lumpur',
        ]);
    }

    public function test_ngo_can_update_tax_exemption_profile(): void
    {
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'status' => 'active',
            'org_name' => 'Original Org Name',
            'org_reg_number' => 'NGO-123',
        ]);
        Sanctum::actingAs($ngo);

        $response = $this->patchJson('/api/profile', [
            'org_name' => 'Updated Org Name',
            'is_tax_exempt' => true,
            'lhdn_reference' => 'LHDN.01/35/42/51/999',
            'mailing_address' => 'NGO HQ Office, Petaling Jaya',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $ngo->id,
            'org_name' => 'Updated Org Name',
            'is_tax_exempt' => true,
            'lhdn_reference' => 'LHDN.01/35/42/51/999',
            'mailing_address' => 'NGO HQ Office, Petaling Jaya',
        ]);
    }

    public function test_admin_can_view_any_donor_profile(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create([
            'role' => 'donor',
            'identification_number' => '999999-99-9999',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/profiles/donor/{$donor->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.identification_number', '999999-99-9999');
    }

    public function test_ngo_cannot_view_unrelated_donor_profile(): void
    {
        $ngo = User::factory()->create(['role' => 'ngo']);
        $donor = User::factory()->create([
            'role' => 'donor',
            'identification_number' => '999999-99-9999',
        ]);

        Sanctum::actingAs($ngo);

        $response = $this->getJson("/api/profiles/donor/{$donor->id}");

        $response->assertStatus(403); // Forbidden under PDPA gating
    }

    public function test_ngo_can_view_donor_profile_if_donation_exists(): void
    {
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
        $donor = User::factory()->create([
            'role' => 'donor',
            'identification_number' => '999999-99-9999',
        ]);

        // Create a donation from donor to NGO's campaign
        Donation::create([
            'user_id' => $donor->id,
            'campaign_id' => $campaign->id,
            'donor_name' => $donor->name,
            'amount' => 100,
            'status' => 'success',
        ]);

        Sanctum::actingAs($ngo);

        $response = $this->getJson("/api/profiles/donor/{$donor->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.identification_number', '999999-99-9999');
    }

    public function test_any_user_can_view_ngo_profile(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $ngo = User::factory()->create([
            'role' => 'ngo',
            'org_name' => 'Helping Hands NGO',
            'is_tax_exempt' => true,
        ]);

        Sanctum::actingAs($donor);

        $response = $this->getJson("/api/profiles/ngo/{$ngo->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.org_name', 'Helping Hands NGO');
    }
}
