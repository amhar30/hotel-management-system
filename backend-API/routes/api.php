<?php

use App\Http\Controllers\RoomController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CheckInOutController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// public route
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::prefix('public')->group(function () {
    Route::resource('services', ServiceController::class)->only(['index', 'show']);
    Route::resource('rooms', RoomController::class)->only(['index', 'show']);
});

// logged only routes
Route::middleware('auth:sanctum')->group(function () {


    //auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);


    //rooms
    Route::resource('rooms', RoomController::class)->except(['store', 'update', 'destroy']);

    // rooms(admin only)
    Route::middleware('admin')->group(function () {
        Route::resource('rooms', RoomController::class)->only(['store', 'update', 'destroy']);
    });

    //services
    Route::resource('services', ServiceController::class)->except(['store', 'update', 'destroy']);

    // service (Admin/staff )
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::resource('/services', (ServiceController::class))->only(['update']);
    });
    // service (admin only)
    Route::middleware(['admin'])->group(function () {
        Route::resource('/services', (ServiceController::class))->only(['store', 'destroy']);
    });

    // Customer Routes
    Route::get('/customer/profile', [CustomerController::class, 'show']);
    Route::put('/customer/profile', [CustomerController::class, 'update']);
    Route::get('/customer/bookings', [CustomerController::class, 'bookingHistory']);

    // customer Routes(Admin/staff only) 
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::resource('customers', CustomerController::class)->except(['update', 'store']);
    });

    //  Booking Routes
    Route::resource('bookings', BookingController::class)->except(['updateStatus']);

    //  booking Admin/staff
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });

    //  Payment Routes
    Route::get('/payments/statistics', [PaymentController::class, 'statistics']);
    Route::get('/bookings/{bookingId}/payment', [PaymentController::class, 'getByBooking']);

    // Payment creation 
    Route::post('/payments', [PaymentController::class, 'store']);

    // Admin/staff payment management
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/{payment}/process', [PaymentController::class, 'processPayment']);
    });

    // Customer payment processing
    Route::post('/payments/{payment}/pay-online', [PaymentController::class, 'processPayment']);

    // Check-in/out Routes
    Route::get('/bookings/{bookingId}/qr', [CheckInOutController::class, 'getQrCode']);

    // Admin/staff check-in/out management
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::post('/qr/scan', [CheckInOutController::class, 'scanQrCode']);
        Route::get('/checkinout/history', [CheckInOutController::class, 'history']);
        Route::get('/checkinout/today', [CheckInOutController::class, 'todaysActivities']);
        Route::post('/checkinout/manual', [CheckInOutController::class, 'manualCheck']);
    });

    // Dashboard and Reports Routes (NEW)
    // Main dashboard
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);

    // Reports (admin/staff only)
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::get('/reports/revenue', [DashboardController::class, 'revenueReports']);
        Route::get('/reports/occupancy', [DashboardController::class, 'occupancyReports']);
        Route::get('/reports/customers', [DashboardController::class, 'customerReports']);
        Route::get('/reports/services', [DashboardController::class, 'serviceReports']);
        Route::post('/reports/export', [DashboardController::class, 'exportReport']);
    });

});