<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DonationService
{
    public function donateToCampaign(Campaign $campaign, float $amount, ?User $user = null, ?string $paymentMethod = null, ?string $transactionId = null, ?string $donorName = null): Donation
    {
        return DB::transaction(function () use ($campaign, $amount, $user, $paymentMethod, $transactionId, $donorName) {
            $donation = Donation::create([
                'user_id' => $user?->id,
                'campaign_id' => $campaign->id,
                'donor_name' => $donorName ?: ($user?->name ?? 'Anonymous'),
                'amount' => $amount,
                'status' => 'success',
                'transaction_id' => $transactionId,
                'payment_method' => $paymentMethod,
            ]);

            $campaign->current_amount = ($campaign->current_amount ?? 0) + $amount;
            $campaign->save();

            return $donation;
        });
    }

    public function createDonation(array $data, ?User $user = null): array
    {
        $campaign = Campaign::findOrFail($data['campaign_id']);

        if ($campaign->status !== 'active') {
            throw new HttpException(400, 'You can only donate to active campaigns');
        }

        if (isset($data['allocation_id'])) {
            $allocationBelongsToCampaign = $campaign->allocations()
                ->where('id', $data['allocation_id'])
                ->exists();

            if (!$allocationBelongsToCampaign) {
                throw new HttpException(400, 'Invalid allocation preference for this campaign.');
            }
        }

        $donation = DB::transaction(function () use ($data, $campaign, $user) {
            $donation = Donation::create([
                'user_id' => $user?->id,
                'campaign_id' => $campaign->id,
                'allocation_id' => $data['allocation_id'] ?? null,
                'donor_name' => $data['donor_name'] ?? ($user?->name ?? 'Anonymous'),
                'amount' => $data['amount'],
                'status' => 'success',
                'transaction_id' => $data['transaction_id'] ?? ('TXN_' . uniqid()),
                'payment_method' => $data['payment_method'] ?? null,
            ]);

            $campaign->current_amount = ($campaign->current_amount ?? 0) + $data['amount'];
            $campaign->save();

            return $donation;
        });

        return [
            'donation' => $donation,
            'campaign_progress' => $campaign->current_amount,
        ];
    }

    public function listByRole(User $user)
    {
        if ($user->role === 'donor') {
            return Donation::with(['campaign:id,title,status', 'allocation:id,purpose'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        if ($user->role === 'ngo') {
            return Donation::with([
                'campaign:id,title',
                'user:id,name,email',
                'allocation:id,purpose',
            ])
                ->whereHas('campaign', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        throw new HttpException(403, 'Unauthorized to view this ledger.');
    }
}
