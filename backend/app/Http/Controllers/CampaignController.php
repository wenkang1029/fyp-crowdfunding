<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;
use App\Notifications\CampaignApprovedNotification;

class CampaignController extends Controller
{
    // 1. View all active campaigns (Public)
    public function index(\Illuminate\Http\Request $request)
    {
        // Explicitly check for an API token using the sanctum guard
        $user = $request->user('sanctum');

        if ($user && $user->role === 'admin') {
            // ADMIN: Sees absolutely everything, including pending campaigns
            $campaigns = \App\Models\Campaign::with('user')->orderBy('created_at', 'desc')->get();
            
        } elseif ($user && $user->role === 'ngo') {
            // NGO: Sees only their own campaigns
            $campaigns = \App\Models\Campaign::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
            
        } else {
            // PUBLIC DONOR / GUEST: Sees only approved campaigns
            $campaigns = \App\Models\Campaign::with('user')
                            ->where('status', 'active')
                            ->orderBy('created_at', 'desc')
                            ->get();
        }
        
        
        return response()->json($campaigns);
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
            'target_amount' => 'required|numeric|min:1|max:1000000',
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

    // 5. Edit Campaign (NGO Only, Must Own Campaign)
    public function update(\Illuminate\Http\Request $request, $id)
    {
        $user = $request->user('sanctum');
        $campaign = \App\Models\Campaign::findOrFail($id);

        // --- ADMIN ROLE ---
        if ($user->role === 'admin') {
            // FIX 1: Change 'approved' to 'active' to match your database ENUM
            $validatedData = $request->validate([
                'status' => 'required|in:active,rejected,pending'
            ]);
            
            $campaign->update($validatedData);

            // FIX 2: Trigger the Notification if it was just activated!
            if ($campaign->status === 'active') {
                $ngoUser = \App\Models\User::find($campaign->user_id);
                if ($ngoUser) {
                    // Assuming you have this notification imported at the top, or using full namespace
                    $ngoUser->notify(new \App\Notifications\CampaignApprovedNotification($campaign->title));
                }
            }

            return response()->json(['message' => 'Status updated successfully', 'campaign' => $campaign]);
        }

        // --- NGO ROLE ---
        if ($user->role === 'ngo') {
            if ($campaign->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized to edit this campaign.'], 403);
            }

            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'target_amount' => 'sometimes|required|numeric|min:1',
            ]);

            $validatedData['status'] = 'pending';
            $campaign->update($validatedData);
            
            return response()->json(['message' => 'Campaign updated successfully', 'campaign' => $campaign]);
        }

        return response()->json(['message' => 'Unauthorized action.'], 403);
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

    // Process a donation (Public Route)
    public function donate(\Illuminate\Http\Request $request, $id)
    {
        // 1. Validate the input (prevent negative numbers or letters)
        $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        // 2. Find the campaign
        $campaign = \App\Models\Campaign::findOrFail($id);

        // 3. Security: Only allow donations to active campaigns
        if ($campaign->status !== 'active') {
            return response()->json(['message' => 'This campaign is not accepting donations.'], 403);
        }

        // 4. Update the total securely
        // We use ?? 0 in case current_amount is null in the database
        $campaign->current_amount = ($campaign->current_amount ?? 0) + $request->amount;
        $campaign->save();

        // FIX: Reload the user relationship so the NGO name doesn't disappear in React!
        $campaign->load('user');
        
        // Note: In an enterprise app, we would also create a record in a 'Donations' table here
        // linking the donor's info to the campaign for receipts. For now, we update the total!

        return response()->json([
            'message' => 'Thank you! Your donation was successful.', 
            'campaign' => $campaign
        ]);
    }
}