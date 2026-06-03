<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Get counter_id if user is a counter
        $counter_id = null;
        if ($user->isCounter()) {
            $counter = $user->counter()->first();
            $counter_id = $counter?->id;
        }

        $userData = $user->toArray();
        $userData['counter_id'] = $counter_id;

        return response()->json([
            'token' => $token,
            'user' => $userData,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function refresh(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }
}
