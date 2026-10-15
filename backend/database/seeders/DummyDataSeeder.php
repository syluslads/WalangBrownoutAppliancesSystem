<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------------------------------
        // Suppliers (updateOrCreate on email as unique key)
        // -------------------------------------------------------
        $suppliers = [
            ['name' => 'CoolBreeze Appliances Corp',  'email' => 'coolbreeze@supplier.ph', 'phone' => '02-8123-4567', 'address' => '123 Quezon Ave, Quezon City',   'lead_time_days' => 7],
            ['name' => 'FiltroTech Philippines Inc',   'email' => 'filtrotech@supplier.ph', 'phone' => '02-8234-5678', 'address' => '45 EDSA, Mandaluyong City',      'lead_time_days' => 5],
            ['name' => 'SolarPower Solutions PH',     'email' => 'solar@supplier.ph',      'phone' => '02-8345-6789', 'address' => '78 Ayala Ave, Makati City',      'lead_time_days' => 14],
            ['name' => 'HomeTech Distributors',       'email' => 'hometech@supplier.ph',   'phone' => '02-8456-7890', 'address' => '12 Shaw Blvd, Pasig City',       'lead_time_days' => 3],
            ['name' => 'ElectroSupply Manila',        'email' => 'electro@supplier.ph',    'phone' => '02-8567-8901', 'address' => '56 Taft Ave, Manila',            'lead_time_days' => 2],
        ];

        $supplierMap = [];
        foreach ($suppliers as $s) {
            $rec = Supplier::updateOrCreate(['email' => $s['email']], $s);
            $supplierMap[$s['name']] = $rec->id;
        }

        // -------------------------------------------------------
        // Categories (updateOrCreate on name as unique key)
        // -------------------------------------------------------
        $categoryNames = [
            'Air Conditioners',
            'Air Purifiers',
            'Air Purifier Filters',
            'Solar Panels',
            'Home Appliances',
            'Electrical Accessories',
            'Spare Parts',
        ];

        $categoryMap = [];
        foreach ($categoryNames as $name) {
            $rec = Category::updateOrCreate(['name' => $name], ['name' => $name]);
            $categoryMap[$name] = $rec->id;
        }

        // -------------------------------------------------------
        // Admin user for transaction user_id
        // -------------------------------------------------------
        $admin   = User::where('role', 'admin')->first();
        $adminId = $admin?->id ?? 1;

        // -------------------------------------------------------
        // Products (updateOrCreate on sku as unique key)
        // Batch: batch_number='INITIAL-STOCK-2026', location='Zone A - Rack 01 (Fast-Moving)'
        // -------------------------------------------------------
        $products = [
            [
                'sku' => 'SKU-AC-1001', 'name' => 'Portable AC Unit 1.0HP',
                'category' => 'Air Conditioners', 'supplier' => 'CoolBreeze Appliances Corp',
                'unit_price' => 18500, 'reorder_point' => 5, 'max_stock_level' => 100, 'safety_stock' => 2,
                'is_seasonal' => true, 'abc_class' => 'A', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-AC-1002', 'name' => 'Window-Type AC 1.5HP',
                'category' => 'Air Conditioners', 'supplier' => 'CoolBreeze Appliances Corp',
                'unit_price' => 24000, 'reorder_point' => 3, 'safety_stock' => 1,
                'abc_class' => 'A', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-AP-2001', 'name' => 'HEPA Air Purifier 360',
                'category' => 'Air Purifiers', 'supplier' => 'FiltroTech Philippines Inc',
                'unit_price' => 8500, 'reorder_point' => 8, 'safety_stock' => 3,
                'abc_class' => 'B', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-FL-3001', 'name' => 'HEPA Replacement Filter 3-pack',
                'category' => 'Air Purifier Filters', 'supplier' => 'FiltroTech Philippines Inc',
                'unit_price' => 1200, 'reorder_point' => 20, 'safety_stock' => 10,
                'abc_class' => 'C', 'is_perishable' => true, 'qty' => 30, 'expiry' => '+6 months',
            ],
            [
                'sku' => 'SKU-FL-3002', 'name' => 'Carbon Pre-Filter Set',
                'category' => 'Air Purifier Filters', 'supplier' => 'FiltroTech Philippines Inc',
                'unit_price' => 850, 'reorder_point' => 15, 'safety_stock' => 8,
                'abc_class' => 'C', 'is_perishable' => true, 'qty' => 30, 'expiry' => '+6 months',
            ],
            [
                'sku' => 'SKU-SOL-4001', 'name' => '300W Monocrystalline Solar Panel',
                'category' => 'Solar Panels', 'supplier' => 'SolarPower Solutions PH',
                'unit_price' => 12000, 'reorder_point' => 4, 'safety_stock' => 2,
                'abc_class' => 'A', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-SOL-4002', 'name' => '1000W Solar Inverter',
                'category' => 'Solar Panels', 'supplier' => 'SolarPower Solutions PH',
                'unit_price' => 9500, 'reorder_point' => 3, 'safety_stock' => 1,
                'abc_class' => 'B', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-HA-5001', 'name' => 'Rice Cooker 1.8L',
                'category' => 'Home Appliances', 'supplier' => 'HomeTech Distributors',
                'unit_price' => 1850, 'reorder_point' => 10, 'safety_stock' => 5,
                'abc_class' => 'C', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-EA-6001', 'name' => 'Extension Cord 4-Gang 3m',
                'category' => 'Electrical Accessories', 'supplier' => 'ElectroSupply Manila',
                'unit_price' => 350, 'reorder_point' => 30, 'safety_stock' => 15,
                'abc_class' => 'C', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
            [
                'sku' => 'SKU-SP-7001', 'name' => 'AC Remote Control Universal',
                'category' => 'Spare Parts', 'supplier' => 'CoolBreeze Appliances Corp',
                'unit_price' => 450, 'reorder_point' => 20, 'safety_stock' => 10,
                'abc_class' => 'C', 'is_perishable' => false, 'qty' => 50, 'expiry' => null,
            ],
        ];

        foreach ($products as $p) {
            $product = Product::updateOrCreate(
                ['sku' => $p['sku']],
                [
                    'name'           => $p['name'],
                    'category_id'    => $categoryMap[$p['category']],
                    'supplier_id'    => $supplierMap[$p['supplier']],
                    'unit'           => 'unit',
                    'unit_price'     => $p['unit_price'],
                    'reorder_point'  => $p['reorder_point'],
                    'max_stock_level'=> $p['max_stock_level'] ?? ($p['reorder_point'] * 10),
                    'safety_stock'   => $p['safety_stock'],
                    'abc_class'      => $p['abc_class'],
                    'is_perishable'  => $p['is_perishable'],
                    'is_seasonal'    => $p['is_seasonal'] ?? false,
                    'is_active'      => true,
                ]
            );

            // Only create initial batch if no batches exist yet
            if ($product->batches()->count() === 0) {
                $expiryDate = $p['expiry']
                    ? Carbon::now()->modify($p['expiry'])->toDateString()
                    : null;

                $batch = InventoryBatch::create([
                    'product_id'         => $product->id,
                    'quantity_received'  => $p['qty'],
                    'quantity_available' => $p['qty'],
                    'received_date'      => now()->toDateString(),
                    'expiration_date'    => $expiryDate,
                    'batch_number'       => 'INITIAL-STOCK-2026',
                    'location'           => 'Zone A - Rack 01 (Fast-Moving)',
                    'unit_cost'          => $p['unit_price'],
                ]);

                InventoryTransaction::create([
                    'product_id'         => $product->id,
                    'inventory_batch_id' => $batch->id,
                    'user_id'            => $adminId,
                    'type'               => InventoryTransaction::TYPE_IN,
                    'quantity_change'    => $p['qty'],
                    'notes'              => 'Initial stock seeding',
                ]);
            }
        }

        $this->command->info('DummyDataSeeder: 5 suppliers, 7 categories, 10 products seeded.');
    }
}
