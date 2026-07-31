<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Counter;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AddMissingCountersSeeder extends Seeder
{
    public function run(): void
    {
        // Add counters 6, 7, 8 if they don't exist
        for ($i = 6; $i <= 8; $i++) {
            // Check if counter already exists
            $counter = Counter::where('counter_name', "Counter {$i}")->first();
            
            if (!$counter) {
                // Create user if not exists
                $user = User::firstOrCreate(
                    ['email' => "counter{$i}@dmw.com"],
                    [
                        'name' => "Counter {$i} User",
                        'password' => Hash::make('password'),
                        'role' => 'counter',
                    ]
                );
                
                // Create counter
                Counter::create([
                    'counter_name' => "Counter {$i}",
                    'user_id' => $user->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
