<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nickname', 'cleared', 'wave_reached'])]
class GameResult extends Model
{
    protected function casts(): array
    {
        return [
            'cleared' => 'boolean',
            'wave_reached' => 'integer',
        ];
    }
}
