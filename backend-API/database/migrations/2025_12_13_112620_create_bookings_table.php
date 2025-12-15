<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('number_of_guests')->default(1);
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'completed'])->default('pending');
            $table->text('special_requests')->nullable();
            $table->timestamps();

            // Prevent double booking index
            $table->unique(['room_id', 'check_in_date', 'check_out_date', 'status'], 'unique_room_booking');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};