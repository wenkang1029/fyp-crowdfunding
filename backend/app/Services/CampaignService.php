<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\User;

class CampaignService
{
    public function listByRole(?User $user)
    {
        if ($user && $user->role === 'admin') {
            return Campaign::with('user')->orderBy('created_at', 'desc')->get();
        }

        if ($user && $user->role === 'ngo') {
            return Campaign::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Campaign::with('user')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createForNgo(User $user, array $data): Campaign
    {
        return Campaign::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'target_amount' => $data['target_amount'],
            'status' => 'pending',
        ]);
    }

    public function getById(int $id): Campaign
    {
        return Campaign::with('user')->findOrFail($id);
    }

    public function updateStatus(Campaign $campaign, string $status): Campaign
    {
        $campaign->update(['status' => $status]);

        if ($campaign->status === 'active') {
            $ngoUser = User::find($campaign->user_id);

            if ($ngoUser) {
                $ngoUser->notify(new \App\Notifications\CampaignApprovedNotification($campaign->title));
            }
        }

        return $campaign;
    }

    public function updateForNgo(Campaign $campaign, array $data): Campaign
    {
        $data['status'] = 'pending';
        $campaign->update($data);

        return $campaign;
    }

    public function updateStatusForNgo(Campaign $campaign, string $status): Campaign
    {
        $campaign->update(['status' => $status]);

        return $campaign->fresh();
    }

    public function delete(Campaign $campaign): void
    {
        $campaign->delete();
    }

}
