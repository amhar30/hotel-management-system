<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Service;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    // Get all bookings with filters
    public function index(Request $request)
    {
        if ($request->has('checkAvailability')) {
            return response()->json([
                'success' => true,
                'data' => $this->checkAvailability($request)
            ]);
        } elseif ($request->has('statistics')) {
            return response()->json([
                'success' => true,
                'data' => $this->statistics($request)
            ]);
        } elseif ($request->has('updateStatus')) {
            return response()->json([
                'success' => true,
                'data' => $this->updateStatus($request, $request->id)
            ]);

        } elseif ($request->has('cancel')) {
            return response()->json([
                'success' => true,
                'data' => $this->cancel($request, $request->id)
            ]);
        }

        $user = $request->user();

        $query = Booking::with(['customer', 'room', 'services']);

        // If customer, only show their bookings
        if ($user instanceof Customer) {

            $query->where('customer_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('check_in_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('check_out_date', '<=', $request->to_date);
        }

        // Search by customer name or room number
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            })->orWhereHas('room', function ($q) use ($search) {
                $q->where('room_number', 'like', '%' . $search . '%');
            });
        }

        // Order by
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $bookings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    // Get single booking
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['customer', 'room', 'services', 'payment'])->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if ($user instanceof Customer && $booking->customer_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this booking'
            ], 403);
        }


        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    // Create new booking
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_guests' => 'required|integer|min:1',
            'services' => 'nullable|array',
            'services.*.service_id' => 'required_with:services|exists:services,id',
            'services.*.quantity' => 'required_with:services|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Check room availability
        $room = Room::find($request->room_id);

        if (!$room->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Room is not available for booking'
            ], 400);
        }

        if (!$room->isAvailableForDates($request->check_in_date, $request->check_out_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Room is already booked for selected dates'
            ], 400);
        }

        // Check capacity
        if ($request->number_of_guests > $room->capacity) {
            return response()->json([
                'success' => false,
                'message' => "Room capacity is {$room->capacity} guests"
            ], 400);
        }

        // Calculate total amount
        $stayDuration = Carbon::parse($request->check_in_date)
            ->diffInDays(Carbon::parse($request->check_out_date));

        $roomTotal = $room->price_per_night * $stayDuration;
        $servicesTotal = 0;
        $selectedServices = [];

        // Calculate services total
        if ($request->has('services')) {
            foreach ($request->services as $serviceItem) {
                $service = Service::find($serviceItem['service_id']);

                if (!$service->is_available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Service {$service->name} is not available"
                    ], 400);
                }

                $serviceTotal = $service->price * $serviceItem['quantity'];
                $servicesTotal += $serviceTotal;

                $selectedServices[] = [
                    'service_id' => $service->id,
                    'quantity' => $serviceItem['quantity'],
                    'unit_price' => $service->price,
                    'total_price' => $serviceTotal,
                ];
            }
        }

        $totalAmount = $roomTotal + $servicesTotal;

        // Get customer ID
        $customerId = $request->user()->id;

        // Create booking in transaction
        try {
            DB::beginTransaction();

            $booking = Booking::create([
                'customer_id' => $customerId,
                'room_id' => $request->room_id,
                'check_in_date' => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'number_of_guests' => $request->number_of_guests,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'special_requests' => $request->special_requests,
            ]);

            // Attach services if any
            if (!empty($selectedServices)) {
                foreach ($selectedServices as $serviceData) {
                    $booking->services()->attach($serviceData['service_id'], [
                        'quantity' => $serviceData['quantity'],
                        'unit_price' => $serviceData['unit_price'],
                        'total_price' => $serviceData['total_price'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully. Waiting for approval.',
                'data' => $booking->load(['room', 'services'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update booking status (admin/staff only)
    public function updateStatus(Request $request, $id)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can update booking status.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,checked_in,checked_out,completed',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        // Status transition validation
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['checked_in', 'cancelled'],
            'checked_in' => ['checked_out'],
            'checked_out' => ['completed'],
        ];

        if (
            isset($validTransitions[$booking->status]) &&
            !in_array($request->status, $validTransitions[$booking->status])
        ) {
            return response()->json([
                'success' => false,
                'message' => "Invalid status transition from {$booking->status} to {$request->status}"
            ], 400);
        }

        // Update room status based on booking status
        $room = $booking->room;

        if ($request->status === 'confirmed' || $request->status === 'checked_in') {
            $room->status = 'booked';
        } elseif ($request->status === 'cancelled' || $request->status === 'completed') {
            $room->status = 'available';
        }

        $room->save();

        // Update booking status
        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully',
            'data' => $booking
        ]);
    }

    // Cancel booking (customer can cancel pending/confirmed bookings)
    public function cancel(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if (
            $user instanceof Customer
            && $booking->customer_id != $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to cancel this booking'
            ], 403);
        }

        if (!$booking->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => "Booking cannot be cancelled in current status: {$booking->status}"
            ], 400);
        }

        $booking->status = 'cancelled';

        // Free up the room
        $room = $booking->room;
        $room->status = 'available';
        $room->save();

        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $booking
        ]);
    }

    // Check room availability
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'room_type' => 'nullable|in:single,double,deluxe,suite',
            'guests' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Room::where('status', 'available');

        // Filter by room type
        if ($request->has('room_type')) {
            $query->where('type', $request->room_type);
        }

        // Filter by capacity
        if ($request->has('guests')) {
            $query->where('capacity', '>=', $request->guests);
        }

        $availableRooms = $query->get()->filter(function ($room) use ($request) {
            return $room->isAvailableForDates($request->check_in_date, $request->check_out_date);
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'available_rooms' => $availableRooms,
                'check_in_date' => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'total_available' => $availableRooms->count(),
            ]
        ]);
    }

    // Get booking statistics
    public function statistics(Request $request)
    {
        $user = $request->user();

        $query = Booking::query();

        // If customer, only their stats
        if (
            $user instanceof Customer
        ) {
            $query->where('customer_id', $user->id);
        }

        $total = $query->count();
        $pending = $query->clone()->where('status', 'pending')->count();
        $confirmed = $query->clone()->where('status', 'confirmed')->count();
        $checkedIn = $query->clone()->where('status', 'checked_in')->count();
        $completed = $query->clone()->where('status', 'completed')->count();
        $cancelled = $query->clone()->where('status', 'cancelled')->count();

        // Monthly revenue (admin/staff only)
        $monthlyRevenue = [];
        if ($user->isAdmin() || $user->isStaff()) {
            $monthlyRevenue = Booking::where('status', 'completed')
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as revenue')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(6)
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'confirmed' => $confirmed,
                'checked_in' => $checkedIn,
                'completed' => $completed,
                'cancelled' => $cancelled,
                'monthly_revenue' => $monthlyRevenue,
            ]
        ]);
    }
}