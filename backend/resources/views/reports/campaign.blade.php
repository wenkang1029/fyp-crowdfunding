<!DOCTYPE html>
<html>
<head>
    <title>Campaign Summary Report</title>
    <style>
        body { font-family: sans-serif; color: #1f2937; margin: 20px; }
        h2 { border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 5px; color: #2563eb; }
        h3 { border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 25px; color: #374151; }
        .meta-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        .meta-table td { padding: 6px 10px; border: none; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .data-table th, .data-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        .data-table th { background-color: #f9fafb; font-weight: bold; color: #4b5563; }
        .status-badge { display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px; }
        .status-approved { background-color: #d1fae5; color: #065f46; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .summary-box table { width: 100%; border-collapse: collapse; }
        .summary-box td { padding: 4px 0; border: none; }
        .bold-val { font-weight: bold; text-align: right; }
    </style>
</head>
<body>
    <h2>Campaign Summary Report</h2>
    <p style="font-size: 12px; color: #6b7280; margin-top: 0; margin-bottom: 20px;">
        Generated on {{ date('Y-m-d H:i') }}
    </p>

    <table class="meta-table">
        <tr>
            <td style="width: 20%; font-weight: bold;">Campaign Title:</td>
            <td>{{ $campaign->title }}</td>
        </tr>
            <td style="font-weight: bold;">Organized By:</td>
            <td>{{ $campaign->user->name }} ({{ $campaign->user->email }})</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Status:</td>
            <td><span class="status-badge" style="background-color: #e0f2fe; color: #0369a1; text-transform: uppercase;">{{ $campaign->status }}</span></td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Timeline:</td>
            <td>
                {{ $campaign->start_date ? $campaign->start_date->format('Y-m-d') : 'N/A' }} 
                to 
                {{ $campaign->end_date ? $campaign->end_date->format('Y-m-d') : 'N/A' }}
            </td>
        </tr>
    </table>

    <div class="summary-box">
        <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px;">Financial Tally</h4>
        <table>
            <tr>
                <td>Target Goal:</td>
                <td class="bold-val">RM {{ number_format($campaign->target_amount, 2) }}</td>
            </tr>
            <tr>
                <td>Total Raised:</td>
                <td class="bold-val" style="color: #059669;">RM {{ number_format($campaign->current_amount, 2) }}</td>
            </tr>
            <tr>
                <td>Total Disbursed (Approved Payouts):</td>
                <td class="bold-val" style="color: #ea580c;">
                    RM {{ number_format($campaign->disbursements->where('status', 'approved')->sum('amount'), 2) }}
                </td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1;">
                <td style="padding-top: 8px; font-weight: bold;">Remaining Account Balance:</td>
                <td class="bold-val" style="padding-top: 8px; font-size: 15px; color: #2563eb;">
                    RM {{ number_format($campaign->current_amount - $campaign->disbursements->where('status', 'approved')->sum('amount'), 2) }}
                </td>
            </tr>
        </table>
    </div>

    <h3>Donations Received</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Sub-goal / Purpose</th>
                <th>Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($donations as $donation)
                <tr>
                    <td>{{ $donation->created_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $donation->user->name ?? $donation->donor_name }}</td>
                    <td>{{ $donation->allocation->purpose ?? 'Overall campaign goal' }}</td>
                    <td style="font-weight: bold;">{{ number_format($donation->amount, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colSpan="4" style="text-align: center; color: #9ca3af; padding: 15px;">No donations received yet.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h3>Disbursements & Expenses</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Purpose</th>
                <th>Amount (RM)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($disbursements as $disbursement)
                <tr>
                    <td>{{ $disbursement->created_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $disbursement->purpose }}</td>
                    <td style="font-weight: bold;">{{ number_format($disbursement->amount, 2) }}</td>
                    <td>
                        <span class="status-badge status-{{ $disbursement->status }}">
                            {{ ucfirst($disbursement->status) }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colSpan="4" style="text-align: center; color: #9ca3af; padding: 15px;">No disbursement requests submitted yet.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
