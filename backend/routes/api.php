<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SystemSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public authentication routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected routes — require a valid Sanctum token
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // -------------------------------------------------------------------------
    // Auth utilities
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Admin-only: create additional admin accounts
    Route::middleware('role:admin')->group(function () {
        Route::post('/auth/admin', [AuthController::class, 'createAdmin']);
    });

    // -------------------------------------------------------------------------
    // Categories
    // Read: all authenticated users
    // Write: admin and purchasing_manager only (blueprint rule #6)
    // -------------------------------------------------------------------------
    Route::get('/categories',          [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    Route::middleware('role:admin,purchasing_manager')->group(function () {
        Route::post('/categories',              [CategoryController::class, 'store']);
        Route::put('/categories/{category}',    [CategoryController::class, 'update']);
        Route::patch('/categories/{category}',  [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // Suppliers
    // Read: all authenticated users
    // Write: admin and purchasing_manager only
    // -------------------------------------------------------------------------
    Route::get('/suppliers',           [SupplierController::class, 'index']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);

    Route::middleware('role:admin,purchasing_manager')->group(function () {
        Route::post('/suppliers',              [SupplierController::class, 'store']);
        Route::put('/suppliers/{supplier}',    [SupplierController::class, 'update']);
        Route::patch('/suppliers/{supplier}',  [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // Products
    // Read: all authenticated users
    // Write: admin and purchasing_manager only (blueprint rule #6)
    // -------------------------------------------------------------------------
    Route::get('/products',          [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);

    Route::middleware('role:admin,purchasing_manager')->group(function () {
        Route::post('/products',              [ProductController::class, 'store']);
        Route::put('/products/{product}',     [ProductController::class, 'update']);
        Route::patch('/products/{product}',   [ProductController::class, 'update']);
        Route::delete('/products/{product}',  [ProductController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // Inventory — Stock-In
    // Perform: admin and warehouse_staff (blueprint rule #7)
    // History: all authenticated users can view batch history
    // -------------------------------------------------------------------------
    Route::get('/inventory/stock-in/{product}', [StockInController::class, 'history']);

    Route::middleware('role:admin,warehouse_staff')->group(function () {
        Route::post('/inventory/stock-in', [StockInController::class, 'store']);
    });

    // -------------------------------------------------------------------------
    // Inventory — Stock-Out (Developer 3)
    // Perform: admin and warehouse_staff (blueprint rule #7)
    // History: all authenticated users can view stock-out records
    // -------------------------------------------------------------------------
    Route::get('/inventory/stock-out',          [StockOutController::class, 'index']);
    Route::get('/inventory/stock-out/{stockOutRecord}', [StockOutController::class, 'show']);

    Route::middleware('role:admin,warehouse_staff')->group(function () {
        Route::post('/inventory/stock-out', [StockOutController::class, 'store']);
    });

    // -------------------------------------------------------------------------
    // Dashboard — KPIs, alerts, and recent transactions (Developer 3)
    // All authenticated roles can view the dashboard.
    // -------------------------------------------------------------------------
    Route::get('/dashboard',        [DashboardController::class, 'index']);
    Route::get('/dashboard/kpis',   [DashboardController::class, 'kpisEndpoint']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alertsEndpoint']);

    // -------------------------------------------------------------------------
    // Audit Trail (Developer 3)
    // All authenticated roles can view the audit trail.
    // -------------------------------------------------------------------------
    Route::get('/audit', [AuditController::class, 'index']);

    // -------------------------------------------------------------------------
    // System Settings (Developer 3)
    // Read: all authenticated users (for thresholds used in alerts).
    // Write: admin only (blueprint rule #8).
    // -------------------------------------------------------------------------
    Route::get('/settings',      [SystemSettingController::class, 'index']);
    Route::get('/settings/{key}', [SystemSettingController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::put('/settings', [SystemSettingController::class, 'update']);
    });

});
