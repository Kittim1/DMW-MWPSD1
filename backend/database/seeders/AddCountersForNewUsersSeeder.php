<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Counter;
use App\Models\User;

class AddCountersForNewUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Get the new users
        $claire = User::where('email', 'claire@dmw.com')->first();
        $liza = User::where('email', 'liza@dmw.com')->first();
        $eda = User::where('email', 'eda@dmw.com')->first();

        // Create counters for each
        if ($claire) {
            Counter::firstOrCreate(
                ['user_id' => $claire->id],
                ['counter_name' => 'Claire', 'is_active' => true]
            );
        }

        if ($liza) {
            Counter::firstOrCreate(
                ['user_id' => $liza->id],
                ['counter_name' => 'Liza', 'is_active' => true]
            );
        }

        if ($eda) {
            Counter::firstOrCreate(
                ['user_id' => $eda->id],
                ['counter_name' => 'Eda', 'is_active' => true]
            );
        }
    }
}
