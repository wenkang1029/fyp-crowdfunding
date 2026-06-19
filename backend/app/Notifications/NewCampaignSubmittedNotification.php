<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCampaignSubmittedNotification extends Notification
{
    use Queueable;

    private $campaignTitle;
    private $ngoName;

    public function __construct(string $campaignTitle, string $ngoName)
    {
        $this->campaignTitle = $campaignTitle;
        $this->ngoName = $ngoName;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_campaign_submitted',
            'title' => 'New Campaign Submitted',
            'message' => 'The campaign "' . $this->campaignTitle . '" was submitted by "' . $this->ngoName . '" and is pending moderation.'
        ];
    }
}
