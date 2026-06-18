<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // 1. View all users on the platform (Admin Only)
    public function index(Request $request)
    {
        // Security: Must be an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only Admins can manage accounts.'], 403);
        }

        // Fetch all users, ordered by newest first
        $users = User::orderBy('created_at', 'desc')->get();
        
        return response()->json($users, 200);
    }

    // 2. Delete a specific user (Admin Only)
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Safety Check: Prevent the admin from accidentally deleting themselves!
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully'
        ], 200);
    }

    // 3. Create a new user (Admin Only)
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only Admins can manage accounts.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,ngo,donor',
            'org_name' => 'required_if:role,ngo|nullable|string|max:255',
            'org_reg_number' => 'required_if:role,ngo|nullable|string|max:255',
            'org_description' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role'],
            'org_name' => $validated['role'] === 'ngo' ? $validated['org_name'] : null,
            'org_reg_number' => $validated['role'] === 'ngo' ? $validated['org_reg_number'] : null,
            'org_description' => $validated['role'] === 'ngo' ? $validated['org_description'] : null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User created successfully',
        ], 201);
    }

    // 4. Update status of a specific user (Admin Only)
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only Admins can manage status.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:active,suspended',
        ]);

        $user = User::findOrFail($id);

        if ($user->role === 'admin' && $validated['status'] === 'suspended') {
            return response()->json(['message' => 'You cannot suspend an admin account.'], 400);
        }

        $user->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User status updated successfully.',
        ], 200);
    }
}