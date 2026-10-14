<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    /**
     * GET /api/settings
     *
     * Returns all system settings as a flat key→value map.
     * Admin-only via route middleware.
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all()
            ->pluck('value', 'key')
            ->toArray();

        return response()->json(['data' => $settings]);
    }

    /**
     * PUT /api/settings
     *
     * Bulk upsert of settings. Accepts a flat JSON object of key→value pairs.
     * Admin-only via route middleware.
     *
     * Example body:
     * {
     *   "seasonal_threshold_pct": "30",
     *   "expiry_warning_months": "8",
     *   "expiry_hard_limit_months": "9",
     *   "low_stock_notifications": "true",
     *   "discrepancy_alerts": "true"
     * }
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'seasonal_threshold_pct'   => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'expiry_warning_months'    => ['sometimes', 'integer', 'min:1'],
            'expiry_hard_limit_months' => ['sometimes', 'integer', 'min:1'],
            'low_stock_notifications'  => ['sometimes', 'in:true,false,1,0'],
            'discrepancy_alerts'       => ['sometimes', 'in:true,false,1,0'],
        ]);

        $descriptions = [
            'seasonal_threshold_pct'   => 'Reorder trigger when seasonal stock falls below this % of forecast.',
            'expiry_warning_months'    => 'Alert threshold: months in storage before expiry warning fires.',
            'expiry_hard_limit_months' => 'Hard expiration limit in months for perishable items.',
            'low_stock_notifications'  => 'Whether to alert when any item reaches its reorder point.',
            'discrepancy_alerts'       => 'Whether to flag mismatches between system count and cycle counts.',
        ];

        foreach ($data as $key => $value) {
            SystemSetting::set($key, (string) $value, $descriptions[$key] ?? null);
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data'    => SystemSetting::all()->pluck('value', 'key'),
        ]);
    }

    /**
     * GET /api/settings/{key}
     *
     * Return a single setting by key.
     */
    public function show(string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->firstOrFail();
        return response()->json(['data' => $setting]);
    }
}
