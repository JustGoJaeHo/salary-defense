<?php

namespace App\Http\Controllers;

use App\Services\Progression\StageProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StageController extends Controller
{
    public function __construct(private readonly StageProgressService $stageProgressService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->stageProgressService->stagesFor($request->user()));
    }
}
