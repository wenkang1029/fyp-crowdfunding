<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    // 1. View all active campaigns (Public)
    public function index()
    {
        // Only show campaigns that have been approved ('active')
        $campaigns = Campaign::where('status', 'active')->get();
        return response()->json($campaigns, 200);
    }

    // 2. Create a new campaign (NGO only)
    public function store(Request $request)
    {
        // Check if the logged-in user is an NGO
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can create campaigns'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:1',
        ]);

        $campaign = Campaign::create([
            'user_id' => $request->user()->id, // Automatically attach the NGO's ID
            'title' => $validated['title'],
            'description' => $validated['description'],
            'target_amount' => $validated['target_amount'],
            'status' => 'pending', // Requires System Admin approval later
        ]);

        return response()->json([
            'message' => 'Campaign created successfully and is pending approval',
            'campaign' => $campaign
        ], 201);
    }

    // 3. View a single campaign details
    public function show($id)
    {
        $campaign = Campaign::with('user')->findOrFail($id);
        return response()->json($campaign, 200);
    }

    // 4. Update campaign status (System Admin only)
    public function updateStatus(Request $request, $id)
    {
        // 1. Security Check: Is the user a System Admin?
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can approve campaigns.'], 403);
        }

        // 2. Validate the input (must be active or rejected)
        $validated = $request->validate([
            'status' => 'required|in:active,rejected'
        ]);

        // 3. Find the campaign
        $campaign = Campaign::findOrFail($id);

        // 4. Update and save
        $campaign->status = $validated['status'];
        $campaign->save();

        return response()->json([
            'message' => 'Campaign status updated successfully',
            'campaign' => $campaign
        ], 200);
    }

    // 5. Edit Campaign (NGO Only, Must Own Campaign)
    public function update(Request $request, $id)
    {
        // Security: Must be an NGO
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can edit campaigns.'], 403);
        }

        $campaign = Campaign::findOrFail($id);

        // Security: NGO must own this specific campaign
        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized. You can only edit your own campaigns.'], 403);
        }

        // Validate input (using 'sometimes' so they can update just one field if they want)
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'target_amount' => 'sometimes|numeric|min:1',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campaign updated successfully',
            'campaign' => $campaign
        ], 200);
    }

    // 6. Delete Campaign (NGO Only, Must Own Campaign)
    public function destroy(Request $request, $id)
    {
        // Security: Must be an NGO
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Only NGOs can delete campaigns.'], 403);
        }

        $campaign = Campaign::findOrFail($id);

        // Security: NGO must own this specific campaign
        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own campaigns.'], 403);
        }

        $campaign->delete();

        return response()->json([
            'message' => 'Campaign deleted successfully'
        ], 200);
    }
}