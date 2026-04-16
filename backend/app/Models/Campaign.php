<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    // Tell Laravel these columns are safe to insert data into
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'target_amount',
        'current_amount',
        'status',1
    ];

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }

    // A campaign has many disbursements (expenses)
    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }
}