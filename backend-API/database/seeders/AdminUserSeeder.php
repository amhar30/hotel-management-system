<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@hotel.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        // Optional: Create a test customer
        \App\Models\Customer::create([
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'password' => Hash::make('password123'),
            'phone' => '1234567890',
        ]);

        User::create([
            'name' => 'Ad',
            'email' => 'ad@hotel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
    }
}