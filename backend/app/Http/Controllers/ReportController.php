<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    // UC007: Generate Allocation Report (NGO, own campaigns only)
    public function allocationReport(Request $request, $campaign_id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $this->reportService->allocationBreakdown($request->user(), (int) $campaign_id);
    }

    // UC019: Generate Disbursement Report (NGO, own campaigns only)
    public function disbursementReport(Request $request, $campaign_id)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $this->reportService->disbursementLog($request->user(), (int) $campaign_id);
    }

    // UC020: Generate Campaign Summary Report (NGO or Admin)
    public function campaignReport(Request $request, $campaign_id)
    {
        $user = $request->user();

        if ($user->role !== 'ngo' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $this->reportService->campaignSummary($user, (int) $campaign_id);
    }
}