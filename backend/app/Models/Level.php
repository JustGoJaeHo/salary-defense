<?php

namespace App\Models;

use Database\Factories\LevelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['stage_id', 'key', 'name', 'sort_order', 'waves'])]
class Level extends Model
{
    /** @use HasFactory<LevelFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'waves' => 'array',
        ];
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    public function gameResults(): HasMany
    {
        return $this->hasMany(GameResult::class);
    }

    public function levelClears(): HasMany
    {
        return $this->hasMany(LevelClear::class);
    }
}
