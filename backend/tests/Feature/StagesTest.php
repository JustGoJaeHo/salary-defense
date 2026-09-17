<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\LevelClear;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_the_first_stage_and_its_first_level_are_unlocked_by_default(): void
    {
        $firstStage = Stage::factory()->create(['sort_order' => 1]);
        Level::factory()->create(['stage_id' => $firstStage->id, 'sort_order' => 1]);
        Level::factory()->create(['stage_id' => $firstStage->id, 'sort_order' => 2]);

        $secondStage = Stage::factory()->create(['sort_order' => 2]);
        Level::factory()->create(['stage_id' => $secondStage->id, 'sort_order' => 1]);

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/stages');

        $response->assertOk();
        $stages = $response->json();

        $this->assertTrue($stages[0]['unlocked']);
        $this->assertTrue($stages[0]['levels'][0]['unlocked']);
        $this->assertFalse($stages[0]['levels'][1]['unlocked']);
        $this->assertFalse($stages[1]['unlocked']);
        $this->assertFalse($stages[1]['levels'][0]['unlocked']);
    }

    public function test_clearing_every_level_in_a_stage_unlocks_the_next_stage(): void
    {
        $firstStage = Stage::factory()->create(['sort_order' => 1]);
        $onlyLevel = Level::factory()->create(['stage_id' => $firstStage->id, 'sort_order' => 1]);

        $secondStage = Stage::factory()->create(['sort_order' => 2]);
        Level::factory()->create(['stage_id' => $secondStage->id, 'sort_order' => 1]);

        $user = User::factory()->create();
        LevelClear::create(['user_id' => $user->id, 'level_id' => $onlyLevel->id, 'cleared_at' => now()]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/stages');

        $stages = $response->json();

        $this->assertTrue($stages[0]['levels'][0]['cleared']);
        $this->assertTrue($stages[1]['unlocked']);
        $this->assertTrue($stages[1]['levels'][0]['unlocked']);
    }
}
