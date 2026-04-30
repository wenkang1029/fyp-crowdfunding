<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\User;

class DashboardService
{
    public function ngoDashboard(int $userId): array
    {
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

        return [
            'metrics' => [
                'total_campaigns' => $totalCampaigns,
                'total_target_amount' => $totalTarget,
                'total_funds_raised' => $totalRaised,
                'funding_progress_percentage' => $totalTarget > 0 ? round(($totalRaised / $totalTarget) * 100, 2) : 0,
            ],
            'recent_donations' => $recentDonations,
        ];
    }

    public function adminDashboard(): array
    {
        $totalUsers = User::count();
        $totalNGOs = User::where('role', 'ngo')->count();
        $totalDonors = User::where('role', 'donor')->count();

        $totalCampaigns = Campaign::count();
        $pendingCampaigns = Campaign::where('status', 'pending')->count();
        $activeCampaigns = Campaign::where('status', 'active')->count();

        $totalPlatformFunds = Campaign::sum('current_amount');

        return [
            'metrics' => [
                'users' => ['total' => $totalUsers, 'ngos' => $totalNGOs, 'donors' => $totalDonors],
                'campaigns' => ['total' => $totalCampaigns, 'pending_approval' => $pendingCampaigns, 'active' => $activeCampaigns],
                'financials' => ['total_funds_raised' => $totalPlatformFunds],
            ],
        ];
    }

    public function ngoDisbursementDashboard(int $userId): array
    {
        $totalRaised = Campaign::where('user_id', $userId)->sum('current_amount');

        $totalDisbursed = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', '!=', 'rejected')
            ->sum('amount');

        $disbursementBreakdown = Disbursement::whereHas('campaign', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', '!=', 'rejected')
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

        return [
            'metrics' => [
                'total_funds_raised' => $totalRaised,
                'total_funds_disbursed' => $totalDisbursed,
                'remaining_balance' => $totalRaised - $totalDisbursed,
            ],
            'chart_data' => $disbursementBreakdown,
            'recent_activity' => $recentDisbursements,
        ];
    }
}
