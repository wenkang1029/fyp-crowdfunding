<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    /**
     * Authorise and build the campaign summary PDF (donations + disbursements).
     */
    public function campaignSummary(User $user, int $campaignId): \Illuminate\Http\Response
    {
        $campaign = Campaign::with([
            'user:id,name,email',
            'donations' => function ($query) {
                $query->where('status', 'success')
                    ->with(['user:id,name,email', 'allocation:id,purpose'])
                    ->orderBy('created_at', 'desc');
            },
            'disbursements' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
        ])->findOrFail($campaignId);

        if ($user->role === 'ngo' && $campaign->user_id !== $user->id) {
            abort(403, 'You do not own this campaign.');
        }

        $pdf = Pdf::loadView('reports.campaign', [
            'campaign'       => $campaign,
            'donations'      => $campaign->donations,
            'disbursements'  => $campaign->disbursements,
        ]);

        return $pdf->stream('campaign_summary_report_' . $campaign->id . '.pdf');
    }

    /**
     * Authorise and build the allocation breakdown PDF for an NGO's own campaign.
     */
    public function allocationBreakdown(User $user, int $campaignId): \Illuminate\Http\Response
    {
        $campaign = Campaign::with('allocations')->findOrFail($campaignId);

        if ($campaign->user_id !== $user->id) {
            abort(403, 'You do not own this campaign.');
        }

        $pdf = Pdf::loadView('reports.allocation', ['campaign' => $campaign]);

        return $pdf->stream('allocation_report.pdf');
    }

    /**
     * Authorise and build the disbursement log PDF for an NGO's own campaign.
     */
    public function disbursementLog(User $user, int $campaignId): \Illuminate\Http\Response
    {
        $campaign = Campaign::with('disbursements')->findOrFail($campaignId);

        if ($campaign->user_id !== $user->id) {
            abort(403, 'You do not own this campaign.');
        }

        $pdf = Pdf::loadView('reports.disbursement', ['campaign' => $campaign]);

        return $pdf->stream('disbursement_report.pdf');
    }
}
