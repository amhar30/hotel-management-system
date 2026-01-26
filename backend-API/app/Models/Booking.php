<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;
use App\Models\Room;
use App\Models\Service;
use App\Models\Payment;
use App\Models\CheckInOut;


class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'number_of_guests',
        'total_amount',
        'status',
        'special_requests',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    // Calculate stay duration
    public function getStayDurationAttribute()
    {
        return $this->check_in_date->diffInDays($this->check_out_date);
    }

    // Check if booking is active
    public function isActive()
    {
        return in_array($this->status, ['confirmed', 'checked_in']);
    }

    // Check if booking can be cancelled
    public function canBeCancelled()
    {
        return $this->status === 'pending' || $this->status === 'confirmed';
    }

    // Check if booking can be checked in
    public function canCheckIn()
    {
        return $this->status === 'confirmed' && $this->check_in_date <= now()->toDateString();
    }

    // Check if booking can be checked out
    public function canCheckOut()
    {
        return $this->status === 'checked_in';
    }


    //  Relationships


    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'booking_services')
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function checkInOut()
    {
        return $this->hasOne(CheckInOut::class);
    }

    // 🔑 New Helper Methods

    //Check if booking has a payment record attached.

    public function hasPayment()
    {
        return $this->payment()->exists();
    }

    // Check if the attached payment is marked as paid.
    //Assumes Payment model has an isPaid() method.

    public function isPaid()
    {
        return $this->payment && $this->payment->isPaid();
    }

    // Check if the booking has a QR code/CheckInOut record.

    public function hasQrCode()
    {
        return $this->checkInOut()->exists();
    }

    // Generate a new payment record for the booking.
    public function generatePayment($method = 'cash')
    {
        // 💡 Payment Model එකේ create method එක භාවිතා කරයි
        return Payment::create([
            'booking_id' => $this->id,
            'amount' => $this->total_amount,
            'method' => $method,
            'status' => 'pending',
        ]);
    }

    // Generate a unique QR code and secret for check-in/out.
    public function generateQrCode()
    {
        // Generate unique QR code and secret
        $qrCode = 'QR-' . strtoupper(uniqid());
        $qrSecret = bin2hex(random_bytes(16));

        // 💡 CheckInOut Model එකේ create method එක භාවිතා කරයි
        return CheckInOut::create([
            'booking_id' => $this->id,
            'qr_code' => $qrCode,
            'qr_secret' => $qrSecret,
        ]);
    }

    //  Scope for available dates

    public function scopeForRoom($query, $roomId, $checkIn, $checkOut)
    {
        return $query->where('room_id', $roomId)
            ->where(function ($q) use ($checkIn, $checkOut) {
                $q->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q2) use ($checkIn, $checkOut) {
                        $q2->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->whereIn('status', ['pending', 'confirmed', 'checked_in']);
    }
}