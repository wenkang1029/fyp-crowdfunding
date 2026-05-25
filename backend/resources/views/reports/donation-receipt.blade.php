<!DOCTYPE html>
<html>
<head>
    <title>Donation Receipt</title>
    <style>
        body { font-family: sans-serif; color: #1f2937; }
        h2 { border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .meta { margin-top: 12px; }
        .meta p { margin: 6px 0; }
        .summary { margin-top: 20px; padding: 14px; background: #f8fafc; border-radius: 6px; }
        .summary p { margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background-color: #f3f4f6; }
    </style>
</head>
<body>
    <h2>Donation Receipt</h2>

    <div class="meta">
        <p><strong>Receipt ID:</strong> DR-{{ str_pad($donation->id, 6, '0', STR_PAD_LEFT) }}</p>
        <p><strong>Date:</strong> {{ $donation->created_at->format('Y-m-d H:i') }}</p>
        <p><strong>Transaction ID:</strong> {{ $donation->transaction_id }}</p>
    </div>

    <div class="summary">
        <p><strong>Donor Name:</strong> {{ $donation->user?->name ?? $donation->donor_name ?? 'Anonymous' }}</p>
        <p><strong>Donor Email:</strong> {{ $donation->user?->email ?? 'N/A' }}</p>
        <p><strong>Campaign:</strong> {{ $donation->campaign?->title ?? 'Unknown Campaign' }}</p>
        <p><strong>Organized By:</strong> {{ $donation->campaign?->user?->name ?? 'Verified NGO' }}</p>
        <p><strong>Allocated To:</strong> {{ $donation->allocation?->purpose ?? 'Overall campaign goal' }}</p>
        <p><strong>Payment Method:</strong> {{ $donation->payment_method ? strtoupper($donation->payment_method) : 'N/A' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Donation Amount</td>
                <td>{{ number_format($donation->amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        This receipt confirms your donation to the campaign listed above. Thank you for your support.
    </p>
</body>
</html>
