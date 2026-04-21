<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Disbursement;

class DashboardController extends Controller
{
    public function ngoDashboard(Request $request)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized. Only NGOs can view this dashboard.'], 403);
        }

        $userId = $request->user()->id;

        $totalCampaigns = Campaign::where('user_id', $userId)->count();
        $totalTarget = Campaign::where('user_id', $userId)->sum('target_amount');
        $totalRaised = Campaign::where('user_id', $userId)->sum('current_amount');

        $recentDonations = Donation::with('campaign:id,title')
            ->whereHas('campaign', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_campaigns' => $totalCampaigns,
                'total_target_amount' => $totalTarget,
                'total_funds_raised' => $totalRaised,
                'funding_progress_percentage' => $totalTarget > 0 ? round(($totalRaised / $totalTarget) * 100, 2) : 0
            ],
            'recent_donations' => $recentDonations
        ], 200);
    }

    public function adminDashboard(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only System Admins can view this dashboard.'], 403);
        }

        $totalUsers = User::count();
        $totalNGOs = User::where('role', 'ngo')->count();
        $totalDonors = User::where('role', 'donor')->count();

        $totalCampaigns = Campaign::count();
        $pendingCampaigns = Campaign::where('status', 'pending')->count();
        $activeCampaigns = Campaign::where('status', 'active')->count();

        $totalPlatformFunds = Campaign::sum('current_amount');

        return response()->json([
            'metrics' => [
                'users' => [ 'total' => $totalUsers, 'ngos' => $totalNGOs, 'donors' => $totalDonors ],
                'campaigns' => [ 'total' => $totalCampaigns, 'pending_approval' => $pendingCampaigns, 'active' => $activeCampaigns ],
                'financials' => [ 'total_funds_raised' => $totalPlatformFunds ]
            ]
        ], 200);
    }

    public function ngoDisbursementDashboard(Request $request)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized. Only NGOs can view this dashboard.'], 403);
        }

        $userId = $request->user()->id;

        $totalRaised = Campaign::where('user_id', $userId)->sum('current_amount');
        
        $totalDisbursed = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->where('status', '!=', 'rejected') // Do not count rejected funds
        ->sum('amount');

        $disbursementBreakdown = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->where('status', '!=', 'rejected') // Keep pie chart accurate
        ->selectRaw('purpose, SUM(amount) as total_amount')
        ->groupBy('purpose')
        ->get();

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