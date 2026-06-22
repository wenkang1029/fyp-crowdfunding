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
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'identification_number' => 'sometimes|nullable|string|max:255',
            'mailing_address' => 'sometimes|nullable|string|max:1000',
            'org_name' => 'sometimes|nullable|string|max:255',
            'org_reg_number' => 'sometimes|nullable|string|max:255',
            'org_description' => 'sometimes|nullable|string|max:2000',
            'is_tax_exempt'  => 'sometimes|nullable',
            'lhdn_reference' => 'required_if:is_tax_exempt,true,1|nullable|string|max:255',
            'permit_file' => 'sometimes|nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            'tax_exemption_file' => 'sometimes|nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ]);

        $updatedUser = $this->profileService->update($user, $validated);

        return response()->json([
            'success' => true,
            'data' => $updatedUser,
            'message' => 'Profile updated successfully',
        ], 200);
    }

    /**
     * View a donor's profile with privacy gating (PDPA 2010 compliant).
     */
    public function showDonor(Request $request, $id)
    {
        $donor = $this->profileService->getDonorProfile($request->user(), intval($id));
        
        return response()->json([
            'success' => true,
            'data' => $donor,
            'message' => 'Donor profile retrieved successfully',
        ], 200);
    }

    /**
     * View an NGO's profile (open to authenticated users).
     */
    public function showNgo(Request $request, $id)
    {
        $ngo = $this->profileService->getNgoProfile(intval($id));
        
        return response()->json([
            'success' => true,
            'data' => $ngo,
            'message' => 'NGO profile retrieved successfully',
        ], 200);
    }
}