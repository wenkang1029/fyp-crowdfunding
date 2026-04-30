<?php

namespace App\Services;

use App\Models\Allocation;
use App\Models\Campaign;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AllocationService
{
    public function create(Campaign $campaign, array $data): Allocation
    {
        $currentlyAllocated = $campaign->allocations()->sum('amount');
        $proposedTotal = $currentlyAllocated + $data['amount'];

        if ($proposedTotal > $campaign->target_amount) {
            throw new HttpException(400, "This campaign has a target of {$campaign->target_amount}. You have already allocated {$currentlyAllocated}. You cannot allocate an additional {$data['amount']}.");
        }

        return Allocation::create([
            'campaign_id' => $campaign->id,
            'purpose' => $data['purpose'],
            'amount' => $data['amount'],
        ]);
    }

    public function update(Campaign $campaign, Allocation $allocation, array $data): Allocation
    {
        if (isset($data['amount'])) {
            $currentlyAllocated = $campaign->allocations()->sum('amount');
            $proposedTotal = $currentlyAllocated - $allocation->amount + $data['amount'];

            if ($proposedTotal > $campaign->target_amount) {
                throw new HttpException(400, "Target is {$campaign->target_amount}. The new total would be {$proposedTotal}, which exceeds the limit.");
            }

            $allocation->amount = $data['amount'];
        }

        if (isset($data['purpose'])) {
            $allocation->purpose = $data['purpose'];
        }

        $allocation->save();

        return $allocation;
    }
}
