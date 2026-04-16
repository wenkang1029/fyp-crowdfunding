<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Disbursement;

class DashboardController extends Controller
{
    // UC006: View Donation Dashboard (NGO Specific)
    public function ngoDashboard(Request $request)
    {
        // 1. Security Check
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized. Only NGOs can view this dashboard.'], 403);
        }

        $userId = $request->user()->id;

        // 2. Aggregate Data using the Database (Fast & Efficient)
        $totalCampaigns = Campaign::where('user_id', $userId)->count();
        $totalTarget = Campaign::where('user_id', $userId)->sum('target_amount');
        $totalRaised = Campaign::where('user_id', $userId)->sum('current_amount');

        // 3. Get the 5 most recent donations across ALL of this NGO's campaigns
        // We use 'whereHas' to filter donations that belong to campaigns owned by this user
        $recentDonations = Donation::with('campaign:id,title')
            ->whereHas('campaign', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Return the aggregated payload
        return response()->json([
            'metrics' => [
                'total_campaigns' => $totalCampaigns,
                'total_target_amount' => $totalTarget,
                'total_funds_raised' => $totalRaised,
                // Avoid division by zero when calculating percentage
                'funding_progress_percentage' => $totalTarget > 0 ? round(($totalRaised / $totalTarget) * 100, 2) : 0
            ],
            'recent_donations' => $recentDonations
        ], 200);
    }

    // System Admin Dashboard (Global Scope)
    public function adminDashboard(Request $request)
    {
        // 1. Security Check
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only System Admins can view this dashboard.'], 403);
        }

        // 2. Aggregate User Data
        $totalUsers = User::count();
        $totalNGOs = User::where('role', 'ngo')->count();
        $totalDonors = User::where('role', 'donor')->count();

        // 3. Aggregate Campaign Data
        $totalCampaigns = Campaign::count();
        $pendingCampaigns = Campaign::where('status', 'pending')->count();
        $activeCampaigns = Campaign::where('status', 'active')->count();

        // 4. Aggregate Global Financial Data
        $totalPlatformFunds = Campaign::sum('current_amount');

        // 5. Return the payload
        return response()->json([
            'metrics' => [
                'users' => [
                    'total' => $totalUsers,
                    'ngos' => $totalNGOs,
                    'donors' => $totalDonors,
                ],
                'campaigns' => [
                    'total' => $totalCampaigns,
                    'pending_approval' => $pendingCampaigns,
                    'active' => $activeCampaigns,
                ],
                'financials' => [
                    'total_funds_raised' => $totalPlatformFunds
                ]
            ]
        ], 200);
    }

    // UC018: View Disbursement Dashboard (NGO Specific)
    public function ngoDisbursementDashboard(Request $request)
    {
        // 1. Security Check
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized. Only NGOs can view this dashboard.'], 403);
        }

        $userId = $request->user()->id;

        // 2. Get total raised vs total disbursed for this NGO
        $totalRaised = Campaign::where('user_id', $userId)->sum('current_amount');
        
        $totalDisbursed = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->sum('amount');

        // 3. Group disbursements by purpose (Perfect for Frontend Pie Charts!)
        $disbursementBreakdown = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->selectRaw('purpose, SUM(amount) as total_amount')
        ->groupBy('purpose')
        ->get();

        // 4. Get a detailed log of the 5 most recent expenses
        $recentDisbursements = Disbursement::with('campaign:id,title')
            ->whereHas('campaign', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_funds_raised' => $totalRaised,
                'total_funds_disbursed' => $totalDisbursed,
                'remaining_balance' => $totalRaised - $totalDisbursed,
            ],
            'chart_data' => $disbursementBreakdown,
            'recent_activity' => $recentDisbursements
        ], 200);
    }
}