<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ------------------------------------------------------------------ //
    //  Registration
    // ------------------------------------------------------------------ //

    public function test_valid_registration_creates_non_admin_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Test Warehouse',
            'email'                 => 'wh@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'warehouse_staff',
        ]);

        $response->assertCreated()
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'wh@example.test', 'role' => 'warehouse_staff']);
    }

    public function test_registration_allows_purchasing_manager_role(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Test PM',
            'email'                 => 'pm@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'purchasing_manager',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'pm@example.test', 'role' => 'purchasing_manager']);
    }

    public function test_public_registration_cannot_create_admin(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Sneaky Admin',
            'email'                 => 'sneaky@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'admin',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['email' => 'sneaky@example.test']);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'dupe@example.test']);

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Dupe',
            'email'                 => 'dupe@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'warehouse_staff',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Test',
            'email'                 => 'test@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'different',
            'role'                  => 'warehouse_staff',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['password']);
    }

    // ------------------------------------------------------------------ //
    //  Login
    // ------------------------------------------------------------------ //

    public function test_valid_login_returns_token_and_role(): void
    {
        $user = User::factory()->create([
            'password'  => 'password123',
            'role'      => 'warehouse_staff',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
                 ->assertJsonPath('user.role', 'warehouse_staff');
    }

    public function test_login_with_wrong_password_fails(): void
    {
        $user = User::factory()->create(['password' => 'correct-password']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'password'  => 'password123',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['email']);
    }

    // ------------------------------------------------------------------ //
    //  Current user (/me)
    // ------------------------------------------------------------------ //

    public function test_me_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertUnauthorized();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertOk()
                 ->assertJsonPath('user.email', $user->email)
                 ->assertJsonPath('user.role', 'admin');
    }

    // ------------------------------------------------------------------ //
    //  Logout
    // ------------------------------------------------------------------ //

    public function test_logout_returns_success_for_authenticated_user(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->actingAs($user)
             ->postJson('/api/auth/logout')
             ->assertOk()
             ->assertJsonPath('message', 'Logged out successfully.');
    }

    public function test_logout_requires_authentication(): void
    {
        $this->postJson('/api/auth/logout')
             ->assertUnauthorized();
    }

    // ------------------------------------------------------------------ //
    //  Role protection
    // ------------------------------------------------------------------ //

    public function test_unauthorized_role_receives_403(): void
    {
        // warehouse_staff tries to reach the admin-only create-admin endpoint
        $user = User::factory()->create(['role' => 'warehouse_staff', 'is_active' => true]);

        $response = $this->actingAs($user)->postJson('/api/auth/admin', [
            'name'                  => 'New Admin',
            'email'                 => 'newadmin@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_create_another_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($admin)->postJson('/api/auth/admin', [
            'name'                  => 'Second Admin',
            'email'                 => 'admin2@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'admin2@example.test', 'role' => 'admin']);
    }

    public function test_purchasing_manager_cannot_create_admin(): void
    {
        $pm = User::factory()->create(['role' => 'purchasing_manager', 'is_active' => true]);

        $response = $this->actingAs($pm)->postJson('/api/auth/admin', [
            'name'                  => 'Fake Admin',
            'email'                 => 'fakeadmin@example.test',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertForbidden();
    }
}
