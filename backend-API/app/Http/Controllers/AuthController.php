<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Login for both users (admin/staff) and customers
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'user_type' => 'required|in:user,customer',
        ]);

        $userType = $request->user_type;

        if ($userType === 'user') {
            $user = User::where('email', $request->email)->first();
            $guard = 'web';
        } else {
            $user = Customer::where('email', $request->email)->first();
            $guard = 'customer';
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create token based on user type
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'user_type' => $userType,
            'role' => $userType === 'user' ? $user->role : 'customer',
        ]);
    }

    // Get authenticated user info
    public function user(Request $request)
    {
        $user = $request->user();

        // Determine user type
        if ($user instanceof User) {
            $user_type = 'user';
            $role = $user->role;
        } else {
            $user_type = 'customer';
            $role = 'customer';
        }

        return response()->json([
            'user' => $user,
            'user_type' => $user_type,
            'role' => $role,
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    // Register new customer
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string',
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
            'user_type' => 'customer',
            'role' => 'customer',
        ], 201);
    }
}