<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DisbursementDecidedNotification extends Notification
{
    use Queueable;

    private $campaignTitle;
    private $amount;
    private $status;
    private $rejectionReason;

    public function __construct(string $campaignTitle, float $amount, string $status, ?string $rejectionReason = null)
    {
        $this->campaignTitle = $campaignTitle;
        $this->amount = $amount;
        $this->status = $status;
        $this->rejectionReason = $rejectionReason;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $isApproved = $this->status === 'approved';
        $title = $isApproved ? 'Payout Approved! 💰' : 'Payout Rejected ⚠️';
        
        $message = 'Your payout request of $' . number_format($this->amount, 2) . ' for campaign "' . $this->campaignTitle . '" was ';
        $message .= $isApproved ? 'approved.' : 'rejected.';
        
        if (!$isApproved && $this->rejectionReason) {
            $message .= ' Reason: ' . $this->rejectionReason;
        }

        return [
            'type' => 'disbursement_decided',
            'title' => $title,
            'message' => $message
        ];
    }
}
