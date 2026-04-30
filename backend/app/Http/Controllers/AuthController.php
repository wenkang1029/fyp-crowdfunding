<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    // --- REGISTER ---
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:admin,ngo,donor'
        ]);

        $result = $this->authService->register($validated);

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'User registered successfully',
        ], 201);
    }

    // --- LOGIN ---
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $result = $this->authService->login($validated['email'], $validated['password']);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'Login successful',
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
            'message' => 'Authenticated user fetched successfully',
        ], 200);
    }

    // --- LOGOUT ---
    public function logout(Request $request)
    {
        $this->authService->logout($request->user(), $request->user()->currentAccessToken());

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Logged out successfully',
        ], 200);
    }
}