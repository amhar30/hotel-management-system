<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// 💡 ඔබට Booking::class භාවිතා කිරීමට මෙය අවශ්‍ය විය හැකිය
use App\Models\Booking;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'type',
        'price_per_night',
        'description',
        'status',
        'capacity',
        'amenities',
        'image',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'amenities' => 'array',
    ];

    // --- නව Relationship එක ---
    /**
     * Get the bookings for the room.
     */
    public function bookings()
    {
        // 💡 Room එකකට බොහෝ Bookings තිබිය හැක
        return $this->hasMany(Booking::class);
    }
    // ----------------------------

    // --- නව Method එක ---
    /**
     * Check if room is available for given dates.
     * Requires the 'forRoom' scope on the Booking model.
     */
    public function isAvailableForDates($checkIn, $checkOut)
    {
        // $this->bookings() මඟින් මෙම කාමරයට අදාළ bookings පමණක් ලබා ගනී
        $conflictingBooking = $this->bookings()
            // forRoom() scope එක මඟින් දින පරාසය ගැටෙන booking තිබේදැයි පරීක්ෂා කරයි.
            // මෙම scope එක Booking Model එක තුළ නිර්වචනය කළ යුතුය.
            ->forRoom($this->id, $checkIn, $checkOut)
            ->first();

        // ගැටෙන Booking එකක් නොමැති නම්, කාමරය "Available" වේ.
        return !$conflictingBooking;
    }
    // -------------------

    // Room status check methods
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    public function isBooked()
    {
        return $this->status === 'booked';
    }

    public function isUnderMaintenance()
    {
        return $this->status === 'maintenance';
    }

    // Get formatted price
    public function getFormattedPriceAttribute()
    {
        return 'LKR ' . number_format($this->attributes['price_per_night'], 2);
    }

    // Get room type label
    public function getTypeLabelAttribute()
    {
        return ucfirst($this->type);
    }
}