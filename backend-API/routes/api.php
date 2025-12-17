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

// ----------------------------------------------------------------------------------
// 🛡️ Public Routes (සත්‍යාපනයකින් තොරව ප්‍රවේශ විය හැකි Routes)
// ----------------------------------------------------------------------------------

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Room public routes
Route::get('/public/rooms', [RoomController::class, 'index']);
Route::get('/public/rooms/{id}', [RoomController::class, 'show']);

// Service public routes
Route::get('/public/services', [ServiceController::class, 'index']);
Route::get('/public/services/{id}', [ServiceController::class, 'show']);


// ----------------------------------------------------------------------------------
// 🔑 Protected Routes (සත්‍යාපනය වූ පරිශීලකයින් සඳහා පමණි - auth:sanctum)
// ----------------------------------------------------------------------------------

Route::middleware('auth:sanctum')->group(function () {

    // Auth Routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Room Routes ---
    Route::get('/rooms/available', [RoomController::class, 'availableRooms']);
    Route::get('/rooms/statistics', [RoomController::class, 'statistics']);
    Route::apiResource('rooms', RoomController::class)->except(['store', 'update', 'destroy']);

    // Admin-only room routes
    Route::middleware('admin')->group(function () {
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
    });

    // --- Service Routes ---
    Route::get('/services/available', [ServiceController::class, 'availableServices']);
    Route::get('/services/statistics', [ServiceController::class, 'statistics']);
    Route::apiResource('services', ServiceController::class)->except(['store', 'update', 'destroy']);

    // Admin/staff service routes
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    });

    // ----------------------------------------------------------------------------------
    // 👤 Customer Routes
    // ----------------------------------------------------------------------------------

    // Customer profile (තමන්ගේ දත්ත)
    Route::get('/customer/profile', [CustomerController::class, 'show']);
    Route::put('/customer/profile', [CustomerController::class, 'update']);
    Route::get('/customer/bookings', [CustomerController::class, 'bookingHistory']);

    // Admin/staff customer management (වෙනත් පාරිභෝගිකයින්ගේ දත්ත)
    Route::middleware(['admin_or_staff'])->group(function () {

        // 1. 'statistics' route එක ඉහළින් තබා ඇත
        Route::get('/customers/statistics', [CustomerController::class, 'statistics']);

        // 2. Index route එක
        Route::get('/customers', [CustomerController::class, 'index']);

        // 3. Wildcard routes පහළින් තබා ඇත
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::get('/customers/{id}/bookings', [CustomerController::class, 'bookingHistory']);
    });

    // ----------------------------------------------------------------------------------
    // 📅 Booking Routes
    // ----------------------------------------------------------------------------------

    Route::get('/bookings/availability', [BookingController::class, 'checkAvailability']);
    Route::get('/bookings/statistics', [BookingController::class, 'statistics']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Bookings CRUD (පරිශීලකයාට තමන්ගේ Bookings කළමනාකරණය කිරීමට)
    Route::apiResource('bookings', BookingController::class);

    // Admin/staff booking management (Booking status යාවත්කාලීන කිරීමට)
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });

    // ----------------------------------------------------------------------------------
    // 💰 Payment Routes
    // ----------------------------------------------------------------------------------

    Route::get('/payments/statistics', [PaymentController::class, 'statistics']);
    Route::get('/bookings/{bookingId}/payment', [PaymentController::class, 'getByBooking']);

    // Payment creation (customer can create, staff can create for cash)
    Route::post('/payments', [PaymentController::class, 'store']);

    // Admin/staff payment management
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/{payment}/process', [PaymentController::class, 'processPayment']);
    });

    // Customer payment processing (online only)
    Route::post('/payments/{payment}/pay-online', [PaymentController::class, 'processPayment']);

    // ----------------------------------------------------------------------------------
    // 🚪 Check-in/out Routes
    // ----------------------------------------------------------------------------------

    Route::get('/bookings/{bookingId}/qr', [CheckInOutController::class, 'getQrCode']);

    // Admin/staff check-in/out management
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::post('/qr/scan', [CheckInOutController::class, 'scanQrCode']);
        Route::get('/checkinout/history', [CheckInOutController::class, 'history']);
        Route::get('/checkinout/today', [CheckInOutController::class, 'todaysActivities']);
        Route::post('/checkinout/manual', [CheckInOutController::class, 'manualCheck']);
    });

    // ----------------------------------------------------------------------------------
    // 📊 Dashboard and Reports Routes (NEW)
    // ----------------------------------------------------------------------------------

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