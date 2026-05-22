<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Donation;

class Allocation extends Model
{
    use HasFactory;

    protected $appends = ['current_amount'];

    protected static array $allocationProgressCache = [];

    protected $fillable = [
        'campaign_id',
        'purpose',
        'amount'
    ];

    // An allocation belongs to a single campaign
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function getCurrentAmountAttribute()
    {
        if (!$this->campaign_id) {
            return 0.0;
        }

        if (!array_key_exists($this->campaign_id, self::$allocationProgressCache)) {
            self::$allocationProgressCache[$this->campaign_id] = self::buildAllocationProgress($this->campaign_id);
        }

        return self::$allocationProgressCache[$this->campaign_id][$this->id] ?? 0.0;
    }

    protected static function buildAllocationProgress(int $campaignId): array
    {
        $allocations = self::where('campaign_id', $campaignId)->get(['id', 'amount']);

        if ($allocations->isEmpty()) {
            return [];
        }

        $directTotals = Donation::where('campaign_id', $campaignId)
            ->whereNotNull('allocation_id')
            ->where('status', 'success')
            ->selectRaw('allocation_id, SUM(amount) as total')
            ->groupBy('allocation_id')
            ->pluck('total', 'allocation_id')
            ->mapWithKeys(fn ($value, $key) => [(int) $key => (float) $value])
            ->all();

        $sharedTotal = (float) Donation::where('campaign_id', $campaignId)
            ->whereNull('allocation_id')
            ->where('status', 'success')
            ->sum('amount');

        $progress = [];
        $remaining = [];

        foreach ($allocations as $allocation) {
            $target = (float) ($allocation->amount ?? 0);
            $direct = (float) ($directTotals[$allocation->id] ?? 0.0);
            $directCapped = min($direct, $target);
            $progress[$allocation->id] = $directCapped;
            $remaining[$allocation->id] = max($target - $directCapped, 0.0);
        }

        $remainingIds = array_keys(array_filter($remaining, fn ($value) => $value > 0.0));
        $shared = $sharedTotal;

        while ($shared > 0.0 && count($remainingIds) > 0) {
            $equalShare = $shared / count($remainingIds);
            $newShared = 0.0;
            $newRemainingIds = [];

            foreach ($remainingIds as $allocationId) {
                $capacity = $remaining[$allocationId];

                if ($capacity > $equalShare) {
                    $progress[$allocationId] += $equalShare;
                    $remaining[$allocationId] = $capacity - $equalShare;
                    $newRemainingIds[] = $allocationId;
                } else {
                    $progress[$allocationId] += $capacity;
                    $remaining[$allocationId] = 0.0;
                    $newShared += ($equalShare - $capacity);
                }
            }

            if ($newShared < 0.01) {
                $shared = 0.0;
                break;
            }

            $shared = $newShared;
            $remainingIds = $newRemainingIds;
        }

        return $progress;
    }
}