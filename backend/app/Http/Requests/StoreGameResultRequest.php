<?php

namespace App\Http\Requests;

use App\Models\Level;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreGameResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'level_id' => ['required', 'integer', 'exists:levels,id'],
            'cleared' => ['required', 'boolean'],
            'wave_reached' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $level = Level::find($this->input('level_id'));
            $waveReached = $this->input('wave_reached');

            if ($level && is_int($waveReached) && $waveReached > count($level->waves)) {
                $validator->errors()->add('wave_reached', '도달한 웨이브가 게임의 웨이브 수를 초과했습니다.');
            }
        });
    }
}
