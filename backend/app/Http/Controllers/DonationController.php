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
        // 1. Security Check: Only donors can make donations
        if ($request->user()->role !== 'donor') {
            return response()->json(['message' => 'Only donors can make donations'], 403);
        }

        // 2. Validate input
        $validated = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:1',
            // In a real app, we'd get a payment token here from Stripe/ToyyibPay
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);

        // 3. Ensure the campaign is actually active
        if ($campaign->status !== 'active') {
            return response()->json(['message' => 'You can only donate to active campaigns'], 400);
        }

        try {
            // 4. Start the Database Transaction
            DB::beginTransaction();

            // Step A: Create the donation record
            $donation = Donation::create([
                'user_id' => $request->user()->id,
                'campaign_id' => $campaign->id,
                'amount' => $validated['amount'],
                'status' => 'success', // We mock success for now until Week 3 payment integration
                'transaction_id' => 'TXN_' . uniqid(), 
            ]);

            // Step B: Add the donation amount to the campaign's current total
            $campaign->current_amount += $validated['amount'];
            $campaign->save();

            // 5. If both steps succeed, COMMIT the changes to the database
            DB::commit();

            return response()->json([
                'message' => 'Donation successful!',
                'donation' => $donation,
                'campaign_progress' => $campaign->current_amount
            ], 201);

        } catch (\Exception $e) {
            // 6. If anything fails, ROLLBACK (undo) everything
            DB::rollBack();
            
            return response()->json([
                'message' => 'Donation failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
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