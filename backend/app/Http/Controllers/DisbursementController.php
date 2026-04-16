<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Disbursement;
use Illuminate\Http\Request;

class DisbursementController extends Controller
{
    // UC017: Record a new disbursement (NGO only)
    public function store(Request $request, $campaign_id)
    {
        // 1. Security check
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can manage disbursements.'], 403);
        }

        $campaign = Campaign::findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this campaign.'], 403);
        }

        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1'
        ]);

        // 2. BUSINESS LOGIC: Prevent over-disbursement
        // Calculate how much has already been spent
        $alreadyDisbursed = $campaign->disbursements()->sum('amount');
        $proposedTotal = $alreadyDisbursed + $validated['amount'];

        // You cannot spend more money than you have currently raised!
        if ($proposedTotal > $campaign->current_amount) {
            return response()->json([
                'message' => 'Disbursement failed.',
                'details' => "You have raised {$campaign->current_amount} and already disbursed {$alreadyDisbursed}. You do not have enough funds to disburse {$validated['amount']}."
            ], 400);
        }

        // 3. Create the record
        $disbursement = Disbursement::create([
            'campaign_id' => $campaign->id,
            'purpose' => $validated['purpose'],
            'amount' => $validated['amount']
        ]);

        return response()->json([
            'message' => 'Disbursement recorded successfully!',
            'disbursement' => $disbursement
        ], 201);
    }
}