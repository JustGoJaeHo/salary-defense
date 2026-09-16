<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameResultRequest;
use App\Models\GameResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GameResultController extends Controller
{
    public function store(StoreGameResultRequest $request): JsonResponse
    {
        $gameResult = GameResult::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'nickname' => Str::limit($request->user()->name, 20, ''),
        ]);

        return response()->json($gameResult, 201);
    }
}
