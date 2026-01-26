<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    // Get all customers (admin/staff only)
    public function index(Request $request)
    {


        if ($request->has('bookingHistory')) {
            return response()->json([
                'success' => true,
                'data' => $this->bookingHistory($request, $id = null)
            ]);
        } elseif ($request->has('statistics')) {
            return response()->json([
                'success' => true,
                'data' => $this->statistics($request)
            ]);
        }

        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view customers.'
            ], 403);
        }

        $query = Customer::query();

        // Search by name, email, or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%')
                ->orWhere('phone', 'like', '%' . $search . '%');
        }

        // Order by
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $customers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    // Get customer profile
    public function show(Request $request, $id = null)
    {
        // If no ID provided, return current customer
        if (!$id) {
            $customer = $request->user();

            if (!$customer instanceof Customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }
        } else {
            // Check authorization for viewing other customers
            $user = $request->user();
            if (!$user->isAdmin() && !$user->isStaff()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view other customers'
                ], 403);
            }

            $customer = Customer::find($id);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    // Update customer profile
    public function update(Request $request)
    {
        $customer = $request->user();

        if (!$customer instanceof Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'id_proof' => 'nullable|string',
            'id_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $customer
        ]);
    }

    // Get customer booking history
    public function bookingHistory(Request $request, $id = null)
    {
        if ($id) {
            // Check authorization for viewing other customers' history
            $user = $request->user();
            if (!$user->isAdmin() && !$user->isStaff()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view other customers\' history'
                ], 403);
            }

            $customer = Customer::find($id);
        } else {
            $customer = $request->user();
        }

        if (!$customer || !$customer instanceof Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $bookings = $customer->bookings()
            ->with(['room', 'services', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $customer,
                'bookings' => $bookings,
                'total_bookings' => $bookings->count(),
                'total_spent' => $bookings->where('status', 'completed')->sum('total_amount'),
            ]
        ]);
    }

    // Get customer statistics (admin/staff only)
    public function statistics(Request $request)
    {
        // Check authorization - ADD DEBUGGING
        $user = $request->user();

        // Debug: Log user info
        Log::info('User type: ' . get_class($user));
        Log::info('User data: ', $user->toArray());

        // FIX: Check if user is instance of User model (not Customer)
        if (!($user instanceof \App\Models\User) || (!$user->isAdmin() && !$user->isStaff())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can view customer statistics.'
            ], 403);
        }

        // Rest of the code... (Previous logic to calculate stats)
        $totalCustomers = Customer::count();
        $newCustomersThisMonth = Customer::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $customersWithBookings = Customer::has('bookings')->count();
        $topCustomers = Customer::withCount(['bookings as total_bookings'])
            ->withSum('bookings as total_spent', 'total_amount')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_customers' => $totalCustomers,
                'new_customers_this_month' => $newCustomersThisMonth,
                'customers_with_bookings' => $customersWithBookings,
                'top_customers' => $topCustomers,
            ]
        ]);
    }
}