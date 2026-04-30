<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function ngoDashboard(Request $request)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only NGOs can view this dashboard.',
            ], 403);
        }

        $dashboardData = $this->dashboardService->ngoDashboard($request->user()->id);

        return response()->json([
            'success' => true,
            'data' => $dashboardData,
            'message' => 'NGO dashboard fetched successfully',
        ], 200);
    }

    public function adminDashboard(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only System Admins can view this dashboard.',
            ], 403);
        }

        $dashboardData = $this->dashboardService->adminDashboard();

        return response()->json([
            'success' => true,
            'data' => $dashboardData,
            'message' => 'Admin dashboard fetched successfully',
        ], 200);
    }

    public function ngoDisbursementDashboard(Request $request)
    {
        if ($request->user()->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only NGOs can view this dashboard.',
            ], 403);
        }

        $dashboardData = $this->dashboardService->ngoDisbursementDashboard($request->user()->id);

        return response()->json([
            'success' => true,
            'data' => $dashboardData,
            'message' => 'NGO disbursement dashboard fetched successfully',
        ], 200);
    }
}