<!DOCTYPE html>
<html>
<head>
    <title>Official Tax Exempt Receipt</title>
    <style>
        body { font-family: sans-serif; color: #1f2937; margin: 15px; font-size: 13px; line-height: 1.4; }
        .receipt-header { text-align: center; border-bottom: 2px double #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .receipt-header h1 { font-size: 20px; margin: 0; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; }
        .receipt-header p { margin: 4px 0 0 0; font-size: 11px; color: #4b5563; }
        
        .lhdn-reference { text-align: center; border: 1px dashed #2563eb; padding: 10px; background-color: #eff6ff; font-weight: bold; font-size: 11px; margin-bottom: 20px; border-radius: 6px; }
        
        .row { margin-bottom: 20px; }
        .col-half { width: 50%; float: left; }
        .clear { clear: both; }

        .meta-box { margin-bottom: 15px; }
        .meta-box p { margin: 4px 0; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .data-table th, .data-table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
        .data-table th { background-color: #f3f4f6; color: #374151; font-weight: bold; }
        
        .words-container { margin-top: 15px; padding: 10px; background-color: #f9fafb; border-left: 3px solid #2563eb; font-style: italic; }

        .footer-sig { margin-top: 50px; }
        .signature-box { float: right; width: 220px; text-align: center; border-top: 1px solid #9ca3af; padding-top: 8px; margin-top: 30px; }
        .signature-box img { max-width: 180px; max-height: 70px; display: block; margin: 0 auto 6px auto; }
    </style>
</head>
<body>

    <div class="receipt-header">
        <h1>Official Tax Exempt Receipt</h1>
        <p>Issued under Section 44(6) of the Income Tax Act 1967, Malaysia</p>
    </div>

    <div class="lhdn-reference">
        Approved Organization Reference: {{ $donation->campaign->user->lhdn_reference ?? 'LHDN.01/35/42/51/123-ABC' }} <br/>
        This organization is authorized to issue tax-exempt receipts for donations made towards charitable purposes.
    </div>

    <div class="row">
        <div class="col-half">
            <h4 style="margin: 0 0 5px 0; color: #1e293b;">NGO Details:</h4>
            <div class="meta-box">
                <p><strong>{{ $donation->campaign->user->org_name ?? $donation->campaign->user->name }}</strong></p>
                <p style="white-space: pre-wrap;">{{ $donation->campaign->user->mailing_address ?? 'St. John Ambulans Malaysia KMT, Selangor' }}</p>
                <p><strong>Reg Number:</strong> {{ $donation->campaign->user->org_reg_number ?? 'ORG-12345' }}</p>
            </div>
        </div>
        <div class="col-half" style="text-align: right;">
            <div class="meta-box" style="display: inline-block; text-align: left;">
                <p><strong>Receipt Number:</strong> {{ $donation->tax_receipt_number }}</p>
                <p><strong>Date of Donation:</strong> {{ $donation->created_at->format('Y-m-d') }}</p>
                <p><strong>Payment Method:</strong> {{ $donation->payment_method ? strtoupper($donation->payment_method) : 'N/A' }}</p>
                <p><strong>Transaction ID:</strong> {{ $donation->transaction_id }}</p>
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;"/>

    <div class="row">
        <h4 style="margin: 0 0 8px 0; color: #1e293b;">Donor Receipt Details:</h4>
        <div class="meta-box">
            <p><strong>Donor Full Name (MyKad/Passport):</strong> {{ $donation->tax_name ?? $donation->donor_name }}</p>
            <p><strong>Identification Number:</strong> {{ $donation->tax_id_number ?? $donation->user?->identification_number ?? 'N/A' }}</p>
            <p style="white-space: pre-wrap;"><strong>Mailing Address:</strong> <br/>{{ $donation->tax_address ?? $donation->user?->mailing_address ?? 'N/A' }}</p>
        </div>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="width: 25%; text-align: right;">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Charitable Donation to campaign: <strong>{{ $donation->campaign->title }}</strong></td>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">
                    {{ number_format($donation->amount, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <div class="words-container">
        <strong>Amount in words:</strong> {{ $amountInWords }}
    </div>

    <div class="footer-sig">
        <div style="float: left; width: 60%; font-size: 11px; color: #6b7280; margin-top: 20px;">
            * Please retain this receipt for your income tax declaration assessment. <br/>
            * Thank you for your support towards SJAM and related charitable activities.
        </div>
        <div class="signature-box">
            @php
                $sigSrc = null;
                try {
                    $sigPath = public_path('images/signature.png');
                    if (file_exists($sigPath) && is_readable($sigPath)) {
                        $sigData = file_get_contents($sigPath);
                        if ($sigData !== false) {
                            $sigSrc = 'data:image/png;base64,' . base64_encode($sigData);
                        }
                    }
                } catch (\Exception $e) {
                    $sigSrc = null;
                }
            @endphp
            @if($sigSrc)
                <img src="{{ $sigSrc }}" alt="Authorized Signature" />
            @else
                <p style="font-size: 10px; color: #9ca3af; margin: 0 0 40px 0;">[Digitally Authorized Stamp / Signature]</p>
            @endif
            <strong>Authorized Officer Signature</strong>
            <p style="font-size: 10px; margin: 2px 0 0 0; color: #6b7280;">{{ $donation->campaign->user->org_name ?? $donation->campaign->user->name }}</p>
        </div>
        <div class="clear"></div>
    </div>

</body>
</html>
