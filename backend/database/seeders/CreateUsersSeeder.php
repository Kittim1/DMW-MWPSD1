<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@dmw.com',
                'password' => 'password',
                'role' => 'superadmin'
            ],
            [
                'name' => 'Guard',
                'email' => 'guard@dmw.com',
                'password' => 'password',
                'role' => 'guard'
            ],
            [
                'name' => 'Counter 1',
                'email' => 'counter1@dmw.com',
                'password' => 'password',
                'role' => 'counter'
            ],
            [
                'name' => 'Claire',
                'email' => 'claire@dmw.com',
                'password' => 'password',
                'role' => 'counter'
            ],
            [
                'name' => 'Liza',
                'email' => 'liza@dmw.com',
                'password' => 'password',
                'role' => 'counter'
            ],
            [
                'name' => 'Eda',
                'email' => 'eda@dmw.com',
                'password' => 'password',
                'role' => 'counter'
            ]
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'role' => $user['role']
                ]
            );
        }
    }
}
