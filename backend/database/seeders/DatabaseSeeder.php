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

        // Create 5 Counter Users and Counters
        for ($i = 1; $i <= 5; $i++) {
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

        // Create sample tickets
        $priorityNumbers = ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008', '0009', '0010'];
        
        foreach ($priorityNumbers as $index => $number) {
            Ticket::create([
                'priority_number' => $number,
                'status' => $index < 2 ? 'serving' : 'waiting',
                'counter_id' => $index < 2 ? ($index + 1) : null,
                'called_at' => $index < 2 ? now() : null,
            ]);
        }
    }
}
