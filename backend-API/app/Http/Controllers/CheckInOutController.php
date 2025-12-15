<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CheckInOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckInOutController extends Controller
{
    // Get QR code for booking
    public function getQrCode(Request $request, $bookingId)
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if ($user instanceof \App\Models\Customer && $booking->customer_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view QR code for this booking'
            ], 403);
        }

        // Check if booking is paid
        if (!$booking->isPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be paid before QR code is generated'
            ], 400);
        }

        // Get or create QR code
        if (!$booking->hasQrCode()) {
            $booking->generateQrCode();
            $booking->refresh();
        }

        $checkInOut = $booking->checkInOut;

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code' => $checkInOut->qr_code,
                'qr_data' => $checkInOut->qr_data,
                'qr_url' => $checkInOut->qr_url,
                'is_checked_in' => $checkInOut->is_checked_in,
                'is_checked_out' => $checkInOut->is_checked_out,
                'check_in_time' => $checkInOut->check_in_time,
                'check_out_time' => $checkInOut->check_out_time,
                'booking' => $booking,
            ]
        ]);
    }

    // Validate and process QR code scan (for staff)
    public function scanQrCode(Request $request)
    {
        // Check authorization (staff only)
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only staff can scan QR codes.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string',
            'action' => 'required|in:check_in,check_out,validate',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $checkInOut = CheckInOut::where('qr_code', $request->qr_code)
            ->with('booking.customer', 'booking.room')
            ->first();

        if (!$checkInOut) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code'
            ], 404);
        }

        $booking = $checkInOut->booking;

        if ($request->action === 'validate') {
            // Just validate the QR code
            return response()->json([
                'success' => true,
                'message' => 'QR code validated successfully',
                'data' => [
                    'booking' => $booking,
                    'check_in_out' => $checkInOut,
                    'can_check_in' => $checkInOut->canCheckIn(),
                    'can_check_out' => $checkInOut->canCheckOut(),
                ]
            ]);
        }

        if ($request->action === 'check_in') {
            if (!$checkInOut->canCheckIn()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot check in. Already checked in or checked out.'
                ], 400);
            }

            // Check if today is check-in date
            if ($booking->check_in_date > now()->toDateString()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Check-in is only allowed on or after ' . $booking->check_in_date
                ], 400);
            }

            if ($checkInOut->performCheckIn()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Check-in successful',
                    'data' => [
                        'booking' => $booking->fresh(),
                        'check_in_out' => $checkInOut->fresh(),
                    ]
                ]);
            }
        }

        if ($request->action === 'check_out') {
            if (!$checkInOut->canCheckOut()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot check out. Not checked in or already checked out.'
                ], 400);
            }

            if ($checkInOut->performCheckOut()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Check-out successful',
                    'data' => [
                        'booking' => $booking->fresh(),
                        'check_in_out' => $checkInOut->fresh(),
                    ]
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Action failed'
        ], 400);
    }

    // Get check-in/out history (admin/staff only)
    public function history(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view check-in/out history.'
            ], 403);
        }

        $query = CheckInOut::with(['booking.customer', 'booking.room']);

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('check_in_time', $request->date)
                ->orWhereDate('check_out_time', $request->date);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'checked_in') {
                $query->where('is_checked_in', true)->where('is_checked_out', false);
            } elseif ($request->status === 'checked_out') {
                $query->where('is_checked_out', true);
            } elseif ($request->status === 'not_checked_in') {
                $query->where('is_checked_in', false)->where('is_checked_out', false);
            }
        }

        // Order by
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $history = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    // Get today's check-ins/check-outs
    public function todaysActivities(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view today\'s activities.'
            ], 403);
        }

        $today = now()->toDateString();

        $todaysCheckIns = CheckInOut::whereDate('check_in_time', $today)
            ->with(['booking.customer', 'booking.room'])
            ->get();

        $todaysCheckOuts = CheckInOut::whereDate('check_out_time', $today)
            ->with(['booking.customer', 'booking.room'])
            ->get();

        $expectedCheckIns = Booking::where('check_in_date', $today)
            ->whereIn('status', ['confirmed'])
            ->with(['customer', 'room', 'checkInOut'])
            ->get();

        $expectedCheckOuts = Booking::where('check_out_date', $today)
            ->whereIn('status', ['checked_in'])
            ->with(['customer', 'room', 'checkInOut'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'todays_check_ins' => $todaysCheckIns,
                'todays_check_outs' => $todaysCheckOuts,
                'expected_check_ins' => $expectedCheckIns,
                'expected_check_outs' => $expectedCheckOuts,
                'summary' => [
                    'checked_in_today' => $todaysCheckIns->count(),
                    'checked_out_today' => $todaysCheckOuts->count(),
                    'expected_to_check_in' => $expectedCheckIns->count(),
                    'expected_to_check_out' => $expectedCheckOuts->count(),
                ]
            ]
        ]);
    }

    // Manual check-in/out (for staff when QR fails)
    public function manualCheck(Request $request)
    {
        // Check authorization (staff only)
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only staff can perform manual check-in/out.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'action' => 'required|in:check_in,check_out',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::find($request->booking_id);

        if ($request->action === 'check_in') {
            if ($booking->status !== 'confirmed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking must be confirmed before check-in'
                ], 400);
            }

            // Get or create check-in record
            if (!$booking->hasQrCode()) {
                $booking->generateQrCode();
            }

            $checkInOut = $booking->checkInOut;

            if ($checkInOut->performCheckIn()) {
                if ($request->has('notes')) {
                    $checkInOut->notes = $request->notes;
                    $checkInOut->save();
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Manual check-in successful',
                    'data' => [
                        'booking' => $booking->fresh(),
                        'check_in_out' => $checkInOut->fresh(),
                    ]
                ]);
            }
        }

        if ($request->action === 'check_out') {
            if ($booking->status !== 'checked_in') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking must be checked-in before check-out'
                ], 400);
            }

            $checkInOut = $booking->checkInOut;

            if ($checkInOut->performCheckOut()) {
                if ($request->has('notes')) {
                    $checkInOut->notes = $request->notes;
                    $checkInOut->save();
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Manual check-out successful',
                    'data' => [
                        'booking' => $booking->fresh(),
                        'check_in_out' => $checkInOut->fresh(),
                    ]
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Action failed'
        ], 400);
    }
}