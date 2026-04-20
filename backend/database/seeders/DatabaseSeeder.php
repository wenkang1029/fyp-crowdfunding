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
            ['email' => 'admin2@example.com'], // Ensure no duplicates
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Create a Test NGO
        User::updateOrCreate(
            ['email' => 'contact2@helpinghands.org'],
            [
                'name' => 'Water for All NGO',
                'password' => Hash::make('password123'),
                'role' => 'ngo',
            ]
        );
        
        // 3. Create a Test Donor (for future use)
        User::updateOrCreate(
            ['email' => 'donor@example.com'],
            [
                'name' => 'Generous Donor',
                'password' => Hash::make('password123'),
                'role' => 'donor',
            ]
        );
    }
}