<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckInOut extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'check_in_time',
        'check_out_time',
        'qr_code',
        'qr_secret',
        'is_checked_in',
        'is_checked_out',
        'notes',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'is_checked_in' => 'boolean',
        'is_checked_out' => 'boolean',
    ];

    // Generate QR data
    public function getQrDataAttribute()
    {
        return json_encode([
            'booking_id' => $this->booking_id,
            'qr_code' => $this->qr_code,
            'secret' => $this->qr_secret,
        ]);
    }

    // Get QR URL (for frontend display)
    public function getQrUrlAttribute()
    {
        // This would be the URL to scan/validate the QR
        return url("/api/qr/validate/{$this->qr_code}");
    }

    // Check if can check in
    public function canCheckIn()
    {
        return !$this->is_checked_in && !$this->is_checked_out;
    }

    // Check if can check out
    public function canCheckOut()
    {
        return $this->is_checked_in && !$this->is_checked_out;
    }

    // Perform check in
    public function performCheckIn()
    {
        if ($this->canCheckIn()) {
            $this->is_checked_in = true;
            $this->check_in_time = now();
            $this->save();

            // Update booking status
            $this->booking->status = 'checked_in';
            $this->booking->save();

            return true;
        }
        return false;
    }

    // Perform check out
    public function performCheckOut()
    {
        if ($this->canCheckOut()) {
            $this->is_checked_out = true;
            $this->check_out_time = now();
            $this->save();

            // Update booking status
            $this->booking->status = 'checked_out';
            $this->booking->save();

            return true;
        }
        return false;
    }

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}