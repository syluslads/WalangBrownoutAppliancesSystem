export const mockKPIs = [
  { label: "Total Products", value: "1,248" },
  { label: "Low Stock Items", value: "14" },
  { label: "Near Expiry Items", value: "8" },
  { label: "Reserved Stocks", value: "320" }
];

export const mockAlerts = [
  "Warning: Portable AC stock is below 30% seasonal demand!",
  "Alert: Batch #1024 Air Purifier Filters will expire in 1 month!",
  "Notice: Smart Thermostat Pro reached reorder point."
];

export const mockRecentTransactions = [
  { date: "08/29 14:10", product: "Inverter Generator", type: "Stock-In", qty: "+50", staff: "Admin" },
  { date: "08/29 13:45", product: "Solar Panel 100W", type: "Stock-Out", qty: "-4", staff: "Sales_01" },
  { date: "08/29 11:20", product: "Deep Cycle Battery", type: "Stock-Out", qty: "-2", staff: "Sales_02" },
  { date: "08/28 16:05", product: "LED Emergency Light", type: "Stock-In", qty: "+100", staff: "Admin" }
];

export const mockProducts = [
  { id: "SKU-1001", name: "Portable Generator 2kW", category: "Generators", currentStock: "45 units", ropType: "Fixed ROP" },
  { id: "SKU-1002", name: "12V 100Ah Lithium Battery", category: "Batteries", currentStock: "12 units", ropType: "Seasonal ROP" },
  { id: "SKU-1003", name: "Solar Inverter 3KW", category: "Inverters", currentStock: "8 units", ropType: "Fixed ROP" },
  { id: "SKU-1004", name: "Smart Automatic Switch", category: "Accessories", currentStock: "115 units", ropType: "Fixed ROP" }
];

export const mockStockOutRecords = [
  { id: "SO-8801", product: "Portable Generator 2kW", qty: 2, batch: "B-2025-09", date: "08/29/2026", status: "Shipped" },
  { id: "SO-8802", product: "Solar Inverter 3KW", qty: 1, batch: "B-2025-11", date: "08/29/2026", status: "Pending" }
];

export const mockAuditTrails = [
  { timestamp: "08/29/26 14:10", product: "Portable Generator 2kW", type: "Stock-In", qtyChange: "+50", staff: "johndoe", remarks: "Supplier Restock" },
  { timestamp: "08/29/26 13:45", product: "Solar Panel 100W", type: "Stock-Out", qtyChange: "-4", staff: "marias", remarks: "Order #9921" }
];