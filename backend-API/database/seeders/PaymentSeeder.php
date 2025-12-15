<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\CheckInOut;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Get bookings
        $completedBooking = Booking::where('status', 'completed')->first();
        $confirmedBooking = Booking::where('status', 'confirmed')->first();
        $pendingBooking = Booking::where('status', 'pending')->first();

        // Create payment for completed booking
        if ($completedBooking) {
            Payment::create([
                'booking_id' => $completedBooking->id,
                'amount' => $completedBooking->total_amount,
                'method' => 'cash',
                'status' => 'paid',
                'transaction_id' => 'TXN' . strtoupper(uniqid()),
                'paid_at' => now()->subDays(8),
            ]);

            // Create check-in/out for completed booking
            CheckInOut::create([
                'booking_id' => $completedBooking->id,
                'check_in_time' => now()->subDays(10)->addHours(14),
                'check_out_time' => now()->subDays(7)->addHours(11),
                'qr_code' => 'QR-' . strtoupper(uniqid()),
                'qr_secret' => bin2hex(random_bytes(16)),
                'is_checked_in' => true,
                'is_checked_out' => true,
            ]);
        }

        // Create payment for confirmed booking
        if ($confirmedBooking) {
            $payment = Payment::create([
                'booking_id' => $confirmedBooking->id,
                'amount' => $confirmedBooking->total_amount,
                'method' => 'online',
                'status' => 'paid',
                'transaction_id' => 'TXN' . strtoupper(uniqid()),
                'paid_at' => now()->subDays(1),
            ]);

            // Generate QR for confirmed booking
            $confirmedBooking->generateQrCode();
        }

        // Create pending payment for pending booking
        if ($pendingBooking) {
            Payment::create([
                'booking_id' => $pendingBooking->id,
                'amount' => $pendingBooking->total_amount,
                'method' => 'cash',
                'status' => 'pending',
            ]);
        }
    }
}