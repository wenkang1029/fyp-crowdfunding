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
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt_file')) {
            $path = $request->file('receipt_file')->store('receipts', 'public');
            $receiptPath = '/storage/' . $path;
        }

        try {
            $disbursement = $this->disbursementService->create($campaign, $validated, $receiptPath);

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

    // Upload real-world proof photos for an approved payout (NGO only)
    public function uploadProof(Request $request, $id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can upload impact proof.',
            ], 403);
        }

        $disbursement = Disbursement::findOrFail($id);
        $campaign = $disbursement->campaign;

        if (!$campaign || $campaign->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not own this campaign.',
            ], 403);
        }

        if ($disbursement->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'You can only upload proof for approved payouts.',
            ], 400);
        }

        $request->validate([
            'proof_files' => 'required|array|min:1|max:3',
            'proof_files.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $uploadedPaths = [];
        if ($request->hasFile('proof_files')) {
            foreach ($request->file('proof_files') as $file) {
                $path = $file->store('proofs', 'public');
                $uploadedPaths[] = '/storage/' . $path;
            }
        }

        $disbursement->update([
            'proof_images' => $uploadedPaths,
        ]);

        return response()->json([
            'success' => true,
            'data' => $disbursement,
            'message' => 'Proof images uploaded successfully!',
        ], 200);
    }
}