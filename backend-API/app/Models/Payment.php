<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'method',
        'status',
        'transaction_id',
        'notes',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // Payment status check methods
    public function isPaid()
    {
        return $this->status === 'paid';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function isRefunded()
    {
        return $this->status === 'refunded';
    }

    // Get formatted amount
    public function getFormattedAmountAttribute()
    {
        return 'LKR' . number_format($this->amount, 2);
    }

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // Mark as paid
    public function markAsPaid($transactionId = null)
    {
        $this->status = 'paid';
        $this->paid_at = now();

        if ($transactionId) {
            $this->transaction_id = $transactionId;
        }

        $this->save();

        // Update booking status if needed
        if ($this->booking && $this->booking->status === 'pending') {
            $this->booking->status = 'confirmed';
            $this->booking->save();
        }
    }
}