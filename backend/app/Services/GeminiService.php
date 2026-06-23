<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GeminiService
{
    /**
     * Send a base64-encoded budget document (PDF/Image) to Gemini API and get structured allocations.
     *
     * @param string $base64Data
     * @param string $mimeType
     * @return array
     */
    public function generateAllocationsFromDocument(string $base64Data, string $mimeType): array
    {
        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            Log::error('Gemini API key is not configured in services.php');
            throw new HttpException(500, 'AI Service is not configured. Please contact the administrator.');
        }

        // Endpoint for Gemini 2.5 Flash
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

        // Detailed system prompt instructing Gemini how to parse the budget document
        $prompt = "You are an AI financial auditor assisting an NGO. " .
                  "Your task is to analyze the attached budget reference document (which may be a vendor quotation, project proposal, cost sheet, Excel export, or cost estimation sheet) and extract the list of target allocations/expense categories. " .
                  "Group similar expenses together into logical, high-level funding categories (e.g. 'Medical Supplies', 'Logistics & Transport', 'Food & Refreshments', 'Event Venue & Rentals', 'Staffing & Manpower', 'Publicity & Marketing', 'Operational Costs', etc.). " .
                  "Ensure that every cost category has a clear, concise name (purpose) and a positive numerical amount (amount in RM/MYR). " .
                  "Ignore headers, currency symbols, tax explanations, terms, or signatures. Only extract itemized targets. " .
                  "You must return your output strictly in JSON format matching the schema requested.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ],
                        [
                            'inlineData' => [
                                'mimeType' => $mimeType,
                                'data' => $base64Data
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'allocations' => [
                            'type' => 'ARRAY',
                            'description' => 'The list of parsed cost categories',
                            'items' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'purpose' => [
                                        'type' => 'STRING',
                                        'description' => 'Name of the cost category / allocation purpose (e.g. Medical Supplies)'
                                    ],
                                    'amount' => [
                                        'type' => 'NUMBER',
                                        'description' => 'Allocated numeric target amount for this category in RM'
                                    ]
                                ],
                                'required' => ['purpose', 'amount']
                            ]
                        ]
                    ],
                    'required' => ['allocations']
                ]
            ]
        ];

        try {
            // Set a generous timeout (e.g., 30 seconds) for the OCR + AI reasoning process
            $response = Http::timeout(30)->post($url, $payload);

            if ($response->failed()) {
                Log::error('Gemini API request failed', [
                    'status' => $response->status(),
                    'error' => $response->body()
                ]);

                $message = 'Failed to process document with AI service. Status: ' . $response->status();
                if ($response->status() === 503) {
                    $message = 'The AI service is temporarily overloaded (503). Google\'s free tier limit may have been reached. Please wait a few seconds and try again.';
                } elseif ($response->status() === 429) {
                    $message = 'The AI service rate limit was exceeded (429). Please wait a minute before retrying.';
                }

                throw new HttpException($response->status(), $message);
            }

            $responseBody = $response->json();
            
            // Extract the generated text block from the Gemini payload response
            $generatedText = $responseBody['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$generatedText) {
                Log::error('Gemini response did not contain candidates or text parts', ['response' => $responseBody]);
                throw new HttpException(502, 'The AI service returned an empty result.');
            }

            $parsedData = json_decode($generatedText, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($parsedData['allocations'])) {
                Log::error('Failed to parse Gemini output text as valid allocations JSON', [
                    'generatedText' => $generatedText,
                    'json_error' => json_last_error_msg()
                ]);
                throw new HttpException(502, 'The AI service returned malformed data.');
            }

            // Ensure amount fields are numeric and positive, and purpose is not empty
            $cleanedAllocations = [];
            foreach ($parsedData['allocations'] as $alloc) {
                $purpose = trim($alloc['purpose'] ?? '');
                $amount = floatval($alloc['amount'] ?? 0);

                if (!empty($purpose) && $amount > 0) {
                    $cleanedAllocations[] = [
                        'purpose' => $purpose,
                        'amount' => round($amount, 2)
                    ];
                }
            }

            if (empty($cleanedAllocations)) {
                throw new HttpException(422, 'The AI service was unable to find any valid allocation items in the uploaded document.');
            }

            return $cleanedAllocations;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini API connection timed out', ['message' => $e->getMessage()]);
            throw new HttpException(504, 'The AI service connection timed out. Please try a smaller file or enter allocations manually.');
        } catch (\Exception $e) {
            if ($e instanceof HttpException) {
                throw $e;
            }
            Log::error('Unexpected error during Gemini API call', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new HttpException(500, 'An unexpected error occurred while communicating with the AI service.');
        }
    }
}
