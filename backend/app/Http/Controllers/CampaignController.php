<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Services\CampaignService;
use App\Services\DonationService;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(
        private readonly CampaignService $campaignService,
        private readonly DonationService $donationService
    )
    {
    }

    // 1. View all active campaigns (Public)
    public function index(Request $request)
    {
        $campaigns = $this->campaignService->listByRole($request->user('sanctum'));

        return response()->json([
            'success' => true,
            'data' => $campaigns,
            'message' => 'Campaigns fetched successfully',
        ]);
    }

    // 2. Create a new campaign (NGO only)
    public function store(Request $request)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can create campaigns',
            ], 403);
        }

        // Decode allocations from JSON if sent in FormData
        if ($request->has('allocations') && is_string($request->input('allocations'))) {
            $decoded = json_decode($request->input('allocations'), true);
            if (is_array($decoded)) {
                $request->merge(['allocations' => $decoded]);
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:1|max:1000000',
            'allocations' => 'sometimes|array',
            'allocations.*.purpose' => 'required_with:allocations|string|max:255',
            'allocations.*.amount' => 'required_with:allocations|numeric|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaigns', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $campaign = $this->campaignService->createForNgo($request->user(), $validated);

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Campaign created successfully and is pending approval',
        ], 201);
    }

    // 3. View a single campaign details
    public function show($id)
    {
        $campaign = $this->campaignService->getById((int) $id);

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Campaign fetched successfully',
        ], 200);
    }

    public function showNgo(Request $request, $id)
    {
        $user = $request->user('sanctum');

        if ($user->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can view this campaign details page.',
            ], 403);
        }

        $campaign = $this->campaignService->getNgoDetails($user, (int) $id);

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Campaign details fetched successfully',
        ]);
    }

    // 5. Edit Campaign (NGO Only, Must Own Campaign)
    public function update(Request $request, $id)
    {
        $user = $request->user('sanctum');
        $campaign = Campaign::findOrFail($id);

        if ($user->role === 'admin') {
            $validatedData = $request->validate([
                'status' => 'required|in:active,rejected,pending,completed',
            ]);

            $updatedCampaign = $this->campaignService->updateStatus($campaign, $validatedData['status']);

            return response()->json([
                'success' => true,
                'data' => $updatedCampaign,
                'message' => 'Status updated successfully',
            ]);
        }

        if ($user->role === 'ngo') {
            if ($campaign->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to edit this campaign.',
                ], 403);
            }

            if ($request->hasAny(['start_date', 'end_date'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Start date and end date cannot be modified after creation.',
                ], 422);
            }

            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'target_amount' => 'sometimes|required|numeric|min:1',
                'status' => 'sometimes|required|in:active,completed',
            ]);

            if ($request->has('status')) {
                if ($request->hasAny(['title', 'description', 'target_amount'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status updates must be sent separately from campaign edits.',
                    ], 422);
                }

                if (!in_array($campaign->status, ['active', 'completed'], true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Only active campaigns can be paused or resumed.',
                    ], 422);
                }

                $updatedCampaign = $this->campaignService->updateStatusForNgo($campaign, $validatedData['status']);

                return response()->json([
                    'success' => true,
                    'data' => $updatedCampaign,
                    'message' => 'Campaign status updated successfully',
                ]);
            }

            $updatedCampaign = $this->campaignService->updateForNgo($campaign, $validatedData);

            return response()->json([
                'success' => true,
                'data' => $updatedCampaign,
                'message' => 'Campaign updated successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized action.',
        ], 403);
    }

    // 6. Delete Campaign (NGO or Admin)
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'ngo' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $campaign = Campaign::findOrFail($id);

        if ($user->role === 'ngo' && $campaign->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only delete your own campaigns.',
            ], 403);
        }

        $this->campaignService->delete($campaign);

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Campaign deleted successfully',
        ], 200);
    }

    // Process a donation (Public Route)
    public function donate(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $campaign = Campaign::findOrFail($id);

        if ($campaign->status !== 'active' || !$campaign->isWithinWindow()) {
            return response()->json([
                'success' => false,
                'message' => 'This campaign is not accepting donations at this time.',
            ], 403);
        }

        if ($campaign->user && $campaign->user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'This campaign is currently suspended because the organizer account is suspended.',
            ], 403);
        }

        $this->donationService->donateToCampaign(
            $campaign,
            (float) $request->amount,
            $request->user('sanctum')
        );

        $updatedCampaign = $campaign->fresh()->load('user');

        return response()->json([
            'success' => true,
            'data' => $updatedCampaign,
            'message' => 'Thank you! Your donation was successful.',
        ]);
    }
}