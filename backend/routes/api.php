<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\GuestAuthController;
use App\Http\Controllers\GameResultController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\StageController;
use Illuminate\Support\Facades\Route;

Route::post('/game-results', [GameResultController::class, 'store'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/stages', [StageController::class, 'index']);
    Route::get('/levels/{level}', [LevelController::class, 'show']);
});

Route::prefix('auth')->group(function () {
    Route::post('/guest', [GuestAuthController::class, 'store']);

    Route::prefix('google')->group(function () {
        Route::get('/redirect', [GoogleAuthController::class, 'redirect']);
        Route::get('/callback', [GoogleAuthController::class, 'callback']);
        Route::post('/ticket', [GoogleAuthController::class, 'ticket'])->middleware('auth:sanctum');
    });
});
