<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    // Get all services
    public function index(Request $request)
    {
        if ($request->has('AvailableServices')) {
            return response()->json([
                'success' => true,
                'data' => $this->availableServices()
            ]);
        } elseif ($request->has('statistics')) {
            return response()->json([
                'success' => true,
                'data' => $this->statistics()
            ]);

        }


        $query = Service::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by availability
        if ($request->has('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Order by
        $orderBy = $request->get('order_by', 'name');
        $orderDir = $request->get('order_dir', 'asc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    // Get single service
    public function show($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    // Create new service (admin only)
    public function store(Request $request)
    {
        // Check if user is admin or staff
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can create services.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $service = Service::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully',
            'data' => $service
        ], 201);
    }

    // Update service (admin/staff only)
    public function update(Request $request, $id)
    {
        // Check if user is admin or staff
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin/staff can update services.'
            ], 403);
        }

        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|string',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $service->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $service
        ]);
    }

    // Delete service (admin only)
    public function destroy(Request $request, $id)
    {
        // Check if user is admin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete services.'
            ], 403);
        }

        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found'
            ], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully'
        ]);
    }

    // Get available services
    public function availableServices()
    {


        return response()->json([
            'success' => true,
            'data' => Service::where('is_available', 1)->orderBy('name')->get()
        ]);
    }

    // Get service statistics
    public function statistics()
    {
        $total = Service::count();
        $available = Service::where('is_available', 1)->count();
        $types = Service::select('type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'available' => $available,
                'types' => $types,
            ]
        ]);
    }
}