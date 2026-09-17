<?php

namespace App\Services\Progression;

use App\Models\Level;
use App\Models\LevelClear;
use App\Models\Stage;
use App\Models\User;

class StageProgressService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function stagesFor(User $user): array
    {
        $stages = Stage::with(['levels' => fn ($query) => $query->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        $clearedLevelIds = LevelClear::where('user_id', $user->id)->pluck('level_id')->all();

        $stageUnlocked = true;
        $payload = [];

        foreach ($stages as $stage) {
            $previousLevelCleared = true;
            $allLevelsCleared = true;
            $levels = [];

            foreach ($stage->levels as $level) {
                $cleared = in_array($level->id, $clearedLevelIds, true);
                $unlocked = $stageUnlocked && $previousLevelCleared;

                $levels[] = [
                    'id' => $level->id,
                    'key' => $level->key,
                    'name' => $level->name,
                    'sort_order' => $level->sort_order,
                    'unlocked' => $unlocked,
                    'cleared' => $cleared,
                ];

                $previousLevelCleared = $cleared;
                if (! $cleared) {
                    $allLevelsCleared = false;
                }
            }

            $payload[] = [
                'id' => $stage->id,
                'key' => $stage->key,
                'name' => $stage->name,
                'sort_order' => $stage->sort_order,
                'unlocked' => $stageUnlocked,
                'levels' => $levels,
            ];

            $stageUnlocked = $stageUnlocked && $allLevelsCleared;
        }

        return $payload;
    }

    public function isLevelUnlocked(User $user, Level $level): bool
    {
        foreach ($this->stagesFor($user) as $stage) {
            foreach ($stage['levels'] as $levelPayload) {
                if ($levelPayload['id'] === $level->id) {
                    return $levelPayload['unlocked'];
                }
            }
        }

        return false;
    }
}
