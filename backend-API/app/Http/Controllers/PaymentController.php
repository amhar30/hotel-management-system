<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    // Get all payments (admin/staff only)
    public function index(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view all payments.'
            ], 403);
        }

        $query = Payment::with(['booking.customer', 'booking.room']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by customer name or transaction ID
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('booking.customer', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            })->orWhere('transaction_id', 'like', '%' . $search . '%');
        }

        // Order by
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $payments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // Get payment by ID
    public function show(Request $request, $id)
    {
        $payment = Payment::with(['booking.customer', 'booking.room'])->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if ($user instanceof \App\Models\Customer) {
            if ($payment->booking->customer_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this payment'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    // Create payment for booking (initiate payment)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'method' => 'required|in:cash,card,online',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::find($request->booking_id);

        // Check authorization
        $user = $request->user();
        if ($user instanceof \App\Models\Customer && $booking->customer_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to create payment for this booking'
            ], 403);
        }

        // Check if booking is already paid
        if ($booking->isPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is already paid'
            ], 400);
        }

        // Check if booking is confirmed
        if ($booking->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be confirmed before payment'
            ], 400);
        }

        // Create payment
        $payment = $booking->generatePayment($request->input('method'));

        return response()->json([
            'success' => true,
            'message' => 'Payment created successfully',
            'data' => $payment
        ], 201);
    }

    // Process payment (mark as paid)
    public function processPayment(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if ($user instanceof \App\Models\Customer) {
            // Customer can only pay online (simulated)
            if ($payment->booking->customer_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to process this payment'
                ], 403);
            }

            // Customer can only process online payments
            if ($payment->method !== 'online') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only online payments can be processed by customers'
                ], 400);
            }

            // Simulate online payment
            return $this->processOnlinePayment($payment);
        } else {
            // Admin/staff can process any payment
            $validator = Validator::make($request->all(), [
                'transaction_id' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mark payment as paid
            $payment->markAsPaid($request->transaction_id);

            if ($request->has('notes')) {
                $payment->notes = $request->notes;
                $payment->save();
            }

            // Generate QR code for the booking
            if (!$payment->booking->hasQrCode()) {
                $payment->booking->generateQrCode();
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => $payment->load('booking')
            ]);
        }
    }

    // Simulate online payment processing
    private function processOnlinePayment(Payment $payment)
    {
        // Simulate payment processing
        sleep(2); // Simulate API call delay

        // Simulate 90% success rate
        $success = rand(1, 10) <= 9;

        if ($success) {
            // Generate mock transaction ID
            $transactionId = 'TXN' . strtoupper(uniqid());

            $payment->markAsPaid($transactionId);

            // Generate QR code
            if (!$payment->booking->hasQrCode()) {
                $payment->booking->generateQrCode();
            }

            return response()->json([
                'success' => true,
                'message' => 'Online payment successful',
                'data' => [
                    'payment' => $payment,
                    'qr_code' => $payment->booking->checkInOut->qr_code,
                ]
            ]);
        } else {
            $payment->status = 'failed';
            $payment->save();

            return response()->json([
                'success' => false,
                'message' => 'Payment failed. Please try again.'
            ], 400);
        }
    }

    // Get payment by booking ID
    public function getByBooking(Request $request, $bookingId)
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
                'message' => 'Unauthorized to view this payment'
            ], 403);
        }

        $payment = $booking->payment;

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'No payment found for this booking'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    // Get payment statistics
    public function statistics(Request $request)
    {
        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view payment statistics.'
            ], 403);
        }

        $total = Payment::count();
        $paid = Payment::where('status', 'paid')->count();
        $pending = Payment::where('status', 'pending')->count();
        $failed = Payment::where('status', 'failed')->count();

        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $todayRevenue = Payment::where('status', 'paid')
            ->whereDate('paid_at', today())
            ->sum('amount');

        // Payment method distribution
        $methodStats = Payment::where('status', 'paid')
            ->selectRaw('method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('method')
            ->get();

        // Daily revenue for last 7 days
        $dailyRevenue = Payment::where('status', 'paid')
            ->whereDate('paid_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(paid_at) as date, SUM(amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_payments' => $total,
                'paid' => $paid,
                'pending' => $pending,
                'failed' => $failed,
                'total_revenue' => $totalRevenue,
                'today_revenue' => $todayRevenue,
                'method_stats' => $methodStats,
                'daily_revenue' => $dailyRevenue,
            ]
        ]);
    }
}