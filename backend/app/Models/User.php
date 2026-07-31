<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    const ROLE_SUPERADMIN = 'superadmin';
    const ROLE_COUNTER = 'counter';
    const ROLE_GUARD = 'guard';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
    ];

    public function counter()
    {
        return $this->hasOne(Counter::class);
    }

    public function isSuperAdmin()
    {
        return $this->role === self::ROLE_SUPERADMIN;
    }

    public function isCounter()
    {
        return $this->role === self::ROLE_COUNTER;
    }

    public function isGuard()
    {
        return $this->role === self::ROLE_GUARD;
    }
}
