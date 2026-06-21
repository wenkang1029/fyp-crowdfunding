<?php

namespace App\Services;

use App\Models\User;
use App\Models\Donation;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    /**
     * Update current user profile.
     */
    public function update(User $user, array $data): User
    {
        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        // Handle profile fields
        if (isset($data['identification_number'])) {
            $user->identification_number = $data['identification_number'];
        }

        if (isset($data['mailing_address'])) {
            $user->mailing_address = $data['mailing_address'];
        }

        // Handle NGO specific fields
        if ($user->role === 'ngo') {
            if (isset($data['org_name'])) {
                $user->org_name = $data['org_name'];
            }
            if (isset($data['org_reg_number'])) {
                $user->org_reg_number = $data['org_reg_number'];
            }
            if (isset($data['org_description'])) {
                $user->org_description = $data['org_description'];
            }
            if (isset($data['is_tax_exempt'])) {
                $user->is_tax_exempt = filter_var($data['is_tax_exempt'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['lhdn_reference'])) {
                $user->lhdn_reference = $data['lhdn_reference'];
            }
        }

        $user->save();

        return $user;
    }

    /**
     * Get a donor's profile with privacy gating (PDPA 2010 compliant).
     */
    public function getDonorProfile(User $requester, int $donorId): User
    {
        $donor = User::where('role', 'donor')->findOrFail($donorId);

        // 1. Admin has full access
        if ($requester->role === 'admin') {
            return $donor;
        }

        // 2. The donor themselves can view their own profile
        if ($requester->id === $donorId) {
            return $donor;
        }

        // 3. NGO can view ONLY if this donor has donated to one of their campaigns
        if ($requester->role === 'ngo') {
            $hasDonated = Donation::where('user_id', $donorId)
                ->whereHas('campaign', function ($query) use ($requester) {
                    $query->where('user_id', $requester->id);
                })->exists();

            if ($hasDonated) {
                return $donor;
            }
        }

        abort(403, 'Access denied. Donor profile data is PDPA-protected and restricted to related campaign organizers.');
    }

    /**
     * Get an NGO's profile. Open to all authenticated users.
     */
    public function getNgoProfile(int $ngoId): User
    {
        return User::where('role', 'ngo')->findOrFail($ngoId);
    }
}
