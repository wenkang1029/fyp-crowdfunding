<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function store(Request $request)
    {
        if ($request->user()->role !== 'donor') {
            return response()->json(['message' => 'Only donors can make donations'], 403);
        }

        // 1. Update validation to accept the optional allocation_id
        $validated = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:1',
            'allocation_id' => 'nullable|exists:allocations,id' // Must exist in the allocations table
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);

        if ($campaign->status !== 'active') {
            return response()->json(['message' => 'You can only donate to active campaigns'], 400);
        }

        // 2. Security Check: If they chose an allocation, does it actually belong to THIS campaign?
        if (isset($validated['allocation_id'])) {
            $allocationBelongsToCampaign = $campaign->allocations()->where('id', $validated['allocation_id'])->exists();
            
            if (!$allocationBelongsToCampaign) {
                return response()->json(['message' => 'Invalid allocation preference for this campaign.'], 400);
            }
        }

        try {
            DB::beginTransaction();

            // 3. Save the donation with the preference
            $donation = Donation::create([
                'user_id' => $request->user()->id,
                'campaign_id' => $campaign->id,
                'allocation_id' => $validated['allocation_id'] ?? null, // Save it if it exists
                'amount' => $validated['amount'],
                'status' => 'success',
                'transaction_id' => 'TXN_' . uniqid(), 
            ]);

            $campaign->current_amount += $validated['amount'];
            $campaign->save();

            DB::commit();

            return response()->json([
                'message' => 'Donation successful!',
                'donation' => $donation,
                'campaign_progress' => $campaign->current_amount
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Donation failed.', 'error' => $e->getMessage()], 500);
        }
    }

    // View donation history (Handles BOTH Donors and NGOs)
    public function index(Request $request)
    {
        $user = $request->user();

        // SCENARIO 1: The user is a Donor viewing their personal history
        if ($user->role === 'donor') {
            $donations = Donation::with(['campaign:id,title,status', 'allocation:id,title']) 
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($donations, 200);
        }

        // SCENARIO 2: The user is an NGO viewing their campaign ledger
        if ($user->role === 'ngo') {
            // We use 'whereHas' to only get donations linked to campaigns owned by this NGO
            $donations = Donation::with([
                    'campaign:id,title', 
                    'user:id,name,email', // Eager load the donor's details!
                    'allocation:id,title'
                ])
                ->whereHas('campaign', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($donations, 200);
        }

        // If an Admin or someone else tries to access it
        return response()->json(['message' => 'Unauthorized to view this ledger.'], 403);
    }
}