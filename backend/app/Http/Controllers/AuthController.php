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
            'role' => 'required|in:ngo,donor',
            'org_name' => 'required_if:role,ngo|nullable|string|max:255',
            'org_reg_number' => 'required_if:role,ngo|nullable|string|max:255',
            'org_description' => 'nullable|string',
            'mailing_address' => 'required_if:role,ngo|nullable|string|max:1000',
            'is_tax_exempt' => 'sometimes|nullable',
            'permit_file' => 'required_if:role,ngo|nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            'tax_exemption_file' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
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

        if (isset($result['user']) && $result['user']->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is suspended. Please contact the administrator.',
            ], 403);
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