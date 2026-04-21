<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Disbursement;
use Illuminate\Http\Request;

class DisbursementController extends Controller
{
    // Record a new disbursement (NGO only)
    public function store(Request $request, $campaign_id)
    {
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

        // Prevent over-disbursement & exclude rejected funds from the calculation
        $alreadyDisbursed = $campaign->disbursements()
            ->where('status', '!=', 'rejected')
            ->sum('amount');
            
        $proposedTotal = $alreadyDisbursed + $validated['amount'];

        if ($proposedTotal > $campaign->current_amount) {
            return response()->json([
                'message' => 'Disbursement failed.',
                'details' => "You have raised {$campaign->current_amount} and already disbursed {$alreadyDisbursed}. You do not have enough funds to disburse {$validated['amount']}."
            ], 400);
        }

        // Create the record with default pending status
        $disbursement = Disbursement::create([
            'campaign_id' => $campaign->id,
            'purpose' => $validated['purpose'],
            'amount' => $validated['amount'],
            'status' => 'pending' 
        ]);

        return response()->json([
            'message' => 'Disbursement recorded successfully!',
            'disbursement' => $disbursement
        ], 201);
    }

    // Fetch all disbursements for the Admin Moderation Dashboard
    public function indexAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $disbursements = Disbursement::with(['campaign:id,title,user_id', 'campaign.user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($disbursements, 200);
    }

    // Approve or Reject a disbursement request
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected'
        ]);

        $disbursement = Disbursement::findOrFail($id);
        
        if ($disbursement->status !== 'pending') {
            return response()->json(['message' => 'This request has already been processed.'], 400);
        }

        $disbursement->status = $validated['status'];
        $disbursement->save();

        return response()->json([
            'message' => 'Disbursement ' . $validated['status'] . ' successfully.',
            'disbursement' => $disbursement
        ]);
    }
}