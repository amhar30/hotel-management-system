<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    // Get all rooms (with filters)
    public function index(Request $request)
    {
        if ($request->has('AvailableRooms')) {
            return response()->json([
                'success' => true,
                'data' => $this->availableRooms($request)
            ]);
        } elseif ($request->has('statistics')) {
            return response()->json([
                'success' => true,
                'data' => $this->statistics()
            ]);

        }


        $query = Room::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price_per_night', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price_per_night', '<=', $request->max_price);
        }

        // Search by room number
        if ($request->has('search')) {
            $query->where('room_number', 'like', '%' . $request->search . '%');
        }

        // Order by
        $orderBy = $request->get('order_by', 'room_number');
        $orderDir = $request->get('order_dir', 'asc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $rooms = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }

    // Get single room
    public function show($id)
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $room
        ]);
    }

    // Create new room (admin only)
    public function store(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can create rooms.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'room_number' => 'required|string|unique:rooms',
            'type' => 'required|in:single,double,deluxe,suite',
            'price_per_night' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'amenities' => 'nullable|array',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room = Room::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Room created successfully',
            'data' => $room
        ], 201);
    }

    // Update room (admin only)
    public function update(Request $request, $id)
    {
        // Check if user is admin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can update rooms.'
            ], 403);
        }

        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'room_number' => 'sometimes|string|unique:rooms,room_number,' . $id,
            'type' => 'sometimes|in:single,double,deluxe,suite',
            'price_per_night' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:available,booked,maintenance',
            'capacity' => 'sometimes|integer|min:1',
            'amenities' => 'nullable|array',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully',
            'data' => $room
        ]);
    }

    // Delete room (admin only)
    public function destroy(Request $request, $id)
    {
        // Check if user is admin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete rooms.'
            ], 403);
        }

        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found'
            ], 404);
        }

        // Check if room has bookings
        if ($room->bookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete room with existing bookings'
            ], 400);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully'
        ]);
    }

    // Get available rooms for booking
    public function availableRooms(Request $request)
    {
        $rooms = Room::where('status', 'available')->orderBy('room_number')->get();

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }

    // Get room statistics
    public function statistics()
    {
        $total = Room::count();
        $available = Room::where('status', 'available')->count();
        $booked = Room::where('status', 'booked')->count();
        $maintenance = Room::where('status', 'maintenance')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'available' => $available,
                'booked' => $booked,
                'maintenance' => $maintenance,
                'occupancy_rate' => $total > 0 ? round(($booked / $total) * 100, 2) : 0,
            ]
        ]);
    }
}