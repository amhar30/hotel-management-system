<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// 💡 අවශ්‍ය Models මෙහිදී use කර ඇත
use App\Models\Booking;
use App\Models\BookingService; // Pivot Model එක සඳහා

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'type',
        'is_available',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
    ];

    // Get formatted price - Access the attribute directly to avoid recursion/casting conflicts
    public function getFormattedPriceAttribute()
    {
        // $this->attributes['price'] භාවිතා කරන්න
        return 'LKR ' . number_format($this->attributes['price'], 2);
    }

    // -----------------------------------------------------------------------
    // 🔗 Relationships
    // -----------------------------------------------------------------------

    /**
     * Get the BookingService pivot records associated with the service.
     * Represents the 1:N relationship to the intermediate table.
     */
    public function bookingServices()
    {
        return $this->hasMany(BookingService::class);
    }

    /**
     * The bookings that belong to the service (Many-to-Many relationship).
     */
    public function bookings()
    {
        return $this->belongsToMany(Booking::class, 'booking_services')
            // pivot table එකේ අමතර columns ලබා ගැනීමට
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }
}