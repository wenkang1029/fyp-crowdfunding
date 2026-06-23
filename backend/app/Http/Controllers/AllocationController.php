<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\Campaign;
use App\Services\AllocationService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class AllocationController extends Controller
{
    public function __construct(private readonly AllocationService $allocationService)
    {
    }

    public function store(Request $request, $campaign_id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can manage allocations.',
            ], 403);
        }

        $campaign = Campaign::findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to manage this campaign.',
            ], 403);
        }

        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
        ]);

        try {
            $allocation = $this->allocationService->create($campaign, $validated);

            return response()->json([
                'success' => true,
                'data' => $allocation,
                'message' => 'Allocation added successfully!',
            ], 201);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => 'Over-allocation attempt failed.',
                'errors' => [
                    'details' => $e->getMessage(),
                ],
            ], $e->getStatusCode());
        }
    }

    // UC015: Reallocate Funds (Update an allocation)
    public function update(Request $request, $campaign_id, $id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can manage allocations.',
            ], 403);
        }

        $campaign = Campaign::findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to manage this campaign.',
            ], 403);
        }

        $allocation = Allocation::where('campaign_id', $campaign_id)->findOrFail($id);

        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'amount' => 'sometimes|numeric|min:1',
        ]);

        if (isset($validated['amount']) && (float) $validated['amount'] !== (float) $allocation->amount) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot modify the amount of an allocation after creation. You can only edit the purpose.',
            ], 422);
        }

        try {
            $updatedAllocation = $this->allocationService->update($campaign, $allocation, $validated);

            return response()->json([
                'success' => true,
                'data' => $updatedAllocation,
                'message' => 'Funds reallocated successfully!',
            ], 200);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reallocation failed.',
                'errors' => [
                    'details' => $e->getMessage(),
                ],
            ], $e->getStatusCode());
        }
    }
}