<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AllocationGeneratorTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that non-NGOs cannot access the allocations generator endpoint.
     */
    public function test_non_ngo_cannot_access_generator(): void
    {
        $user = User::factory()->create(['role' => 'donor', 'status' => 'active']);
        $file = UploadedFile::fake()->create('budget.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)
            ->postJson('/api/campaigns/generate-allocations', [
                'file' => $file,
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test that validation fails if no file is uploaded.
     */
    public function test_validation_fails_without_file(): void
    {
        $user = User::factory()->create(['role' => 'ngo', 'status' => 'active']);

        $response = $this->actingAs($user)
            ->postJson('/api/campaigns/generate-allocations', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test successful parsing of budget document.
     */
    public function test_successful_allocation_generation(): void
    {
        $user = User::factory()->create(['role' => 'ngo', 'status' => 'active']);
        $file = UploadedFile::fake()->create('budget.png', 100, 'image/png');

        // Mock configuration key
        config(['services.gemini.key' => 'mock-api-key']);

        // Mock Gemini Service API call
        $mockResponseBody = [
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'allocations' => [
                                        ['purpose' => 'Medical Equipment', 'amount' => 5000],
                                        ['purpose' => 'Logistics', 'amount' => 1500]
                                    ]
                                ])
                            ]
                        ]
                    ]
                ]
            ]
        ];

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($mockResponseBody, 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/campaigns/generate-allocations', [
                'file' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'allocations' => [
                        ['purpose' => 'Medical Equipment', 'amount' => 5000],
                        ['purpose' => 'Logistics', 'amount' => 1500]
                    ]
                ]
            ]);
    }
}
