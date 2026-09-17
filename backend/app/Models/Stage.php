<?php

namespace App\Models;

use Database\Factories\StageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['key', 'name', 'sort_order'])]
class Stage extends Model
{
    /** @use HasFactory<StageFactory> */
    use HasFactory;

    public function levels(): HasMany
    {
        return $this->hasMany(Level::class);
    }
}
