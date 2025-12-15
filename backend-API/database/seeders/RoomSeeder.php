<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_number' => '101',
                'type' => 'single',
                'price_per_night' => 1500.00,
                'description' => 'Cozy single room with basic amenities',
                'capacity' => 1,
                'amenities' => json_encode(['wifi', 'tv', 'ac']),
                'status' => 'available',
            ],
            [
                'room_number' => '102',
                'type' => 'single',
                'price_per_night' => 1600.00,
                'description' => 'Single room with city view',
                'capacity' => 1,
                'amenities' => json_encode(['wifi', 'tv', 'ac', 'minibar']),
                'status' => 'available',
            ],
            [
                'room_number' => '201',
                'type' => 'double',
                'price_per_night' => 2500.00,
                'description' => 'Spacious double room',
                'capacity' => 2,
                'amenities' => json_encode(['wifi', 'tv', 'ac', 'minibar', 'coffee']),
                'status' => 'available',
            ],
            [
                'room_number' => '202',
                'type' => 'double',
                'price_per_night' => 2800.00,
                'description' => 'Double room with balcony',
                'capacity' => 2,
                'amenities' => json_encode(['wifi', 'tv', 'ac', 'minibar', 'balcony']),
                'status' => 'booked',
            ],
            [
                'room_number' => '301',
                'type' => 'deluxe',
                'price_per_night' => 4500.00,
                'description' => 'Luxurious deluxe room',
                'capacity' => 3,
                'amenities' => json_encode(['wifi', 'tv', 'ac', 'minibar', 'jacuzzi', 'balcony']),
                'status' => 'available',
            ],
            [
                'room_number' => '302',
                'type' => 'suite',
                'price_per_night' => 6500.00,
                'description' => 'Presidential suite with all amenities',
                'capacity' => 4,
                'amenities' => json_encode(['wifi', 'tv', 'ac', 'minibar', 'jacuzzi', 'balcony', 'kitchen']),
                'status' => 'maintenance',
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}