<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // Main dashboard statistics
    public function statistics(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Customer) {
            return $this->customerDashboard($user);
        } else {
            return $this->adminDashboard($user);
        }
    }

    // Admin/Staff Dashboard
    private function adminDashboard($user)
    {
        // Room Statistics
        $roomStats = [
            'total' => Room::count(),
            'available' => Room::where('status', 'available')->count(),
            'booked' => Room::where('status', 'booked')->count(),
            'maintenance' => Room::where('status', 'maintenance')->count(),
            'occupancy_rate' => Room::count() > 0 ?
                round((Room::where('status', 'booked')->count() / Room::count()) * 100, 2) : 0,
        ];

        // Booking Statistics
        $bookingStats = [
            'total' => Booking::count(),
            'pending' => Booking::where('status', 'pending')->count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'checked_in' => Booking::where('status', 'checked_in')->count(),
            'checked_out' => Booking::where('status', 'checked_out')->count(),
            'completed' => Booking::where('status', 'completed')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
        ];

        // Payment Statistics
        $paymentStats = [
            'total_revenue' => Payment::where('status', 'paid')->sum('amount'),
            'today_revenue' => Payment::where('status', 'paid')
                ->whereDate('paid_at', today())
                ->sum('amount'),
            'monthly_revenue' => Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('amount'),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'paid_payments' => Payment::where('status', 'paid')->count(),
        ];

        // Customer Statistics
        $customerStats = [
            'total' => Customer::count(),
            'new_today' => Customer::whereDate('created_at', today())->count(),
            'new_this_month' => Customer::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'active' => Customer::has('bookings', '>', 0)->count(),
        ];

        // Today's Activities
        $today = now()->toDateString();

        $todayStats = [
            'check_ins_today' => DB::table('check_in_outs')
                ->whereDate('check_in_time', $today)
                ->count(),
            'check_outs_today' => DB::table('check_in_outs')
                ->whereDate('check_out_time', $today)
                ->count(),
            'expected_check_ins' => Booking::where('check_in_date', $today)
                ->whereIn('status', ['confirmed'])
                ->count(),
            'expected_check_outs' => Booking::where('check_out_date', $today)
                ->whereIn('status', ['checked_in'])
                ->count(),
            'new_bookings_today' => Booking::whereDate('created_at', $today)->count(),
        ];

        // Recent Activities
        $recentBookings = Booking::with(['customer', 'room'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentPayments = Payment::with(['booking.customer'])
            ->where('status', 'paid')
            ->orderBy('paid_at', 'desc')
            ->limit(10)
            ->get();

        $recentCustomers = Customer::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Room Type Distribution
        $roomTypeStats = Room::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get();

        // Payment Method Distribution
        $paymentMethodStats = Payment::where('status', 'paid')
            ->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('method')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'room_stats' => $roomStats,
                'booking_stats' => $bookingStats,
                'payment_stats' => $paymentStats,
                'customer_stats' => $customerStats,
                'today_stats' => $todayStats,
                'recent_bookings' => $recentBookings,
                'recent_payments' => $recentPayments,
                'recent_customers' => $recentCustomers,
                'room_type_stats' => $roomTypeStats,
                'payment_method_stats' => $paymentMethodStats,
                'summary' => [
                    'occupancy_rate' => $roomStats['occupancy_rate'],
                    'revenue_today' => $paymentStats['today_revenue'],
                    'check_ins_today' => $todayStats['check_ins_today'],
                    'pending_bookings' => $bookingStats['pending'],
                ]
            ]
        ]);
    }

    // Customer Dashboard
    private function customerDashboard($customer)
    {
        // Customer's Booking Statistics
        $bookingStats = [
            'total' => $customer->bookings()->count(),
            'pending' => $customer->bookings()->where('status', 'pending')->count(),
            'confirmed' => $customer->bookings()->where('status', 'confirmed')->count(),
            'checked_in' => $customer->bookings()->where('status', 'checked_in')->count(),
            'checked_out' => $customer->bookings()->where('status', 'checked_out')->count(),
            'completed' => $customer->bookings()->where('status', 'completed')->count(),
            'cancelled' => $customer->bookings()->where('status', 'cancelled')->count(),
        ];

        // Total Spent
        $totalSpent = $customer->bookings()
            ->where('status', 'completed')
            ->sum('total_amount');

        // Upcoming Bookings
        $upcomingBookings = $customer->bookings()
            ->with(['room', 'payment', 'checkInOut'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('check_in_date', '>=', today())
            ->orderBy('check_in_date')
            ->limit(5)
            ->get();

        // Current Stay (if any)
        $currentStay = $customer->bookings()
            ->with(['room', 'checkInOut'])
            ->where('status', 'checked_in')
            ->first();

        // Recent Bookings
        $recentBookings = $customer->bookings()
            ->with(['room', 'payment'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Favorite Room Type
        $favoriteRoomType = $customer->bookings()
            ->join('rooms', 'bookings.room_id', '=', 'rooms.id')
            ->select('rooms.type', DB::raw('COUNT(*) as count'))
            ->groupBy('rooms.type')
            ->orderBy('count', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'booking_stats' => $bookingStats,
                'total_spent' => $totalSpent,
                'upcoming_bookings' => $upcomingBookings,
                'current_stay' => $currentStay,
                'recent_bookings' => $recentBookings,
                'favorite_room_type' => $favoriteRoomType,
                'customer' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'member_since' => $customer->created_at->format('F Y'),
                ]
            ]
        ]);
    }

    // Revenue Reports
    public function revenueReports(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view revenue reports.'
            ], 403);
        }

        $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        switch ($period) {
            case 'daily':
                $data = $this->dailyRevenue($year, $month);
                break;
            case 'weekly':
                $data = $this->weeklyRevenue($year);
                break;
            case 'yearly':
                $data = $this->yearlyRevenue();
                break;
            case 'monthly':
            default:
                $data = $this->monthlyRevenue($year);
                break;
        }

        // Top revenue rooms
        $topRooms = Booking::join('rooms', 'bookings.room_id', '=', 'rooms.id')
            ->select('rooms.room_number', 'rooms.type', DB::raw('SUM(bookings.total_amount) as revenue'))
            ->where('bookings.status', 'completed')
            ->groupBy('rooms.id', 'rooms.room_number', 'rooms.type')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();

        // Revenue by room type
        $revenueByRoomType = Booking::join('rooms', 'bookings.room_id', '=', 'rooms.id')
            ->select('rooms.type', DB::raw('SUM(bookings.total_amount) as revenue'))
            ->where('bookings.status', 'completed')
            ->groupBy('rooms.type')
            ->orderBy('revenue', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'revenue_data' => $data,
                'top_rooms' => $topRooms,
                'revenue_by_room_type' => $revenueByRoomType,
                'summary' => [
                    'total_revenue' => Payment::where('status', 'paid')->sum('amount'),
                    'average_daily_rate' => $this->calculateAverageDailyRate(),
                    'revenue_per_available_room' => $this->calculateRevPAR(),
                ]
            ]
        ]);
    }

    private function dailyRevenue($year, $month)
    {
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $data = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day);
            $revenue = Payment::where('status', 'paid')
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount');

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('d'),
                'day_name' => $date->format('D'),
                'revenue' => $revenue,
                'bookings' => Booking::whereDate('created_at', $date->toDateString())->count(),
            ];
        }

        return $data;
    }

    private function weeklyRevenue($year)
    {
        $data = [];

        for ($week = 1; $week <= 52; $week++) {
            $startOfWeek = Carbon::now()->setISODate($year, $week)->startOfWeek();
            $endOfWeek = $startOfWeek->copy()->endOfWeek();

            $revenue = Payment::where('status', 'paid')
                ->whereBetween('paid_at', [$startOfWeek, $endOfWeek])
                ->sum('amount');

            $data[] = [
                'week' => $week,
                'week_range' => $startOfWeek->format('M d') . ' - ' . $endOfWeek->format('M d'),
                'revenue' => $revenue,
                'bookings' => Booking::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
            ];
        }

        return $data;
    }

    private function monthlyRevenue($year)
    {
        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create()->month($month)->format('F');
            $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();

            $revenue = Payment::where('status', 'paid')
                ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $data[] = [
                'month' => $month,
                'month_name' => $monthName,
                'revenue' => $revenue,
                'bookings' => Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
                'occupancy_rate' => $this->calculateMonthlyOccupancy($year, $month),
            ];
        }

        return $data;
    }

    private function yearlyRevenue()
    {
        $startYear = now()->subYears(5)->year;
        $endYear = now()->year;
        $data = [];

        for ($year = $startYear; $year <= $endYear; $year++) {
            $startOfYear = Carbon::create($year, 1, 1)->startOfYear();
            $endOfYear = $startOfYear->copy()->endOfYear();

            $revenue = Payment::where('status', 'paid')
                ->whereBetween('paid_at', [$startOfYear, $endOfYear])
                ->sum('amount');

            $data[] = [
                'year' => $year,
                'revenue' => $revenue,
                'bookings' => Booking::whereBetween('created_at', [$startOfYear, $endOfYear])->count(),
                'average_daily_rate' => $this->calculateYearlyADR($year),
            ];
        }

        return $data;
    }

    private function calculateMonthlyOccupancy($year, $month)
    {
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $totalRooms = Room::count();
        $totalRoomDays = $totalRooms * $daysInMonth;

        if ($totalRoomDays == 0)
            return 0;

        $bookedRoomDays = Booking::whereYear('check_in_date', $year)
            ->whereMonth('check_in_date', $month)
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
            ->get()
            ->sum(function ($booking) use ($month, $year) {
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);

                // Adjust dates to be within the month
                $start = $checkIn->lt(Carbon::create($year, $month, 1))
                    ? Carbon::create($year, $month, 1)
                    : $checkIn;

                $end = $checkOut->gt(Carbon::create($year, $month, 1)->endOfMonth())
                    ? Carbon::create($year, $month, 1)->endOfMonth()
                    : $checkOut;

                return $start->diffInDays($end);
            });

        return round(($bookedRoomDays / $totalRoomDays) * 100, 2);
    }

    private function calculateAverageDailyRate()
    {
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $totalRoomNights = Booking::whereIn('status', ['completed', 'checked_out'])
            ->get()
            ->sum(function ($booking) {
                return Carbon::parse($booking->check_in_date)
                    ->diffInDays(Carbon::parse($booking->check_out_date));
            });

        return $totalRoomNights > 0 ? round($totalRevenue / $totalRoomNights, 2) : 0;
    }

    private function calculateYearlyADR($year)
    {
        $revenue = Payment::where('status', 'paid')
            ->whereYear('paid_at', $year)
            ->sum('amount');

        $roomNights = Booking::whereYear('check_in_date', $year)
            ->whereIn('status', ['completed', 'checked_out'])
            ->get()
            ->sum(function ($booking) {
                return Carbon::parse($booking->check_in_date)
                    ->diffInDays(Carbon::parse($booking->check_out_date));
            });

        return $roomNights > 0 ? round($revenue / $roomNights, 2) : 0;
    }

    private function calculateRevPAR()
    {
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $totalRooms = Room::count();
        $daysInPeriod = 30; // Last 30 days

        $totalRoomNights = $totalRooms * $daysInPeriod;

        return $totalRoomNights > 0 ? round($totalRevenue / $totalRoomNights, 2) : 0;
    }

    // Occupancy Reports
    public function occupancyReports(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view occupancy reports.'
            ], 403);
        }

        $period = $request->get('period', 'monthly');
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        switch ($period) {
            case 'daily':
                $data = $this->dailyOccupancy($year, $month);
                break;
            case 'weekly':
                $data = $this->weeklyOccupancy($year);
                break;
            case 'yearly':
                $data = $this->yearlyOccupancy();
                break;
            case 'monthly':
            default:
                $data = $this->monthlyOccupancy($year);
                break;
        }

        // Room type occupancy
        $roomTypeOccupancy = [];
        $roomTypes = Room::select('type')->distinct()->get();

        foreach ($roomTypes as $roomType) {
            $totalRooms = Room::where('type', $roomType->type)->count();
            $bookedRooms = Room::where('type', $roomType->type)
                ->where('status', 'booked')
                ->count();

            $roomTypeOccupancy[] = [
                'type' => $roomType->type,
                'total_rooms' => $totalRooms,
                'booked_rooms' => $bookedRooms,
                'occupancy_rate' => $totalRooms > 0 ? round(($bookedRooms / $totalRooms) * 100, 2) : 0,
            ];
        }

        // Top performing rooms
        $topRooms = Room::withCount(['bookings as total_bookings'])
            ->withSum('bookings as total_revenue', 'total_amount')
            ->orderBy('total_bookings', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'occupancy_data' => $data,
                'room_type_occupancy' => $roomTypeOccupancy,
                'top_performing_rooms' => $topRooms,
                'current_occupancy' => [
                    'total_rooms' => Room::count(),
                    'available_rooms' => Room::where('status', 'available')->count(),
                    'booked_rooms' => Room::where('status', 'booked')->count(),
                    'occupancy_rate' => Room::count() > 0 ?
                        round((Room::where('status', 'booked')->count() / Room::count()) * 100, 2) : 0,
                ]
            ]
        ]);
    }

    private function dailyOccupancy($year, $month)
    {
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $data = [];
        $totalRooms = Room::count();

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day);

            $bookedRooms = Booking::where(function ($query) use ($date) {
                $query->where('check_in_date', '<=', $date)
                    ->where('check_out_date', '>', $date);
            })
                ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
                ->count();

            $occupancyRate = $totalRooms > 0 ? round(($bookedRooms / $totalRooms) * 100, 2) : 0;

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('d'),
                'day_name' => $date->format('D'),
                'booked_rooms' => $bookedRooms,
                'available_rooms' => $totalRooms - $bookedRooms,
                'occupancy_rate' => $occupancyRate,
            ];
        }

        return $data;
    }

    private function weeklyOccupancy($year)
    {
        $data = [];
        $totalRooms = Room::count();

        for ($week = 1; $week <= 52; $week++) {
            $startOfWeek = Carbon::now()->setISODate($year, $week)->startOfWeek();
            $endOfWeek = $startOfWeek->copy()->endOfWeek();

            // Average booked rooms for the week
            $weeklyBookings = [];
            for ($day = 0; $day < 7; $day++) {
                $date = $startOfWeek->copy()->addDays($day);

                $bookedRooms = Booking::where(function ($query) use ($date) {
                    $query->where('check_in_date', '<=', $date)
                        ->where('check_out_date', '>', $date);
                })
                    ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
                    ->count();

                $weeklyBookings[] = $bookedRooms;
            }

            $avgBookedRooms = count($weeklyBookings) > 0 ? array_sum($weeklyBookings) / count($weeklyBookings) : 0;
            $occupancyRate = $totalRooms > 0 ? round(($avgBookedRooms / $totalRooms) * 100, 2) : 0;

            $data[] = [
                'week' => $week,
                'week_range' => $startOfWeek->format('M d') . ' - ' . $endOfWeek->format('M d'),
                'average_booked_rooms' => round($avgBookedRooms, 2),
                'occupancy_rate' => $occupancyRate,
            ];
        }

        return $data;
    }

    private function monthlyOccupancy($year)
    {
        $data = [];
        $totalRooms = Room::count();

        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create()->month($month)->format('F');
            $daysInMonth = Carbon::create($year, $month)->daysInMonth;

            // Calculate average booked rooms for the month
            $monthlyBookings = [];
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $date = Carbon::create($year, $month, $day);

                $bookedRooms = Booking::where(function ($query) use ($date) {
                    $query->where('check_in_date', '<=', $date)
                        ->where('check_out_date', '>', $date);
                })
                    ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
                    ->count();

                $monthlyBookings[] = $bookedRooms;
            }

            $avgBookedRooms = count($monthlyBookings) > 0 ? array_sum($monthlyBookings) / count($monthlyBookings) : 0;
            $occupancyRate = $totalRooms > 0 ? round(($avgBookedRooms / $totalRooms) * 100, 2) : 0;

            $data[] = [
                'month' => $month,
                'month_name' => $monthName,
                'average_booked_rooms' => round($avgBookedRooms, 2),
                'occupancy_rate' => $occupancyRate,
                'total_room_nights' => $avgBookedRooms * $daysInMonth,
            ];
        }

        return $data;
    }

    private function yearlyOccupancy()
    {
        $startYear = now()->subYears(5)->year;
        $endYear = now()->year;
        $data = [];
        $totalRooms = Room::count();

        for ($year = $startYear; $year <= $endYear; $year++) {
            $yearlyBookings = [];

            // Calculate for each month
            for ($month = 1; $month <= 12; $month++) {
                $daysInMonth = Carbon::create($year, $month)->daysInMonth;

                for ($day = 1; $day <= $daysInMonth; $day += 3) { // Sample every 3 days
                    $date = Carbon::create($year, $month, $day);

                    $bookedRooms = Booking::where(function ($query) use ($date) {
                        $query->where('check_in_date', '<=', $date)
                            ->where('check_out_date', '>', $date);
                    })
                        ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
                        ->count();

                    $yearlyBookings[] = $bookedRooms;
                }
            }

            $avgBookedRooms = count($yearlyBookings) > 0 ? array_sum($yearlyBookings) / count($yearlyBookings) : 0;
            $occupancyRate = $totalRooms > 0 ? round(($avgBookedRooms / $totalRooms) * 100, 2) : 0;

            $data[] = [
                'year' => $year,
                'average_booked_rooms' => round($avgBookedRooms, 2),
                'occupancy_rate' => $occupancyRate,
            ];
        }

        return $data;
    }

    // Customer Reports
    public function customerReports(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view customer reports.'
            ], 403);
        }

        $period = $request->get('period', 'monthly');
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        // Customer acquisition data
        $acquisitionData = $this->getCustomerAcquisitionData($period, $year, $month);

        // Top customers by revenue
        $topCustomers = Customer::withCount(['bookings as total_bookings'])
            ->withSum('bookings as total_spent', 'total_amount')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        // Customer segmentation
        $segmentation = [
            'new_customers' => Customer::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'returning_customers' => Customer::has('bookings', '>', 1)->count(),
            'one_time_customers' => Customer::has('bookings', 1)->count(),
            'inactive_customers' => Customer::doesntHave('bookings')
                ->orWhereHas('bookings', function ($query) {
                    $query->where('created_at', '<', now()->subMonths(6));
                })
                ->count(),
        ];

        // Customer demographics
        $demographics = [
            'top_countries' => Customer::select('country', DB::raw('COUNT(*) as count'))
                ->whereNotNull('country')
                ->groupBy('country')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'acquisition_data' => $acquisitionData,
                'top_customers' => $topCustomers,
                'segmentation' => $segmentation,
                'demographics' => $demographics,
                'summary' => [
                    'total_customers' => Customer::count(),
                    'customers_with_bookings' => Customer::has('bookings')->count(),
                    'average_bookings_per_customer' => Customer::has('bookings')
                        ->withCount('bookings')
                        ->get()
                        ->avg('bookings_count') ?? 0,
                ]
            ]
        ]);
    }

    private function getCustomerAcquisitionData($period, $year, $month)
    {
        switch ($period) {
            case 'daily':
                return $this->dailyCustomerAcquisition($year, $month);
            case 'weekly':
                return $this->weeklyCustomerAcquisition($year);
            case 'yearly':
                return $this->yearlyCustomerAcquisition();
            case 'monthly':
            default:
                return $this->monthlyCustomerAcquisition($year);
        }
    }

    private function dailyCustomerAcquisition($year, $month)
    {
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $data = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day);
            $newCustomers = Customer::whereDate('created_at', $date->toDateString())->count();

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('d'),
                'day_name' => $date->format('D'),
                'new_customers' => $newCustomers,
            ];
        }

        return $data;
    }

    private function monthlyCustomerAcquisition($year)
    {
        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create()->month($month)->format('F');
            $newCustomers = Customer::whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->count();

            $data[] = [
                'month' => $month,
                'month_name' => $monthName,
                'new_customers' => $newCustomers,
            ];
        }

        return $data;
    }

    private function weeklyCustomerAcquisition($year)
    {
        $data = [];

        for ($week = 1; $week <= 52; $week++) {
            $startOfWeek = Carbon::now()->setISODate($year, $week)->startOfWeek();
            $endOfWeek = $startOfWeek->copy()->endOfWeek();

            $newCustomers = Customer::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();

            $data[] = [
                'week' => $week,
                'week_range' => $startOfWeek->format('M d') . ' - ' . $endOfWeek->format('M d'),
                'new_customers' => $newCustomers,
            ];
        }

        return $data;
    }

    private function yearlyCustomerAcquisition()
    {
        $startYear = now()->subYears(5)->year;
        $endYear = now()->year;
        $data = [];

        for ($year = $startYear; $year <= $endYear; $year++) {
            $newCustomers = Customer::whereYear('created_at', $year)->count();

            $data[] = [
                'year' => $year,
                'new_customers' => $newCustomers,
            ];
        }

        return $data;
    }

    // Service Reports
    public function serviceReports(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view service reports.'
            ], 403);
        }

        // Top services by revenue
        $topServices = DB::table('booking_services')
            ->join('services', 'booking_services.service_id', '=', 'services.id')
            ->select(
                'services.id',
                'services.name',
                'services.type',
                DB::raw('SUM(booking_services.quantity) as total_quantity'),
                DB::raw('SUM(booking_services.total_price) as total_revenue')
            )
            ->groupBy('services.id', 'services.name', 'services.type')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get();

        // Service usage by type
        $serviceTypeStats = DB::table('booking_services')
            ->join('services', 'booking_services.service_id', '=', 'services.id')
            ->select(
                'services.type',
                DB::raw('SUM(booking_services.quantity) as total_quantity'),
                DB::raw('SUM(booking_services.total_price) as total_revenue')
            )
            ->groupBy('services.type')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // Service usage over time (monthly)
        $monthlyServiceUsage = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthName = $month->format('M Y');

            $revenue = DB::table('booking_services')
                ->whereMonth('booking_services.created_at', $month->month)
                ->whereYear('booking_services.created_at', $month->year)
                ->sum('total_price');

            $quantity = DB::table('booking_services')
                ->whereMonth('booking_services.created_at', $month->month)
                ->whereYear('booking_services.created_at', $month->year)
                ->sum('quantity');

            $monthlyServiceUsage[] = [
                'month' => $monthName,
                'revenue' => $revenue,
                'quantity' => $quantity,
            ];
        }

        // Most popular service packages
        $popularServices = Service::withCount(['bookingServices as times_ordered'])
            ->withSum('bookingServices as total_revenue', 'booking_services.total_price')
            ->orderBy('times_ordered', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_services' => $topServices,
                'service_type_stats' => $serviceTypeStats,
                'monthly_service_usage' => $monthlyServiceUsage,
                'popular_services' => $popularServices,
                'summary' => [
                    'total_service_revenue' => DB::table('booking_services')->sum('total_price'),
                    'average_service_per_booking' => Booking::has('services')
                        ->withCount('services')
                        ->get()
                        ->avg('services_count') ?? 0,
                    'most_popular_service_type' => $serviceTypeStats->first()->type ?? 'N/A',
                ]
            ]
        ]);
    }

    // Export Reports
    public function exportReport(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can export reports.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'report_type' => 'required|in:bookings,payments,customers,revenue,occupancy',
            'format' => 'required|in:json,csv',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        switch ($request->report_type) {
            case 'bookings':
                $data = $this->exportBookings($startDate, $endDate);
                $filename = 'bookings_' . now()->format('Y-m-d_H-i-s');
                break;
            case 'payments':
                $data = $this->exportPayments($startDate, $endDate);
                $filename = 'payments_' . now()->format('Y-m-d_H-i-s');
                break;
            case 'customers':
                $data = $this->exportCustomers($startDate, $endDate);
                $filename = 'customers_' . now()->format('Y-m-d_H-i-s');
                break;
            case 'revenue':
                $data = $this->exportRevenue($startDate, $endDate);
                $filename = 'revenue_' . now()->format('Y-m-d_H-i-s');
                break;
            case 'occupancy':
                $data = $this->exportOccupancy($startDate, $endDate);
                $filename = 'occupancy_' . now()->format('Y-m-d_H-i-s');
                break;
            default:
                $data = [];
                $filename = 'report_' . now()->format('Y-m-d_H-i-s');
        }

        if ($request->input('format') === 'csv') {
            return $this->exportToCSV($data, $filename);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'filename' => $filename . '.json',
        ]);
    }

    private function exportBookings($startDate, $endDate)
    {
        return Booking::with(['customer', 'room', 'services', 'payment'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($booking) {
                return [
                    'Booking ID' => $booking->id,
                    'Customer' => $booking->customer->name,
                    'Room' => $booking->room->room_number,
                    'Check In' => $booking->check_in_date,
                    'Check Out' => $booking->check_out_date,
                    'Guests' => $booking->number_of_guests,
                    'Total Amount' => $booking->total_amount,
                    'Status' => $booking->status,
                    'Created At' => $booking->created_at,
                    'Services' => $booking->services->pluck('name')->implode(', '),
                    'Payment Status' => $booking->payment ? $booking->payment->status : 'N/A',
                ];
            })
            ->toArray();
    }

    private function exportPayments($startDate, $endDate)
    {
        return Payment::with(['booking.customer'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($payment) {
                return [
                    'Payment ID' => $payment->id,
                    'Booking ID' => $payment->booking_id,
                    'Customer' => $payment->booking->customer->name,
                    'Amount' => $payment->amount,
                    'Method' => $payment->method,
                    'Status' => $payment->status,
                    'Transaction ID' => $payment->transaction_id,
                    'Paid At' => $payment->paid_at ? $payment->paid_at->format('Y-m-d H:i:s') : 'N/A',
                    'Created At' => $payment->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray(); // Convert to array
    }

    private function exportCustomers($startDate, $endDate)
    {
        return Customer::withCount(['bookings'])
            ->withSum('bookings as total_spent', 'total_amount')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($customer) {
                return [
                    'Customer ID' => $customer->id,
                    'Name' => $customer->name,
                    'Email' => $customer->email,
                    'Phone' => $customer->phone,
                    'Total Bookings' => $customer->bookings_count,
                    'Total Spent' => $customer->total_spent,
                    'Member Since' => $customer->created_at,
                ];
            })
            ->toArray();
    }

    private function exportRevenue($startDate, $endDate)
    {
        $dailyData = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $revenue = Payment::where('status', 'paid')
                ->whereDate('paid_at', $current->toDateString())
                ->sum('amount');

            $bookings = Booking::whereDate('created_at', $current->toDateString())->count();

            $dailyData[] = [
                'Date' => $current->format('Y-m-d'),
                'Revenue' => $revenue,
                'Bookings' => $bookings,
                'Day' => $current->format('l'),
            ];

            $current->addDay();
        }

        return $dailyData;
    }

    private function exportOccupancy($startDate, $endDate)
    {
        $dailyData = [];
        $current = $startDate->copy();
        $totalRooms = Room::count();

        while ($current <= $endDate) {
            $bookedRooms = Booking::where(function ($query) use ($current) {
                $query->where('check_in_date', '<=', $current)
                    ->where('check_out_date', '>', $current);
            })
                ->whereIn('status', ['confirmed', 'checked_in', 'checked_out', 'completed'])
                ->count();

            $occupancyRate = $totalRooms > 0 ? round(($bookedRooms / $totalRooms) * 100, 2) : 0;

            $dailyData[] = [
                'Date' => $current->format('Y-m-d'),
                'Total Rooms' => $totalRooms,
                'Booked Rooms' => $bookedRooms,
                'Available Rooms' => $totalRooms - $bookedRooms,
                'Occupancy Rate %' => $occupancyRate,
                'Day' => $current->format('l'),
            ];

            $current->addDay();
        }

        return $dailyData;
    }

    private function exportToCSV($data, $filename)
    {
        if (empty($data) || ($data instanceof \Illuminate\Support\Collection && $data->isEmpty())) {
            return response()->json([
                'success' => false,
                'message' => 'No data to export'
            ], 404);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');

            // Convert to array if it's a collection
            if ($data instanceof \Illuminate\Support\Collection) {
                $data = $data->toArray();
            }

            // Check if data is not empty
            if (empty($data)) {
                fputcsv($file, ['No data available']);
                fclose($file);
                return;
            }

            // Write headers - get first element keys
            $firstRow = reset($data);
            if (is_object($firstRow)) {
                $firstRow = (array) $firstRow;
            }
            fputcsv($file, array_keys($firstRow));

            // Write data
            foreach ($data as $row) {
                if (is_object($row)) {
                    $row = (array) $row;
                }
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}