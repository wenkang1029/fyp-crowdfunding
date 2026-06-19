<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewDisbursementRequestNotification extends Notification
{
    use Queueable;

    private $campaignTitle;
    private $amount;

    public function __construct(string $campaignTitle, float $amount)
    {
        $this->campaignTitle = $campaignTitle;
        $this->amount = $amount;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_disbursement_request',
            'title' => 'New Payout Request',
            'message' => 'An NGO has requested a disbursement of $' . number_format($this->amount, 2) . ' for campaign "' . $this->campaignTitle . '".'
        ];
    }
}
