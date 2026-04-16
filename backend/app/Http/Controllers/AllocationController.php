<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\Campaign;
use Illuminate\Http\Request;

class AllocationController extends Controller
{
    public function store(Request $request, $campaign_id)
    {
        // 1. Security: Only NGOs can manage allocations
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can manage allocations.'], 403);
        }

        // 2. Find the campaign
        $campaign = Campaign::findOrFail($campaign_id);

        // 3. Security: The NGO must actually own this campaign!
        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not have permission to manage this campaign.'], 403);
        }

        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1'
        ]);

        // 4. BUSINESS LOGIC (Thesis TC013_02): Prevent Over-Allocation
        // Calculate how much money is already allocated to other sub-goals
        $currentlyAllocated = $campaign->allocations()->sum('amount');
        $proposedTotal = $currentlyAllocated + $validated['amount'];

        if ($proposedTotal > $campaign->target_amount) {
            return response()->json([
                'message' => 'Over-allocation attempt failed.',
                'details' => "This campaign has a target of {$campaign->target_amount}. You have already allocated {$currentlyAllocated}. You cannot allocate an additional {$validated['amount']}."
            ], 400); // 400 Bad Request
        }

        // 5. Create the allocation
        $allocation = Allocation::create([
            'campaign_id' => $campaign->id,
            'purpose' => $validated['purpose'],
            'amount' => $validated['amount']
        ]);

        return response()->json([
            'message' => 'Allocation added successfully!',
            'allocation' => $allocation
        ], 201);
    }

    // UC015: Reallocate Funds (Update an allocation)
    public function update(Request $request, $campaign_id, $id)
    {
        // 1. Security Checks
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can manage allocations.'], 403);
        }

        $campaign = Campaign::findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not have permission to manage this campaign.'], 403);
        }

        // 2. Find the specific allocation belonging to this campaign
        $allocation = Allocation::where('campaign_id', $campaign_id)->findOrFail($id);

        $validated = $request->validate([
            'purpose' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:1'
        ]);

        // 3. BUSINESS LOGIC (Thesis TC015_02): Prevent Reallocating beyond Target
        if (isset($validated['amount'])) {
            $currentlyAllocated = $campaign->allocations()->sum('amount');
            
            // Math: Current Total - Old Amount + New Amount
            $proposedTotal = $currentlyAllocated - $allocation->amount + $validated['amount'];

            if ($proposedTotal > $campaign->target_amount) {
                return response()->json([
                    'message' => 'Reallocation failed.',
                    'details' => "Target is {$campaign->target_amount}. The new total would be {$proposedTotal}, which exceeds the limit."
                ], 400); // 400 Bad Request
            }
            
            $allocation->amount = $validated['amount'];
        }

        if (isset($validated['purpose'])) {
            $allocation->purpose = $validated['purpose'];
        }

        $allocation->save();

        return response()->json([
            'message' => 'Funds reallocated successfully!',
            'allocation' => $allocation
        ], 200);
    }
}