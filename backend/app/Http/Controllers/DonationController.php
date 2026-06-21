<?php

namespace App\Http\Controllers;

use App\Services\DonationService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class DonationController extends Controller
{
    public function __construct(private readonly DonationService $donationService)
    {
    }

    public function store(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'donor') {
            return response()->json([
                'success' => false,
                'message' => 'Only donors and guests can make donations',
            ], 403);
        }

        $validated = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:1',
            'allocation_id' => 'nullable|exists:allocations,id',
            'transaction_id' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'donor_name' => 'nullable|string|max:255',
            'request_tax_receipt' => 'nullable|boolean',
            'tax_name' => 'nullable|string|max:255',
            'tax_id_number' => 'nullable|string|max:255',
            'tax_address' => 'nullable|string|max:1000',
        ]);

        try {
            $result = $this->donationService->createDonation($validated, $request->user());

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Donation successful!',
            ], 201);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Donation failed.',
            ], 500);
        }
    }

    // View donation history (Handles BOTH Donors and NGOs)
    public function index(Request $request)
    {
        $user = $request->user();

        try {
            $donations = $this->donationService->listByRole($user);

            return response()->json([
                'success' => true,
                'data' => $donations,
                'message' => 'Donations fetched successfully',
            ], 200);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Unauthorized to view this ledger.',
            ], 403);
        }
    }

    public function receipt(Request $request, $id)
    {
        try {
            $result = $this->donationService->generateReceipt($request->user(), (int) $id);

            return $result['pdf']->download($result['filename']);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Failed to generate receipt.',
            ], 500);
        }
    }
}