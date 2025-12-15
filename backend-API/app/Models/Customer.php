<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
// 💡 ඔබට Booking Model එක භාවිතා කිරීමට මෙය අවශ්‍ය විය හැකිය
use App\Models\Booking;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'country',
        'id_proof',
        'id_number',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // --- නව Relationship එක ---
    /**
     * Get the bookings made by the customer.
     */
    public function bookings()
    {
        // 💡 Customer කෙනෙකුට බොහෝ Bookings තිබිය හැක (One-to-Many)
        return $this->hasMany(Booking::class);
    }
    // ----------------------------
}