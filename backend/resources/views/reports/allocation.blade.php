<!DOCTYPE html>
<html>
<head>
    <title>Allocation Report</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        h2 { border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; }
    </style>
</head>
<body>
    <h2>Allocation Report</h2>
    <p><strong>Campaign Title:</strong> {{ $campaign->title }}</p>
    <p><strong>Target Amount:</strong> ${{ number_format($campaign->target_amount, 2) }}</p>
    <p><strong>Total Allocated:</strong> ${{ number_format($campaign->allocations->sum('amount'), 2) }}</p>

    <table>
        <thead>
            <tr>
                <th>Sub-Goal Purpose</th>
                <th>Allocated Amount</th>
                <th>Date Created</th>
            </tr>
        </thead>
        <tbody>
            @foreach($campaign->allocations as $allocation)
            <tr>
                <td>{{ $allocation->purpose }}</td>
                <td>${{ number_format($allocation->amount, 2) }}</td>
                <td>{{ $allocation->created_at->format('Y-m-d') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>