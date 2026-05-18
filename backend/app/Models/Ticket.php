<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    const STATUS_WAITING = 'waiting';
    const STATUS_SERVING = 'serving';
    const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'priority_number',
        'counter_id',
        'status',
        'called_at',
        'completed_at',
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function counter(): BelongsTo
    {
        return $this->belongsTo(Counter::class);
    }
}
