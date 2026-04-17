<!DOCTYPE html>
<html>
<head>
    <title>Disbursement Report</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        h2 { border-bottom: 2px solid #E53935; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h2>Disbursement (Expense) Report</h2>
    
    <div class="summary">
        <p><strong>Campaign Title:</strong> {{ $campaign->title }}</p>
        <p><strong>Total Funds Raised:</strong> ${{ number_format($campaign->current_amount, 2) }}</p>
        <p><strong>Total Funds Spent:</strong> ${{ number_format($campaign->disbursements->sum('amount'), 2) }}</p>
        <p><strong>Remaining Balance:</strong> ${{ number_format($campaign->current_amount - $campaign->disbursements->sum('amount'), 2) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Expense Purpose</th>
                <th>Amount Spent</th>
                <th>Date Disbursed</th>
            </tr>
        </thead>
        <tbody>
            @foreach($campaign->disbursements as $disbursement)
            <tr>
                <td>{{ $disbursement->purpose }}</td>
                <td>${{ number_format($disbursement->amount, 2) }}</td>
                <td>{{ $disbursement->created_at->format('Y-m-d') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>