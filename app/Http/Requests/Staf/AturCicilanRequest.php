<?php

namespace App\Http\Requests\Staf;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AturCicilanRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jumlah_cicilan' => ['required', 'integer', 'min:2', 'max:12'],
        ];
    }
}
