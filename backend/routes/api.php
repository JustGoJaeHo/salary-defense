<?php

use App\Http\Controllers\GameResultController;
use Illuminate\Support\Facades\Route;

Route::post('/game-results', [GameResultController::class, 'store']);
