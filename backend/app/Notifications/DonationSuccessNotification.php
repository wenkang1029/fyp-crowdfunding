<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationSuccessNotification extends Notification
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
            'type' => 'donation_success',
            'title' => 'Donation Successful!',
            'message' => 'Thank you! Your donation of $' . number_format($this->amount, 2) . ' to "' . $this->campaignTitle . '" was processed successfully.'
        ];
    }
}
