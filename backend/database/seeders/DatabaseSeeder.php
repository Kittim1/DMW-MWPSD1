<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Counter;
use App\Models\Ticket;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create SuperAdmin
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@dmw.com',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
        ]);

        // Create 8 Counter Users and Counters
        for ($i = 1; $i <= 8; $i++) {
            $user = User::create([
                'name' => "Counter {$i} User",
                'email' => "counter{$i}@dmw.com",
                'password' => Hash::make('password'),
                'role' => 'counter',
            ]);

            Counter::create([
                'counter_name' => "Counter {$i}",
                'user_id' => $user->id,
                'is_active' => true,
            ]);
        }

        // Create Guard User
        User::create([
            'name' => 'Guard User',
            'email' => 'guard@dmw.com',
            'password' => Hash::make('password'),
            'role' => 'guard',
        ]);

        // Create default services
        $services = [
            'Overseas Employment Certificate',
            'Information Sheet',
            'Account Retrieval',
            'PEOS',
            'Balik Manggagawa',
            'Direct Hire',
            'G to G',
        ];

        foreach ($services as $service) {
            \App\Models\Service::create([
                'name' => $service,
            ]);
        }
    }
}
