<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewNgoRegisteredNotification extends Notification
{
    use Queueable;

    private $orgName;

    public function __construct(string $orgName)
    {
        $this->orgName = $orgName;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_ngo_registered',
            'title' => 'New NGO Registered',
            'message' => 'A new organization "' . $this->orgName . '" has registered on the platform and is pending profile verification.'
        ];
    }
}
