<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // UC007: Generate Allocation Report
    public function allocationReport(Request $request, $campaign_id)
    {
        // 1. Security Check
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // 2. Fetch the campaign and eagerly load all its allocations
        $campaign = Campaign::with('allocations')->findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this campaign.'], 403);
        }

        // 3. Load the HTML template (we will create this next) and pass the data to it
        $pdf = Pdf::loadView('reports.allocation', ['campaign' => $campaign]);

        // 4. Return the PDF file as a download/stream
        return $pdf->stream('allocation_report.pdf');
    }

    // UC019: Generate Disbursement Report
    public function disbursementReport(Request $request, $campaign_id)
    {
        // 1. Security Check
        if ($request->user()->role !== 'ngo') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // 2. Fetch the campaign and eagerly load all its disbursements (expenses)
        $campaign = Campaign::with('disbursements')->findOrFail($campaign_id);

        if ($campaign->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this campaign.'], 403);
        }

        // 3. Load the HTML template and pass the data to it
        $pdf = Pdf::loadView('reports.disbursement', ['campaign' => $campaign]);

        // 4. Return the PDF file
        return $pdf->stream('disbursement_report.pdf');
    }
}