<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Creates the first Admin account and default system settings for local
     * development/testing. Change the admin password after seeding.
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // First Admin account
        // -----------------------------------------------------------------
        $this->call(AdminSeeder::class);
        $this->call(DummyDataSeeder::class);

        // -----------------------------------------------------------------
        // Default system settings (blueprint Section 12)
        // These can be updated via PUT /api/settings (admin only).
        // -----------------------------------------------------------------
        $defaults = [
            [
                'key'         => 'seasonal_threshold_pct',
                'value'       => '30',
                'description' => 'Reorder trigger when seasonal stock falls below this % of forecasted demand.',
            ],
            [
                'key'         => 'expiry_warning_months',
                'value'       => '8',
                'description' => 'Alert threshold: months in storage before expiry warning fires.',
            ],
            [
                'key'         => 'expiry_hard_limit_months',
                'value'       => '9',
                'description' => 'Hard expiration shelf-life limit in months for perishable items.',
            ],
            [
                'key'         => 'low_stock_notifications',
                'value'       => 'true',
                'description' => 'Whether to alert when any item reaches its reorder point.',
            ],
            [
                'key'         => 'discrepancy_alerts',
                'value'       => 'true',
                'description' => 'Whether to flag mismatches between system count and cycle counts.',
            ],
        ];

        foreach ($defaults as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'description' => $setting['description']]
            );
        }
    }
}
