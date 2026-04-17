<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // UC003: Manage Profile (Update own data)
    public function update(Request $request)
    {
        // 1. Get the currently authenticated user from the Sanctum token
        $user = $request->user();

        // 2. Validate the incoming data using 'sometimes' 
        // (This means they can update just the name, just the password, or both)
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        // 3. Update the fields if they were provided
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // 4. Save to database
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ], 200);
    }
}