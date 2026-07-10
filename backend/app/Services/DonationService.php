<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use App\Helpers\NumberToWordsHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DonationService
{
    public function donateToCampaign(Campaign $campaign, float $amount, ?User $user = null, ?string $paymentMethod = null, ?string $transactionId = null, ?string $donorName = null, bool $requestTaxReceipt = false, ?string $taxName = null, ?string $taxIdNumber = null, ?string $taxAddress = null): Donation
    {
        $previousAmount = $campaign->current_amount ?? 0.0;

        $donation = DB::transaction(function () use ($campaign, $amount, $user, $paymentMethod, $transactionId, $donorName, $requestTaxReceipt, $taxName, $taxIdNumber, $taxAddress) {
            $isNgoTaxExempt = $campaign->user && $campaign->user->is_tax_exempt;
            $shouldGenerateTax = $requestTaxReceipt && $isNgoTaxExempt;

            $donation = Donation::create([
                'user_id' => $user?->id,
                'campaign_id' => $campaign->id,
                'donor_name' => $donorName ?: ($user?->name ?? 'Anonymous'),
                'amount' => $amount,
                'status' => 'success',
                'transaction_id' => $transactionId,
                'payment_method' => $paymentMethod,
                'request_tax_receipt' => $shouldGenerateTax,
                'tax_name' => $shouldGenerateTax ? $taxName : null,
                'tax_id_number' => $shouldGenerateTax ? $taxIdNumber : null,
                'tax_address' => $shouldGenerateTax ? $taxAddress : null,
            ]);

            if ($donation->request_tax_receipt) {
                $donation->tax_receipt_number = 'TX-' . date('Y') . '-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT);
                $donation->save();
            }

            $campaign->current_amount = ($campaign->current_amount ?? 0) + $amount;
            $campaign->save();

            return $donation;
        });

        $this->triggerDonationNotifications($campaign, $amount, $user, $previousAmount);

        return $donation;
    }

    public function createDonation(array $data, ?User $user = null): array
    {
        $campaign = Campaign::findOrFail($data['campaign_id']);

        if ($campaign->status !== 'active' || !$campaign->isWithinWindow()) {
            throw new HttpException(403, 'You can only donate to active campaigns during the campaign dates');
        }

        // Handle allocation IDs validation (either legacy allocation_id or new allocation_ids)
        $allocationIds = [];
        if (!empty($data['allocation_ids']) && is_array($data['allocation_ids'])) {
            $allocationIds = $data['allocation_ids'];
        } elseif (!empty($data['allocation_id'])) {
            $allocationIds = [$data['allocation_id']];
        }

        if (!empty($allocationIds)) {
            // Check that all allocations belong to this campaign
            $validCount = $campaign->allocations()
                ->whereIn('id', $allocationIds)
                ->count();

            if ($validCount !== count(array_unique($allocationIds))) {
                throw new HttpException(400, 'Invalid allocation preference for this campaign.');
            }
        }

        $previousAmount = $campaign->current_amount ?? 0.0;

        // Retrieve NGO Stripe account details
        $ngo = $campaign->user;
        if (!$ngo || !$ngo->stripe_account_id || !$ngo->stripe_onboarding_completed) {
            throw new HttpException(400, 'This NGO has not linked their Stripe account yet and cannot receive donations.');
        }

        $totalAmount = floatval($data['amount']);
        $count = count($allocationIds) ?: 1;
        $amountPerAllocation = round($totalAmount / $count, 2);

        // Generate a shared group ID for all Donation rows created in this action
        $donationGroupId = (string) Str::uuid();

        $donationRecords = [];

        $donation = DB::transaction(function () use ($data, $campaign, $user, $allocationIds, $count, $amountPerAllocation, $donationGroupId, &$donationRecords) {
            $requestTaxReceipt = filter_var($data['request_tax_receipt'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $isNgoTaxExempt = $campaign->user && $campaign->user->is_tax_exempt;
            $shouldGenerateTax = $requestTaxReceipt && $isNgoTaxExempt;

            $totalRecords = count($allocationIds);

            if ($totalRecords === 0) {
                // Overall campaign donation
                $donation = Donation::create([
                    'user_id' => $user?->id,
                    'campaign_id' => $campaign->id,
                    'allocation_id' => null,
                    'donation_group_id' => $donationGroupId,
                    'donor_name' => $data['donor_name'] ?? ($user?->name ?? 'Anonymous'),
                    'amount' => $data['amount'],
                    'status' => 'pending',
                    'transaction_id' => null,
                    'payment_method' => 'card',
                    'request_tax_receipt' => $shouldGenerateTax,
                    'tax_name' => $shouldGenerateTax ? ($data['tax_name'] ?? null) : null,
                    'tax_id_number' => $shouldGenerateTax ? ($data['tax_id_number'] ?? null) : null,
                    'tax_address' => $shouldGenerateTax ? ($data['tax_address'] ?? null) : null,
                ]);

                if ($donation->request_tax_receipt) {
                    $donation->tax_receipt_number = 'TX-' . date('Y') . '-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT);
                    $donation->save();
                }

                $donationRecords[] = $donation;
            } else {
                // Custom split across selected sub-goals — all share the same donation_group_id
                $runningTotal = 0.0;
                foreach ($allocationIds as $index => $allocId) {
                    // Handle cents rounding on last item
                    $recordAmount = $amountPerAllocation;
                    if ($index === $totalRecords - 1) {
                        $recordAmount = round(floatval($data['amount']) - $runningTotal, 2);
                    }
                    $runningTotal += $recordAmount;

                    $donation = Donation::create([
                        'user_id' => $user?->id,
                        'campaign_id' => $campaign->id,
                        'allocation_id' => $allocId,
                        'donation_group_id' => $donationGroupId,
                        'donor_name' => $data['donor_name'] ?? ($user?->name ?? 'Anonymous'),
                        'amount' => $recordAmount,
                        'status' => 'pending',
                        'transaction_id' => null,
                        'payment_method' => 'card',
                        'request_tax_receipt' => $shouldGenerateTax,
                        'tax_name' => $shouldGenerateTax ? ($data['tax_name'] ?? null) : null,
                        'tax_id_number' => $shouldGenerateTax ? ($data['tax_id_number'] ?? null) : null,
                        'tax_address' => $shouldGenerateTax ? ($data['tax_address'] ?? null) : null,
                    ]);

                    if ($donation->request_tax_receipt) {
                        $donation->tax_receipt_number = 'TX-' . date('Y') . '-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT);
                        $donation->save();
                    }

                    $donationRecords[] = $donation;
                }
            }

            return $donationRecords[0];
        });

        // Initialize Stripe SDK
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $donationIds = collect($donationRecords)->pluck('id')->implode(',');

            $clientSecret = 'pi_mock_secret_12345';
            if (!app()->environment('testing')) {
                $paymentIntent = \Stripe\PaymentIntent::create([
                    'amount' => intval($totalAmount * 100), // Convert to cents
                    'currency' => 'myr',
                    'payment_method_types' => ['card'],
                    'metadata' => [
                        'donation_ids' => $donationIds,
                        'campaign_id' => $campaign->id,
                    ],
                ]);
                $clientSecret = $paymentIntent->client_secret;
            }

            return [
                'donation' => $donationRecords[0], // Backwards-compatibility for client response
                'client_secret' => $clientSecret,
                'campaign_progress' => $campaign->current_amount,
            ];
        } catch (\Exception $e) {
            // Rollback all pending donations on Stripe intent error
            foreach ($donationRecords as $record) {
                $record->delete();
            }
            throw new HttpException(500, 'Stripe Payment Gateway Error: ' . $e->getMessage());
        }
    }

    private function triggerDonationNotifications(Campaign $campaign, float $amount, ?User $user, float $previousAmount): void
    {
        // 1. Notify Donor if logged in
        if ($user) {
            $user->notify(new \App\Notifications\DonationSuccessNotification($campaign->title, $amount));
        }

        // 2. Notify NGO Organizer
        $ngo = $campaign->user;
        if ($ngo) {
            $ngo->notify(new \App\Notifications\DonationReceivedNotification($campaign->title, $amount));
        }

        // 3. Notify NGO if campaign goal is reached (and wasn't reached previously)
        $newAmount = $campaign->current_amount ?? 0.0;
        if ($newAmount >= $campaign->target_amount && $previousAmount < $campaign->target_amount) {
            if ($ngo) {
                $ngo->notify(new \App\Notifications\CampaignGoalReachedNotification($campaign->title, $campaign->target_amount));
            }
        }
    }

    public function listByRole(User $user)
    {
        if ($user->role === 'donor') {
            $rows = Donation::with([
                'campaign:id,title,status,target_amount,current_amount',
                'campaign.disbursements' => function ($query) {
                    $query->where('status', 'approved')->orderBy('created_at', 'desc');
                },
                'allocation:id,purpose'
            ])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Group rows that belong to the same donation action together.
            // Rows share a donation_group_id when created in the same action;
            // legacy rows without one are treated as their own individual group.
            $grouped = $rows->groupBy(function ($donation) {
                return $donation->donation_group_id ?? ('solo_' . $donation->id);
            });

            return $grouped->map(function ($group) {
                $first = $group->first();
                return [
                    'id'                => $first->id,
                    'donation_group_id' => $first->donation_group_id,
                    'campaign_id'       => $first->campaign_id,
                    'campaign'          => $first->campaign,
                    'donor_name'        => $first->donor_name,
                    'total_amount'      => $group->sum('amount'),
                    'status'            => $first->status,
                    'transaction_id'    => $first->transaction_id,
                    'payment_method'    => $first->payment_method,
                    'created_at'        => $first->created_at,
                    'updated_at'        => $first->updated_at,
                    'request_tax_receipt' => $first->request_tax_receipt,
                    'tax_receipt_number'  => $first->tax_receipt_number,
                    // Array of sub-goals involved in this donation action
                    'allocations' => $group
                        ->filter(fn ($d) => $d->allocation !== null)
                        ->map(fn ($d) => [
                            'id'      => $d->allocation->id,
                            'purpose' => $d->allocation->purpose,
                            'amount'  => $d->amount,
                        ])
                        ->values()
                        ->toArray(),
                ];
            })->values();
        }

        if ($user->role === 'ngo') {
            $rows = Donation::with([
                'campaign:id,title,status,target_amount,current_amount',
                'campaign.user:id,name,org_name,org_reg_number',
                'user:id,name,email,identification_number,mailing_address',
                'allocation:id,purpose',
            ])
                ->whereHas('campaign', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $grouped = $rows->groupBy(function ($donation) {
                return $donation->donation_group_id ?? ('solo_' . $donation->id);
            });

            return $grouped->map(function ($group) {
                $first = $group->first();
                return [
                    'id'                => $first->id,
                    'user_id'           => $first->user_id,
                    'donation_group_id' => $first->donation_group_id,
                    'campaign_id'       => $first->campaign_id,
                    'campaign'          => $first->campaign,
                    'donor_name'        => $first->donor_name,
                    'user'              => $first->user,
                    'total_amount'      => $group->sum('amount'),
                    'status'            => $first->status,
                    'transaction_id'    => $first->transaction_id,
                    'payment_method'    => $first->payment_method,
                    'created_at'        => $first->created_at,
                    'updated_at'        => $first->updated_at,
                    'request_tax_receipt' => $first->request_tax_receipt,
                    'tax_receipt_number'  => $first->tax_receipt_number,
                    'allocations' => $group
                        ->filter(fn ($d) => $d->allocation !== null)
                        ->map(fn ($d) => [
                            'id'      => $d->allocation->id,
                            'purpose' => $d->allocation->purpose,
                            'amount'  => $d->amount,
                        ])
                        ->values()
                        ->toArray(),
                ];
            })->values();
        }

        throw new HttpException(403, 'Unauthorized to view this ledger.');
    }

    public function generateReceipt(User $user, int $donationId): array
    {
        if ($user->role !== 'donor') {
            throw new HttpException(403, 'Only donors can download donation receipts.');
        }

        $donation = Donation::with([
            'campaign:id,title,user_id',
            'campaign.user:id,name,org_name,org_reg_number,mailing_address,lhdn_reference',
            'allocation:id,purpose',
            'user:id,name,email,identification_number,mailing_address',
        ])->findOrFail($donationId);

        if (!$donation->user_id || $donation->user_id !== $user->id) {
            throw new HttpException(403, 'You can only download your own donation receipts.');
        }

        $donationGroup = collect([$donation]);
        $totalAmount = $donation->amount;

        if ($donation->donation_group_id) {
            $donationGroup = Donation::with('allocation:id,purpose')
                ->where('donation_group_id', $donation->donation_group_id)
                ->get();
            $totalAmount = $donationGroup->sum('amount');
        }

        $viewName = $donation->request_tax_receipt ? 'reports.tax-receipt' : 'reports.donation-receipt';
        $amountInWords = NumberToWordsHelper::convert($totalAmount);

        $pdf = Pdf::loadView($viewName, [
            'donation' => $donation,
            'donationGroup' => $donationGroup,
            'totalAmount' => $totalAmount,
            'amountInWords' => $amountInWords,
        ]);

        return [
            'pdf' => $pdf,
            'filename' => $donation->request_tax_receipt 
                ? 'tax_receipt_' . $donation->id . '.pdf' 
                : 'donation_receipt_' . $donation->id . '.pdf',
        ];
    }
}
