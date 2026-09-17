<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\Stage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StageSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = [
            ['key' => 'part_time', 'name' => '아르바이트'],
            ['key' => 'sme', 'name' => '중소기업'],
            ['key' => 'mid_size', 'name' => '중견기업'],
            ['key' => 'large_corp', 'name' => '대기업'],
            ['key' => 'business', 'name' => '사업'],
            ['key' => 'global', 'name' => '글로벌'],
        ];

        // 초기 웨이브 구성은 기존 게임의 3웨이브를 그대로 스캐폴드로 사용한다 (웨이브당 등장 수는 기존의 1.5배)
        $defaultWaves = [
            ['enemyCount' => 8, 'spawnInterval' => 1000],
            ['enemyCount' => 12, 'spawnInterval' => 800],
            ['enemyCount' => 18, 'spawnInterval' => 600],
        ];

        foreach ($stages as $index => $stageData) {
            $stage = Stage::updateOrCreate(
                ['key' => $stageData['key']],
                ['name' => $stageData['name'], 'sort_order' => $index + 1],
            );

            Level::updateOrCreate(
                ['key' => "{$stageData['key']}_1"],
                [
                    'stage_id' => $stage->id,
                    'name' => "{$stageData['name']} 1",
                    'sort_order' => 1,
                    'waves' => $defaultWaves,
                ],
            );
        }
    }
}
