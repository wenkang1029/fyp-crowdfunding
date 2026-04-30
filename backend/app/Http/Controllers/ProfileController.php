<?php

namespace App\Http\Controllers;

use App\Services\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profileService)
    {
    }

    // UC003: Manage Profile (Update own data)
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        $updatedUser = $this->profileService->update($user, $validated);

        return response()->json([
            'success' => true,
            'data' => $updatedUser,
            'message' => 'Profile updated successfully',
        ], 200);
    }
}