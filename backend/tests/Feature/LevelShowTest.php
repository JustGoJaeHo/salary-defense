<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LevelShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_unlocked_level_returns_its_wave_config(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        $level = Level::factory()->create([
            'stage_id' => $stage->id,
            'sort_order' => 1,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson("/api/levels/{$level->id}");

        $response->assertOk();
        $response->assertJson([
            'id' => $level->id,
            'key' => $level->key,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);
    }

    public function test_a_locked_level_is_forbidden(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        Level::factory()->create(['stage_id' => $stage->id, 'sort_order' => 1]);
        $lockedLevel = Level::factory()->create(['stage_id' => $stage->id, 'sort_order' => 2]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson("/api/levels/{$lockedLevel->id}");

        $response->assertForbidden();
    }
}
