<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ticket extends Model
{
    const STATUS_WAITING = 'waiting';
    const STATUS_SERVING = 'serving';
    const STATUS_COMPLETED = 'completed';
    const STATUS_SKIPPED = 'skipped';
    const STATUS_CANCELLED = 'cancelled';

    const SERVICE_TYPES = [
        'Overseas Employment Certificate',
        'Information Sheet',
        'Account Retrieval',
        'PEOS',
        'Balik Manggagawa',
        'Direct Hire',
        'G to G',
        'Help Desk'
    ];

    protected $fillable = [
        'priority_number',
        'service_type',
        'session_date',
        'session_type',
        'counter_id',
        'status',
        'called_at',
        'completed_at',
        'ticket_identifier',
        'has_appointment',
        'client_name',
        'scheduled_time',
        'scheduled_day',
        'helpdesk_type',
        'assigned_counter_ids',
        'is_priority',
        'priority_type',
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'completed_at' => 'datetime',
        'assigned_counter_ids' => 'array',
        'is_priority' => 'boolean',
    ];

    public function counter(): BelongsTo
    {
        return $this->belongsTo(Counter::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'ticket_service');
    }
}
