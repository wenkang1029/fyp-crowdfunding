<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Disbursement;
use App\Services\DisbursementService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class DisbursementController extends Controller
{
    public function __construct(private readonly DisbursementService $disbursementService)
    {
    }

    // Record a new disbursement (NGO only)
    public function store(Request $request, $campaign_id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can manage disbursements.',
            ], 403);
        }

        $campaign = Campaign::findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not own this campaign.',
            ], 403);
        }

        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'details' => 'nullable|string|max:1000',
        ]);

        try {
            $disbursement = $this->disbursementService->create($campaign, $validated);

            return response()->json([
                'success' => true,
                'data' => $disbursement,
                'message' => 'Disbursement recorded successfully!',
            ], 201);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => 'Disbursement failed.',
                'errors' => [
                    'details' => $e->getMessage(),
                ],
            ], $e->getStatusCode());
        }
    }

    // Fetch all disbursements for the Admin Moderation Dashboard
    public function indexAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $disbursements = $this->disbursementService->adminList();

        return response()->json([
            'success' => true,
            'data' => $disbursements,
            'message' => 'Disbursements fetched successfully',
        ], 200);
    }

    // Approve or Reject a disbursement request
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $disbursement = Disbursement::findOrFail($id);

        try {
            $updatedDisbursement = $this->disbursementService->updateStatus(
                $disbursement,
                $validated['status'],
                $validated['rejection_reason'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $updatedDisbursement,
                'message' => 'Disbursement ' . $validated['status'] . ' successfully.',
            ]);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }
    }
}