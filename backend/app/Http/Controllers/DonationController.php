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

    // View a user's personal donation history
    public function index(Request $request)
    {
        // 1. Security Check
        if ($request->user()->role !== 'donor') {
            return response()->json(['message' => 'Only donors can view their donation history.'], 403);
        }

        // 2. Fetch donations AND eager load the related campaign details
        // We only select id, title, and status from the campaign to keep the payload lightweight
        $donations = Donation::with('campaign:id,title,status')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc') // Show newest first
            ->get();

        return response()->json($donations, 200);
    }
}