<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use App\Helpers\NumberToWordsHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
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

        $donationRecords = [];

        $donation = DB::transaction(function () use ($data, $campaign, $user, $allocationIds, $count, $amountPerAllocation, &$donationRecords) {
            $requestTaxReceipt = filter_var($data['request_tax_receipt'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $isNgoTaxExempt = $campaign->user && $campaign->user->is_tax_exempt;
            $shouldGenerateTax = $requestTaxReceipt && $isNgoTaxExempt;

            $totalRecords = count($allocationIds);

            if ($totalRecords === 0) {
                // Overall campaign split
                $donation = Donation::create([
                    'user_id' => $user?->id,
                    'campaign_id' => $campaign->id,
                    'allocation_id' => null,
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
                // Custom split across selected sub-goals
                $runningTotal = 0.0;
                foreach ($allocationIds as $index => $allocId) {
                    // Handle cents rounding margins on last item
                    $recordAmount = $amountPerAllocation;
                    if ($index === $totalRecords - 1) {
                        $recordAmount = round(floatval($data['amount']) - $runningTotal, 2);
                    }
                    $runningTotal += $recordAmount;

                    $donation = Donation::create([
                        'user_id' => $user?->id,
                        'campaign_id' => $campaign->id,
                        'allocation_id' => $allocId,
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
            return Donation::with(['campaign:id,title,status', 'allocation:id,purpose'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        if ($user->role === 'ngo') {
            return Donation::with([
                'campaign:id,title',
                'user:id,name,email,identification_number,mailing_address',
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

    public function generateReceipt(User $user, int $donationId): array
    {
        if ($user->role !== 'donor') {
            throw new HttpException(403, 'Only donors can download donation receipts.');
        }

        $donation = Donation::with([
            'campaign:id,title,user_id',
            'campaign.user:id,name,org_name,mailing_address,lhdn_reference',
            'allocation:id,purpose',
            'user:id,name,email,identification_number,mailing_address',
        ])->findOrFail($donationId);

        if (!$donation->user_id || $donation->user_id !== $user->id) {
            throw new HttpException(403, 'You can only download your own donation receipts.');
        }

        $viewName = $donation->request_tax_receipt ? 'reports.tax-receipt' : 'reports.donation-receipt';
        $amountInWords = NumberToWordsHelper::convert($donation->amount);

        $pdf = Pdf::loadView($viewName, [
            'donation' => $donation,
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
