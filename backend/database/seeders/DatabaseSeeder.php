<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create the System Admin
        User::updateOrCreate(
            ['email' => 'admin@aidwise.org'], // Secure email
            [
                'name' => 'System Admin',
                'password' => Hash::make('password321'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 2. Create a Test NGO with Organization Details
        $ngo = User::updateOrCreate(
            ['email' => 'ngo@helpinghands.org'],
            [
                'name' => 'Helping Hands NGO',
                'password' => Hash::make('password321'),
                'role' => 'ngo',
                'org_name' => 'Helping Hands Foundation',
                'org_reg_number' => 'NGO-12345',
                'org_description' => 'Providing clean water, healthcare, and education resources to rural communities.',
                'status' => 'active',
            ]
        );
        
        // 3. Create a Test Donor
        User::updateOrCreate(
            ['email' => 'donor@example.com'],
            [
                'name' => 'Generous Donor',
                'password' => Hash::make('password321'),
                'role' => 'donor',
                'status' => 'active',
            ]
        );

        // 4. Create sample campaigns for the NGO so the platform has active data
        \App\Models\Campaign::updateOrCreate(
            ['title' => 'Clean Water Initiative'],
            [
                'user_id' => $ngo->id,
                'description' => 'Building water filtration systems and wells in rural villages to provide safe, clean drinking water.',
                'target_amount' => 50000,
                'current_amount' => 0,
                'status' => 'active',
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(25),
            ]
        );

        \App\Models\Campaign::updateOrCreate(
            ['title' => 'Books for Rural Schools'],
            [
                'user_id' => $ngo->id,
                'description' => 'Providing textbooks, stationary, and basic classroom library books to children in underprivileged regions.',
                'target_amount' => 15000,
                'current_amount' => 0,
                'status' => 'active',
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(40),
            ]
        );
    }
}