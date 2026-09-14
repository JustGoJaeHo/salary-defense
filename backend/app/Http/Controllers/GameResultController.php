<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameResultRequest;
use App\Models\GameResult;
use Illuminate\Http\JsonResponse;

class GameResultController extends Controller
{
    public function store(StoreGameResultRequest $request): JsonResponse
    {
        $gameResult = GameResult::create($request->validated());

        return response()->json($gameResult, 201);
    }
}
