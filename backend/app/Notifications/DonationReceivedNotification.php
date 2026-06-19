<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationReceivedNotification extends Notification
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
            'type' => 'donation_received',
            'title' => 'New Donation Received!',
            'message' => 'A contribution of $' . number_format($this->amount, 2) . ' has been made to your campaign "' . $this->campaignTitle . '".'
        ];
    }
}
