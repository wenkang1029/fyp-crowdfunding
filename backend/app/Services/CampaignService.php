<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CampaignService
{
    public function __construct(
        private readonly AllocationService $allocationService
    ) {
    }

    public function listByRole(?User $user)
    {
        if ($user && $user->role === 'admin') {
            return Campaign::with('user')->orderBy('created_at', 'desc')->get();
        }

        if ($user && $user->role === 'ngo') {
            return Campaign::where('user_id', $user->id)
                ->with(['allocations'])
                ->withSum([
                    'disbursements as disbursed_amount' => function ($query) {
                        $query->where('status', 'approved');
                    },
                ], 'amount')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Campaign::with('user')
            ->where('status', 'active')
            ->whereHas('user', function ($query) {
                $query->where('status', '!=', 'suspended');
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createForNgo(User $user, array $data): Campaign
    {
        $campaign = DB::transaction(function () use ($user, $data) {
            if (isset($data['start_date']) && isset($data['end_date'])) {
                if (strtotime($data['start_date']) > strtotime($data['end_date'])) {
                    throw new HttpException(422, 'Start date must be before or equal to end date.');
                }
            }

            $campaignData = [
                'user_id' => $user->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'target_amount' => $data['target_amount'],
                'status' => 'pending',
            ];

            if (isset($data['image_path'])) {
                $campaignData['image_path'] = $data['image_path'];
            }

            if (isset($data['image_paths'])) {
                $campaignData['image_paths'] = $data['image_paths'];
            }

            if (isset($data['start_date'])) {
                $campaignData['start_date'] = $data['start_date'];
            }

            if (isset($data['end_date'])) {
                $campaignData['end_date'] = $data['end_date'];
            }

            $campaign = Campaign::create($campaignData);

            $allocations = $data['allocations'] ?? [];

            if (!is_array($allocations) || count($allocations) === 0) {
                $this->allocationService->create($campaign, [
                    'purpose' => $data['title'],
                    'amount' => $data['target_amount'],
                ]);

                return $campaign->load(['allocations', 'user']);
            }

            $totalAllocated = array_reduce(
                $allocations,
                fn ($sum, $allocation) => $sum + (float) ($allocation['amount'] ?? 0),
                0.0
            );

            if (round($totalAllocated, 2) !== round((float) $data['target_amount'], 2)) {
                throw new HttpException(422, 'Allocation total must equal the target amount.');
            }

            foreach ($allocations as $allocation) {
                $this->allocationService->create($campaign, $allocation);
            }

            return $campaign->load(['allocations', 'user']);
        });

        // Notify admins of new pending campaign submission
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\NewCampaignSubmittedNotification($campaign->title, $user->name));
        }

        return $campaign;
    }

    public function getById(int $id): Campaign
    {
        return Campaign::with(['user', 'allocations', 'disbursements'])->findOrFail($id);
    }

    public function getNgoDetails(User $user, int $id): Campaign
    {
        $query = Campaign::query();
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }
        return $query->with([
                'user:id,name,email',
                'allocations',
                'donations' => function ($query) {
                    $query->where('status', 'success')
                        ->with(['user:id,name,email', 'allocation:id,purpose'])
                        ->orderBy('created_at', 'desc');
                },
                'disbursements' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
            ])
            ->findOrFail($id);
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
        if (isset($data['start_date']) || isset($data['end_date'])) {
            throw new HttpException(422, 'Cannot modify start_date or end_date after creation.');
        }

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
