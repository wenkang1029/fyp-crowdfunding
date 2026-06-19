<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CampaignGoalReachedNotification extends Notification
{
    use Queueable;

    private $campaignTitle;
    private $targetAmount;

    public function __construct(string $campaignTitle, float $targetAmount)
    {
        $this->campaignTitle = $campaignTitle;
        $this->targetAmount = $targetAmount;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'campaign_goal_reached',
            'title' => 'Campaign Goal Reached! 🎉',
            'message' => 'Congratulations! Your campaign "' . $this->campaignTitle . '" has reached its goal of $' . number_format($this->targetAmount, 2) . '!'
        ];
    }
}
