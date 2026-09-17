<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\LevelClear;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GameResultTest extends TestCase
{
    use RefreshDatabase;

    public function test_clearing_a_level_records_a_level_clear(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        $level = Level::factory()->create([
            'stage_id' => $stage->id,
            'sort_order' => 1,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/game-results', [
            'level_id' => $level->id,
            'cleared' => true,
            'wave_reached' => 1,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('level_clears', [
            'user_id' => $user->id,
            'level_id' => $level->id,
        ]);
    }

    public function test_failing_a_level_does_not_record_a_level_clear(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        $level = Level::factory()->create([
            'stage_id' => $stage->id,
            'sort_order' => 1,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/game-results', [
            'level_id' => $level->id,
            'cleared' => false,
            'wave_reached' => 0,
        ])->assertCreated();

        $this->assertDatabaseCount('level_clears', 0);
    }

    public function test_wave_reached_cannot_exceed_the_levels_wave_count(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        $level = Level::factory()->create([
            'stage_id' => $stage->id,
            'sort_order' => 1,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/game-results', [
            'level_id' => $level->id,
            'cleared' => false,
            'wave_reached' => 5,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('wave_reached');
    }

    public function test_clearing_a_level_again_does_not_duplicate_the_level_clear(): void
    {
        $stage = Stage::factory()->create(['sort_order' => 1]);
        $level = Level::factory()->create([
            'stage_id' => $stage->id,
            'sort_order' => 1,
            'waves' => [['enemyCount' => 5, 'spawnInterval' => 1000]],
        ]);
        $user = User::factory()->create();
        LevelClear::create(['user_id' => $user->id, 'level_id' => $level->id, 'cleared_at' => now()->subDay()]);

        Sanctum::actingAs($user);

        $this->postJson('/api/game-results', [
            'level_id' => $level->id,
            'cleared' => true,
            'wave_reached' => 1,
        ])->assertCreated();

        $this->assertDatabaseCount('level_clears', 1);
    }
}
