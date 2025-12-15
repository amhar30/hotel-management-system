<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Breakfast Buffet',
                'description' => 'Continental breakfast buffet',
                'price' => 500.00,
                'type' => 'food',
                'is_available' => true,
            ],
            [
                'name' => 'Lunch Special',
                'description' => 'Three course lunch',
                'price' => 800.00,
                'type' => 'food',
                'is_available' => true,
            ],
            [
                'name' => 'Dinner Package',
                'description' => 'Four course dinner',
                'price' => 1200.00,
                'type' => 'food',
                'is_available' => true,
            ],
            [
                'name' => 'Laundry Service',
                'description' => 'Same day laundry service',
                'price' => 300.00,
                'type' => 'laundry',
                'is_available' => true,
            ],
            [
                'name' => 'Dry Cleaning',
                'description' => 'Professional dry cleaning',
                'price' => 500.00,
                'type' => 'laundry',
                'is_available' => true,
            ],
            [
                'name' => 'Spa Session',
                'description' => '60 minute spa session',
                'price' => 1500.00,
                'type' => 'spa',
                'is_available' => true,
            ],
            [
                'name' => 'Airport Pickup',
                'description' => 'Luxury car airport pickup',
                'price' => 2000.00,
                'type' => 'transport',
                'is_available' => true,
            ],
            [
                'name' => 'City Tour',
                'description' => 'Guided city tour',
                'price' => 2500.00,
                'type' => 'tour',
                'is_available' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}