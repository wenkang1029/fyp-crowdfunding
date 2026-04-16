<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Allocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'purpose',
        'amount'
    ];

    // An allocation belongs to a single campaign
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}