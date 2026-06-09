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
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // This tells Laravel that every Campaign belongs to a User (NGO)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }

    // A campaign has many disbursements (expenses)
    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }

    // A campaign has many donations
    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function isWithinWindow(): bool
    {
        $now = now();

        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    public function isOpen(): bool
    {
        return $this->status === 'active' && $this->isWithinWindow();
    }
}