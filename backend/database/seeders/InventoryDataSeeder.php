<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class InventoryDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = [
            ['name' => 'Portable AC Units', 'description' => 'Seasonal peak cooling units (demand surges March to June).'],
            ['name' => 'Air Purifiers', 'description' => 'High-efficiency indoor air purification systems.'],
            ['name' => 'Replacement Filters', 'description' => 'Perishable activated carbon and HEPA filter units subject to FIFO tracking.'],
            ['name' => 'Smart Thermostats', 'description' => 'High-turnover IoT climate and energy control appliances.'],
            ['name' => 'Solar & Backup Power Solutions', 'description' => 'Off-grid inverters, batteries, and emergency brownout appliances.'],
            ['name' => 'Kitchen & Domestic Appliances', 'description' => 'Energy-efficient cooking and household electrics.'],
        ];

        $categoryMap = [];
        foreach ($categories as $cat) {
            $created = Category::firstOrCreate(['name' => $cat['name']], $cat);
            $categoryMap[$cat['name']] = $created->id;
        }

        // 2. Suppliers
        $suppliers = [
            [
                'name'           => 'ColdBreeze Industries',
                'contact_person' => 'Marife Santos',
                'email'          => 'sales@coldbreeze.ph',
                'phone'          => '0917-123-4567',
                'address'        => 'Calamba Laguna Industrial Park',
                'lead_time_days' => 7,
            ],
            [
                'name'           => 'PureAir Manufacturing',
                'contact_person' => 'Renz Villanueva',
                'email'          => 'orders@pureair.ph',
                'phone'          => '0918-555-2231',
                'address'        => 'Mandaue City, Cebu',
                'lead_time_days' => 10,
            ],
            [
                'name'           => 'NimbusTech Thermostats',
                'contact_person' => 'Joy Fernandez',
                'email'          => 'partners@nimbustech.io',
                'phone'          => '0920-777-8899',
                'address'        => 'BGC Taguig City',
                'lead_time_days' => 5,
            ],
            [
                'name'           => 'Carrier Concepcion Industrial',
                'contact_person' => 'Eduardo Concepcion',
                'email'          => 'supply@carrier-ph.com',
                'phone'          => '0917-888-9900',
                'address'        => 'Muntinlupa City, Metro Manila',
                'lead_time_days' => 14,
            ],
            [
                'name'           => 'EcoFlow Solar & Energy PH',
                'contact_person' => 'Angela Cruz',
                'email'          => 'b2b@ecoflow.ph',
                'phone'          => '0919-444-1234',
                'address'        => 'Ortigas Center, Pasig City',
                'lead_time_days' => 6,
            ],
        ];

        $supplierMap = [];
        foreach ($suppliers as $sup) {
            $created = Supplier::firstOrCreate(['name' => $sup['name']], $sup);
            $supplierMap[$sup['name']] = $created->id;
        }

        // 3. Products
        $products = [
            [
                'sku'           => 'SKU-AC-1001',
                'name'          => 'Portable AC Unit 1.0HP SilentCool',
                'description'   => 'High-efficiency inverter portable AC unit with eco-mode.',
                'category_id'   => $categoryMap['Portable AC Units'],
                'supplier_id'   => $supplierMap['ColdBreeze Industries'],
                'unit'          => 'unit',
                'unit_price'    => 18500.00,
                'is_perishable' => false,
                'abc_class'     => 'A',
                'reorder_point' => 150,
                'safety_stock'  => 40,
                'is_active'     => true,
            ],
            [
                'sku'           => 'SKU-AC-1002',
                'name'          => 'Portable AC Unit 1.5HP TurboBreeze',
                'description'   => 'Heavy-duty cooling unit for large rooms with digital timer.',
                'category_id'   => $categoryMap['Portable AC Units'],
                'supplier_id'   => $supplierMap['Carrier Concepcion Industrial'],
                'unit'          => 'unit',
                'unit_price'    => 24900.00,
                'is_perishable' => false,
                'abc_class'     => 'A',
                'reorder_point' => 120,
                'safety_stock'  => 30,
                'is_active'     => true,
            ],
            [
                'sku'           => 'SKU-TH-2001',
                'name'          => 'Smart Thermostat Pro WiFi',
                'description'   => 'Remote app control, programmable weekly schedule, voice assistant ready.',
                'category_id'   => $categoryMap['Smart Thermostats'],
                'supplier_id'   => $supplierMap['NimbusTech Thermostats'],
                'unit'          => 'unit',
                'unit_price'    => 4800.00,
                'is_perishable' => false,
                'abc_class'     => 'B',
                'reorder_point' => 25,
                'safety_stock'  => 10,
                'is_active'     => true,
            ],
            [
                'sku'           => 'SKU-AP-3001',
                'name'          => 'Air Purifier Compact HEPA-13',
                'description'   => '3-stage filtration with silent sleep mode and air quality sensor.',
                'category_id'   => $categoryMap['Air Purifiers'],
                'supplier_id'   => $supplierMap['PureAir Manufacturing'],
                'unit'          => 'unit',
                'unit_price'    => 6990.00,
                'is_perishable' => false,
                'abc_class'     => 'B',
                'reorder_point' => 60,
                'safety_stock'  => 20,
                'is_active'     => true,
            ],
            [
                'sku'           => 'SKU-FL-4001',
                'name'          => 'Activated Carbon Replacement Filter',
                'description'   => 'Perishable carbon lining (9-month shelf life limit). Requires FIFO dispatch.',
                'category_id'   => $categoryMap['Replacement Filters'],
                'supplier_id'   => $supplierMap['PureAir Manufacturing'],
                'unit'          => 'box (2 pcs)',
                'unit_price'    => 1250.00,
                'is_perishable' => true,
                'abc_class'     => 'C',
                'reorder_point' => 80,
                'safety_stock'  => 25,
                'is_active'     => true,
            ],
            [
                'sku'           => 'SKU-SOL-5001',
                'name'          => 'Solar Power Station 1000W Inverter',
                'description'   => 'Zero-noise lithium battery backup power station for blackouts.',
                'category_id'   => $categoryMap['Solar & Backup Power Solutions'],
                'supplier_id'   => $supplierMap['EcoFlow Solar & Energy PH'],
                'unit'          => 'unit',
                'unit_price'    => 38900.00,
                'is_perishable' => false,
                'abc_class'     => 'A',
                'reorder_point' => 30,
                'safety_stock'  => 8,
                'is_active'     => true,
            ],
        ];

        foreach ($products as $prod) {
            Product::firstOrCreate(['sku' => $prod['sku']], $prod);
        }

        // 4. Initial Batches and Transactions
        $adminUser = \App\Models\User::first();
        $adminUserId = $adminUser ? $adminUser->id : 1;

        $batchSeeds = [
            [
                'sku'            => 'SKU-AC-1001',
                'batch_number'   => 'BATCH-2026-AC1',
                'quantity'       => 128,
                'received_date'  => now()->subMonths(2)->toDateString(),
                'expiration_date'=> null,
                'location'       => 'Zone A - Rack 01 (Fast-Moving)',
                'unit_cost'      => 14500.00,
            ],
            [
                'sku'            => 'SKU-AC-1002',
                'batch_number'   => 'BATCH-2026-AC2',
                'quantity'       => 64,
                'received_date'  => now()->subMonths(1)->toDateString(),
                'expiration_date'=> null,
                'location'       => 'Zone C - Floor Pallet 01',
                'unit_cost'      => 19800.00,
            ],
            [
                'sku'            => 'SKU-TH-2001',
                'batch_number'   => 'BATCH-2026-TH1',
                'quantity'       => 12,
                'received_date'  => now()->subWeeks(3)->toDateString(),
                'expiration_date'=> null,
                'location'       => 'Zone B - Shelf 01',
                'unit_cost'      => 3200.00,
            ],
            [
                'sku'            => 'SKU-AP-3001',
                'batch_number'   => 'BATCH-2026-AP1',
                'quantity'       => 88,
                'received_date'  => now()->subMonths(1)->toDateString(),
                'expiration_date'=> null,
                'location'       => 'Zone A - Rack 02',
                'unit_cost'      => 4500.00,
            ],
            [
                'sku'            => 'SKU-FL-4001',
                'batch_number'   => 'BATCH-FL-2025-08',
                'quantity'       => 210,
                'received_date'  => now()->subMonths(8)->toDateString(),
                'expiration_date'=> now()->addDays(24)->toDateString(),
                'location'       => 'Zone B - Shelf 02 (Climate-Controlled)',
                'unit_cost'      => 750.00,
            ],
            [
                'sku'            => 'SKU-SOL-5001',
                'batch_number'   => 'BATCH-2026-SOL1',
                'quantity'       => 40,
                'received_date'  => now()->subWeeks(2)->toDateString(),
                'expiration_date'=> null,
                'location'       => 'Zone C - Rack 04',
                'unit_cost'      => 29500.00,
            ],
        ];

        foreach ($batchSeeds as $b) {
            $product = Product::where('sku', $b['sku'])->first();
            if ($product && $product->batches()->count() === 0) {
                $batch = $product->batches()->create([
                    'batch_number'       => $b['batch_number'],
                    'quantity_received'  => $b['quantity'],
                    'quantity_available' => $b['quantity'],
                    'received_date'      => $b['received_date'],
                    'expiration_date'    => $b['expiration_date'],
                    'location'           => $b['location'],
                    'unit_cost'          => $b['unit_cost'],
                ]);

                \App\Models\InventoryTransaction::create([
                    'product_id'          => $product->id,
                    'inventory_batch_id'  => $batch->id,
                    'user_id'             => $adminUserId,
                    'type'                => 'IN',
                    'quantity_change'     => $b['quantity'],
                    'notes'               => "Initial inventory receiving for {$b['batch_number']}",
                    'created_at'          => $b['received_date'] . ' 10:00:00',
                ]);
            }
        }
    }
}
