<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    // UC011: Webhook for Dialogflow Chatbot
    public function handleWebhook(Request $request)
    {
        // 1. Dialogflow sends the "Intent" (what the user wants) in this specific JSON path
        $intentName = $request->input('queryResult.intent.displayName');

        // 2. Logic for "Get Active Campaigns" Intent
        if ($intentName === 'Get Active Campaigns') {
            
            // Fetch the top 3 active campaigns
            $campaigns = Campaign::where('status', 'active')->take(3)->get();
            
            if ($campaigns->isEmpty()) {
                $responseText = "Currently, there are no active campaigns. Please check back later!";
            } else {
                $responseText = "Here are some of our active campaigns you can donate to: \n\n";
                foreach ($campaigns as $campaign) {
                    $responseText .= "• " . $campaign->title . " (Target: $" . number_format($campaign->target_amount, 2) . ")\n";
                }
            }

            // 3. Return the exact JSON structure Dialogflow requires
            return response()->json([
                'fulfillmentText' => $responseText
            ]);
        }

        // 4. Default fallback response if the intent isn't recognized by our backend
        return response()->json([
            'fulfillmentText' => "I'm sorry, my database doesn't have the answer to that right now. Please contact the Admin."
        ]);
    }
}