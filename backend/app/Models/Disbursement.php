<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disbursement extends Model
{
    use HasFactory;

    protected $fillable = ['campaign_id', 'purpose', 'amount', 'receipt_path'];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}