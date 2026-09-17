<?php

namespace Database\Factories;

use App\Models\Level;
use App\Models\Stage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Level>
 */
class LevelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stage_id' => Stage::factory(),
            'key' => fake()->unique()->slug(2),
            'name' => fake()->unique()->jobTitle(),
            'sort_order' => fake()->unique()->numberBetween(1, 1000),
            'waves' => [
                ['enemyCount' => 5, 'spawnInterval' => 1000],
            ],
        ];
    }
}
