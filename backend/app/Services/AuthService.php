<?php

namespace App\Services;

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'donor',
            'org_name' => ($data['role'] ?? 'donor') === 'ngo' ? ($data['org_name'] ?? null) : null,
            'org_reg_number' => ($data['role'] ?? 'donor') === 'ngo' ? ($data['org_reg_number'] ?? null) : null,
            'org_description' => ($data['role'] ?? 'donor') === 'ngo' ? ($data['org_description'] ?? null) : null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user, ?PersonalAccessToken $currentToken): void
    {
        if ($currentToken) {
            $currentToken->delete();
            return;
        }

        $user->tokens()->delete();
    }
}
