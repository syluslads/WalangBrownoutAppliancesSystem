<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the initial admin account.
     */
    public function run(): void
    {
        // Only create if no admin exists yet
        if (User::where('role', 'admin')->exists()) {
            $this->command->info('Admin user already exists. Skipping.');
            return;
        }

        User::create([
            'name'      => 'Admin User',
            'email'     => 'admin@walangbrownout.local',
            'password'  => Hash::make('admin123'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        $this->command->info('Default admin created: admin@walangbrownout.local / admin123');
    }
}
