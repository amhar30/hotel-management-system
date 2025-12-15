<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Room;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $customer = Customer::first();
        $room1 = Room::where('room_number', '101')->first();
        $room2 = Room::where('room_number', '201')->first();

        if ($customer && $room1 && $room2) {
            // Create a completed booking
            Booking::create([
                'customer_id' => $customer->id,
                'room_id' => $room1->id,
                'check_in_date' => Carbon::now()->subDays(10),
                'check_out_date' => Carbon::now()->subDays(7),
                'number_of_guests' => 1,
                'total_amount' => 4500.00, // 3 nights * 1500
                'status' => 'completed',
                'special_requests' => 'Early check-in requested',
            ]);

            // Create a pending booking
            Booking::create([
                'customer_id' => $customer->id,
                'room_id' => $room2->id,
                'check_in_date' => Carbon::now()->addDays(5),
                'check_out_date' => Carbon::now()->addDays(8),
                'number_of_guests' => 2,
                'total_amount' => 7500.00, // 3 nights * 2500
                'status' => 'pending',
                'special_requests' => 'Need extra pillows',
            ]);

            // Create a confirmed booking
            Booking::create([
                'customer_id' => $customer->id,
                'room_id' => $room1->id,
                'check_in_date' => Carbon::now()->addDays(2),
                'check_out_date' => Carbon::now()->addDays(4),
                'number_of_guests' => 1,
                'total_amount' => 3000.00, // 2 nights * 1500
                'status' => 'confirmed',
            ]);
        }

        // Update room status for booked rooms
        $room2->status = 'booked';
        $room2->save();
    }
}