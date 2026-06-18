<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_suspend_and_reactivate_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor', 'status' => 'active']);

        Sanctum::actingAs($admin);

        // Suspend
        $response = $this->patchJson("/api/admin/users/{$donor->id}/status", [
            'status' => 'suspended',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'status' => 'suspended',
        ]);

        // Reactivate
        $response = $this->patchJson("/api/admin/users/{$donor->id}/status", [
            'status' => 'active',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_cannot_suspend_themselves_or_other_admins(): void
    {
        $admin1 = User::factory()->create(['role' => 'admin']);
        $admin2 = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($admin1);

        $response = $this->patchJson("/api/admin/users/{$admin2->id}/status", [
            'status' => 'suspended',
        ]);

        $response->assertStatus(400);
        $this->assertDatabaseHas('users', [
            'id' => $admin2->id,
            'status' => 'active',
        ]);
    }

    public function test_suspended_user_is_blocked_from_logging_in(): void
    {
        $user = User::create([
            'name' => 'Suspended NGO',
            'email' => 'ngo@example.com',
            'password' => bcrypt('password123'),
            'role' => 'ngo',
            'status' => 'suspended',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ngo@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Your account is suspended. Please contact the administrator.');
    }

    public function test_suspended_user_session_is_aborted_via_middleware(): void
    {
        $user = User::factory()->create(['role' => 'donor', 'status' => 'active']);
        Sanctum::actingAs($user);

        // Make an authenticated request - should pass
        $response = $this->getJson('/api/user');
        $response->assertStatus(200);

        // Suspend user in DB
        $user->update(['status' => 'suspended']);

        // Make another authenticated request - should be caught by active middleware, token deleted, and return 403
        $response = $this->getJson('/api/user');
        $response->assertStatus(403);
        $this->assertEmpty($user->tokens);
    }

    public function test_campaigns_of_suspended_ngos_are_hidden_publicly(): void
    {
        $ngo = User::factory()->create(['role' => 'ngo', 'status' => 'active']);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Ngo Campaign',
            'description' => 'Help kids',
            'target_amount' => 1000,
            'status' => 'active',
        ]);

        // List campaigns publicly - should be visible
        $response = $this->getJson('/api/campaigns');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Suspend NGO
        $ngo->update(['status' => 'suspended']);

        // List campaigns publicly - should now be hidden
        $response = $this->getJson('/api/campaigns');
        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_donations_to_suspended_ngo_campaigns_are_rejected(): void
    {
        $ngo = User::factory()->create(['role' => 'ngo', 'status' => 'suspended']);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Ngo Campaign',
            'description' => 'Help kids',
            'target_amount' => 1000,
            'status' => 'active',
        ]);

        $response = $this->postJson("/api/campaigns/{$campaign->id}/donate", [
            'amount' => 50,
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'This campaign is currently suspended because the organizer account is suspended.');
    }

    public function test_admin_can_delete_campaign(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $ngo = User::factory()->create(['role' => 'ngo']);
        $campaign = Campaign::create([
            'user_id' => $ngo->id,
            'title' => 'Ngo Campaign',
            'description' => 'Help kids',
            'target_amount' => 1000,
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/campaigns/{$campaign->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('campaigns', [
            'id' => $campaign->id,
        ]);
    }
}
