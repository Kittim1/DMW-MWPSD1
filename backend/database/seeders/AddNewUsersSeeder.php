<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AddNewUsersSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'claire@dmw.com'],
            [
                'name' => 'Claire',
                'password' => Hash::make('password'),
                'role' => 'counter',
            ]
        );

        User::firstOrCreate(
            ['email' => 'liza@dmw.com'],
            [
                'name' => 'Liza',
                'password' => Hash::make('password'),
                'role' => 'counter',
            ]
        );

        User::firstOrCreate(
            ['email' => 'eda@dmw.com'],
            [
                'name' => 'Eda',
                'password' => Hash::make('password'),
                'role' => 'counter',
            ]
        );
    }
}
