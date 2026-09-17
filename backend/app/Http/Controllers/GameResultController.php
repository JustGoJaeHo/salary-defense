<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameResultRequest;
use App\Models\GameResult;
use App\Models\LevelClear;
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

        if ($gameResult->cleared) {
            LevelClear::updateOrCreate(
                ['user_id' => $request->user()->id, 'level_id' => $gameResult->level_id],
                ['cleared_at' => now()],
            );
        }

        return response()->json($gameResult, 201);
    }
}
