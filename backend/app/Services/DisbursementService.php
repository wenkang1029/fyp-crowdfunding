<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Disbursement;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DisbursementService
{
    public function create(Campaign $campaign, array $data): Disbursement
    {
        $alreadyDisbursed = $campaign->disbursements()
            ->where('status', '!=', 'rejected')
            ->sum('amount');

        $proposedTotal = $alreadyDisbursed + $data['amount'];

        if ($proposedTotal > $campaign->current_amount) {
            throw new HttpException(400, "You have raised {$campaign->current_amount} and already disbursed {$alreadyDisbursed}. You do not have enough funds to disburse {$data['amount']}.");
        }

        $disbursement = Disbursement::create([
            'campaign_id' => $campaign->id,
            'purpose' => $data['purpose'],
            'amount' => $data['amount'],
            'status' => 'pending',
        ]);

        // Notify admins of new disbursement request
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\NewDisbursementRequestNotification($campaign->title, $disbursement->amount));
        }

        return $disbursement;
    }

    public function adminList()
    {
        return Disbursement::with(['campaign:id,title,user_id', 'campaign.user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function updateStatus(Disbursement $disbursement, string $status, ?string $rejectionReason = null): Disbursement
    {
        if ($disbursement->status !== 'pending') {
            throw new HttpException(400, 'This request has already been processed.');
        }

        $disbursement->status = $status;

        if ($status === 'rejected') {
            $disbursement->rejection_reason = $rejectionReason;
        }

        $disbursement->save();

        // Notify NGO of the payout decision
        $campaign = $disbursement->campaign;
        $ngo = $campaign->user;
        if ($ngo) {
            $ngo->notify(new \App\Notifications\DisbursementDecidedNotification(
                $campaign->title,
                $disbursement->amount,
                $status,
                $rejectionReason
            ));
        }

        return $disbursement;
    }
}
