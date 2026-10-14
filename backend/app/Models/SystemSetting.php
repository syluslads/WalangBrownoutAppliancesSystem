<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value', 'description'];

    /**
     * Get a setting value by key, with an optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        return $setting?->value ?? $default;
    }

    /**
     * Set (upsert) a setting value by key.
     */
    public static function set(string $key, mixed $value, string $description = null): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            array_filter([
                'value'       => $value,
                'description' => $description,
            ], fn ($v) => $v !== null)
        );
    }
}
