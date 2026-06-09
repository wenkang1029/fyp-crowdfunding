<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateCampaignStatusByDate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:update-status-by-date';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate or complete campaigns based on start_date and end_date';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = now();

        // Activate pending campaigns whose start_date has passed
        $pending = Campaign::where('status', 'pending')
            ->whereNotNull('start_date')
            ->where('start_date', '<=', $now)
            ->get();

        foreach ($pending as $campaign) {
            $campaign->update(['status' => 'active']);

            $ngoUser = User::find($campaign->user_id);
            if ($ngoUser) {
                $ngoUser->notify(new \App\Notifications\CampaignApprovedNotification($campaign->title));
            }
        }

        // Complete active campaigns whose end_date has passed
        $toComplete = Campaign::where('status', 'active')
            ->whereNotNull('end_date')
            ->where('end_date', '<', $now)
            ->get();

        foreach ($toComplete as $campaign) {
            $campaign->update(['status' => 'completed']);
        }

        $this->info('Campaign statuses reconciled by date.');

        return Command::SUCCESS;
    }
}
