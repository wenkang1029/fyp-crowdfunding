<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_as_donor_succeeds(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Donor',
            'email' => 'donor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'donor',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'donor@example.com',
            'role' => 'donor',
        ]);
    }

    public function test_public_registration_as_ngo_requires_org_details(): void
    {
        // Fail when org details are missing
        $response = $this->postJson('/api/register', [
            'name' => 'Test NGO',
            'email' => 'ngo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'ngo',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['org_name', 'org_reg_number']);

        // Succeed when org details are provided
        $response = $this->postJson('/api/register', [
            'name' => 'Test NGO',
            'email' => 'ngo2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'ngo',
            'org_name' => 'Aid NGO',
            'org_reg_number' => 'NGO-999',
            'org_description' => 'Helping kids.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'ngo2@example.com',
            'role' => 'ngo',
            'org_name' => 'Aid NGO',
            'org_reg_number' => 'NGO-999',
            'org_description' => 'Helping kids.',
        ]);
    }

    public function test_public_registration_as_admin_is_forbidden(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_admin_can_create_any_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New Admin Created By Admin',
            'email' => 'new_admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'new_admin@example.com',
            'role' => 'admin',
        ]);
    }

    public function test_non_admin_cannot_create_user_via_admin_route(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        Sanctum::actingAs($donor);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'new_user@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'donor',
        ]);

        $response->assertStatus(403);
    }
}
