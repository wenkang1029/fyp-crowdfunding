<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CampaignApprovedNotification extends Notification
{
    use Queueable;

    private $campaignTitle;

    // Pass the campaign title into the notification when we trigger it
    public function __construct($campaignTitle)
    {
        $this->campaignTitle = $campaignTitle;
    }

    // Tell Laravel to store this in our new notifications database table
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    // This defines the exact JSON data that will be saved in the database
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'campaign_approval',
            'title' => 'Campaign Approved!',
            'message' => 'Great news! Your campaign "' . $this->campaignTitle . '" has been approved and is now live.'
        ];
    }
}