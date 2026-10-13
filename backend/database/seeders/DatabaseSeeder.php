<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Creates the first Admin account for local development/testing.
     * Change this password after seeding and never commit real credentials.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name'      => 'System Admin',
                'password'  => 'ChangeThisPassword123!',
                'role'      => 'admin',
                'is_active' => true,
            ]
        );
    }
}
