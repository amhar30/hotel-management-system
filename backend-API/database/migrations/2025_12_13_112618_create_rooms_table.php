<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->enum('type', ['single', 'double', 'deluxe', 'suite'])->default('single');
            $table->decimal('price_per_night', 10, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['available', 'booked', 'maintenance'])->default('available');
            $table->integer('capacity')->default(1);
            $table->json('amenities')->nullable(); // e.g., ["wifi", "ac", "tv"]
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};