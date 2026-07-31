<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'service_type', 'name');
    }

    public function ticketsMany()
    {
        return $this->belongsToMany(Ticket::class, 'ticket_service');
    }
}
