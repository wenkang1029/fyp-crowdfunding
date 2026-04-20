<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campaign_id',
        'allocation_id',
        'amount',
        'status',
        'transaction_id'
    ];

    // A donation belongs to a user (the donor)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A donation belongs to a campaign
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function allocation()
    {
        return $this->belongsTo(Allocation::class);
    }
}