<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Exception;
use App\Models\User;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create or retrieve a Stripe Connect Express account link.
     */
    public function connect(Request $request)
    {
        $user = $request->user();

        // Ensure user is an NGO
        if ($user->role !== 'ngo') {
            return response()->json([
                'success' => false,
                'message' => 'Only NGOs can connect a Stripe account.'
            ], 403);
        }

        try {
            $accountId = $user->stripe_account_id;

            // If user doesn't have a Stripe account id, create one using V2 core API
            if (!$accountId) {
                $stripeClient = new \Stripe\StripeClient(config('services.stripe.secret'));
                $account = $stripeClient->v2->core->accounts->create([
                    'type' => 'express',
                ]);
                $accountId = $account->id;

                // Save to user model
                $user->stripe_account_id = $accountId;
                $user->save();
            }

            // Determine redirect callbacks based on frontend location
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            
            $accountLink = AccountLink::create([
                'account' => $accountId,
                'refresh_url' => $frontendUrl . '/ngo/stripe-callback?status=refresh',
                'return_url' => $frontendUrl . '/ngo/stripe-callback?status=success',
                'type' => 'account_onboarding',
            ]);

            return response()->json([
                'success' => true,
                'url' => $accountLink->url
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe Connect Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle incoming webhooks from Stripe Connect and Main.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->processSuccessfulPayment($paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->processFailedPayment($paymentIntent);
                break;
        }

        return response()->json(['status' => 'success'], 200);
    }

    private function processSuccessfulPayment($paymentIntent)
    {
        $metadata = $paymentIntent->metadata;
        $donationId = $metadata->donation_id ?? null;

        if ($donationId) {
            $donation = \App\Models\Donation::find($donationId);
            if ($donation && $donation->status !== 'success') {
                $donation->status = 'success';
                $donation->transaction_id = $paymentIntent->id;
                $donation->payment_method = 'card';
                $donation->save();

                // Increment campaign current amount
                $campaign = $donation->campaign;
                if ($campaign) {
                    $campaign->current_amount = ($campaign->current_amount ?? 0) + $donation->amount;
                    $campaign->save();

                    // Trigger notifications
                    $donationService = app(\App\Services\DonationService::class);
                    // Use reflection/helper or refactor donation service trigger
                    // For safety, we can trigger the notification manually
                    try {
                        if ($donation->user) {
                            $donation->user->notify(new \App\Notifications\DonationSuccessNotification($campaign->title, $donation->amount));
                        }
                        $ngo = $campaign->user;
                        if ($ngo) {
                            $ngo->notify(new \App\Notifications\DonationReceivedNotification($campaign->title, $donation->amount));
                        }
                    } catch (Exception $e) {
                        logger()->error('Webhook notification error: ' . $e->getMessage());
                    }
                }
            }
        }
    }

    private function processFailedPayment($paymentIntent)
    {
        $metadata = $paymentIntent->metadata;
        $donationId = $metadata->donation_id ?? null;

        if ($donationId) {
            $donation = \App\Models\Donation::find($donationId);
            if ($donation) {
                $donation->status = 'failed';
                $donation->save();
            }
        }
    }

    /**
     * Verify whether the onboarding process has been completed.
     */
    public function verifyOnboarding(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'success' => false,
                'completed' => false,
                'message' => 'No Stripe account linked.'
            ]);
        }

        try {
            $account = Account::retrieve($user->stripe_account_id);

            if ($account->details_submitted) {
                $user->stripe_onboarding_completed = true;
                $user->save();

                return response()->json([
                    'success' => true,
                    'completed' => true,
                    'message' => 'Stripe onboarding successfully verified.'
                ]);
            }

            return response()->json([
                'success' => true,
                'completed' => false,
                'message' => 'Onboarding has not been completed yet.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe Retrieval Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
