<?php

namespace App\Http\Controllers;

use App\Models\Level;
use App\Services\Progression\StageProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LevelController extends Controller
{
    public function __construct(private readonly StageProgressService $stageProgressService) {}

    public function show(Request $request, Level $level): JsonResponse
    {
        if (! $this->stageProgressService->isLevelUnlocked($request->user(), $level)) {
            return response()->json([
                'message' => '아직 잠긴 게임입니다.',
            ], 403);
        }

        return response()->json([
            'id' => $level->id,
            'key' => $level->key,
            'name' => $level->name,
            'waves' => $level->waves,
        ]);
    }
}
