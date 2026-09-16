<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'nickname', 'cleared', 'wave_reached'])]
class GameResult extends Model
{
    protected function casts(): array
    {
        return [
            'cleared' => 'boolean',
            'wave_reached' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
