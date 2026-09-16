<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GuestAuthController extends Controller
{
    public function store(): JsonResponse
    {
        $user = User::create([
            'name' => 'Guest'.Str::random(6),
            'is_guest' => true,
        ]);

        $token = $user->createToken('guest')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'is_guest' => $user->is_guest,
            ],
        ], 201);
    }
}
