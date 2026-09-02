// Mock / static data only — no backend, no API calls.
// Product mix, categories, and thresholds are based directly on the
// WalangBrownout Appliances case study (portable AC units, air purifiers,
// replacement filters, smart thermostats).

export const roles = [
  {
    id: "admin",
    label: "Admin",
    desc: "Manages users, suppliers, categories, and system settings.",
    icon: "shield",
  },
  {
    id: "warehouse",
    label: "Warehouse Staff",
    desc: "Handles day-to-day Stock-In / Stock-Out and scanning.",
    icon: "box",
  },
  {
    id: "purchasing",
    label: "Purchasing Manager",
    desc: "Reviews reorder points and approves replenishment.",
    icon: "cart",
  },
];

export const mockKPIs = [
  { label: "Total Products", value: "1,248", icon: "box", tone: "blue" },
  { label: "Low Stock Items", value: "14", icon: "trend-down", tone: "amber" },
  { label: "Near Expiry Items", value: "8", icon: "clock", tone: "red" },
  { label: "Reserved Stocks", value: "320", icon: "lock", tone: "violet" },
];

export const mockAlerts = [
  {
    type: "Seasonal ROP",
    severity: "high",
    message: "Portable AC Units stock is below 30% of forecasted seasonal demand.",
  },
  {
    type: "Expiry (FIFO)",
    severity: "high",
    message: "Batch #B-1024 Air Purifier Filters has been in storage for 8 months — prioritize for picking.",
  },
  {
    type: "Reorder Point",
    severity: "medium",
    message: "Smart Thermostat Pro reached its calculated Reorder Point (ROP).",
  },
  {
    type: "Discrepancy",
    severity: "high",
    message: "Smart Thermostat Pro: system shows 45 units but last cycle count found only 12.",
  },
];

export const mockRecentTransactions = [
  { date: "08/29 14:10", product: "Portable AC Unit 1.0HP", type: "Stock-In", qty: "+50", staff: "Admin" },
  { date: "08/29 13:45", product: "Air Purifier Filter (Carbon)", type: "Stock-Out", qty: "-4", staff: "Warehouse_01" },
  { date: "08/29 11:20", product: "Smart Thermostat Pro", type: "Adjustment", qty: "-33", staff: "Admin" },
  { date: "08/28 16:05", product: "Air Purifier Compact", type: "Stock-In", qty: "+100", staff: "Warehouse_02" },
];

// A / B / C classification, seasonal vs non-seasonal, perishable/FIFO —
// straight from Section 3.1 "Additional Solutions" of the case study.
export const mockCategoryBreakdown = [
  { label: "A Items — High value, high sales (ABC)", example: "Portable AC Units", pct: 20, color: "#2563eb" },
  { label: "B Items — Moderate value & demand", example: "Smart Thermostats", pct: 35, color: "#7c3aed" },
  { label: "C Items — Low value, slow-moving", example: "Accessories, cables", pct: 45, color: "#94a3b8" },
];

export const mockProducts = [
  {
    id: "SKU-1001",
    name: "Portable AC Unit 1.0HP",
    category: "Portable AC Units",
    abcClass: "A",
    classification: "Seasonal",
    currentStock: 128,
    reorderPoint: 150,
    safetyStock: 40,
    isPerishable: false,
    ropType: "Seasonal Trigger (30%)",
  },
  {
    id: "SKU-1002",
    name: "Portable AC Unit 1.5HP",
    category: "Portable AC Units",
    abcClass: "A",
    classification: "Seasonal",
    currentStock: 64,
    reorderPoint: 120,
    safetyStock: 30,
    isPerishable: false,
    ropType: "Seasonal Trigger (30%)",
  },
  {
    id: "SKU-2001",
    name: "Smart Thermostat Pro",
    category: "Smart Thermostats",
    abcClass: "B",
    classification: "Fast-Moving",
    currentStock: 12,
    reorderPoint: 20,
    safetyStock: 8,
    isPerishable: false,
    ropType: "Formula ROP",
  },
  {
    id: "SKU-2002",
    name: "Smart Thermostat Lite",
    category: "Smart Thermostats",
    abcClass: "B",
    classification: "Fast-Moving",
    currentStock: 54,
    reorderPoint: 35,
    safetyStock: 12,
    isPerishable: false,
    ropType: "Formula ROP",
  },
  {
    id: "SKU-3001",
    name: "Air Purifier Compact",
    category: "Air Purifiers",
    abcClass: "B",
    classification: "Non-Seasonal",
    currentStock: 88,
    reorderPoint: 60,
    safetyStock: 20,
    isPerishable: false,
    ropType: "Formula ROP",
  },
  {
    id: "SKU-4001",
    name: "Air Purifier Filter (Carbon)",
    category: "Replacement Filters",
    abcClass: "C",
    classification: "Perishable · FIFO",
    currentStock: 210,
    reorderPoint: 80,
    safetyStock: 25,
    isPerishable: true,
    ropType: "FIFO + Formula ROP",
  },
  {
    id: "SKU-9001",
    name: "Universal Remote Accessory",
    category: "Accessories",
    abcClass: "C",
    classification: "Slow-Moving",
    currentStock: 340,
    reorderPoint: 50,
    safetyStock: 15,
    isPerishable: false,
    ropType: "Manual Review",
  },
];

export const mockStockOutRecords = [
  { id: "SO-8801", product: "Portable AC Unit 1.0HP", qty: 2, batch: "B-2025-09", date: "08/29/2026", status: "Shipped" },
  { id: "SO-8802", product: "Air Purifier Filter (Carbon)", qty: 6, batch: "B-1024", date: "08/29/2026", status: "Pending" },
];

export const mockAuditTrails = [
  { timestamp: "08/29/26 14:10", product: "Portable AC Unit 1.0HP", type: "IN", qtyChange: "+50", staff: "johndoe", remarks: "Supplier Restock" },
  { timestamp: "08/29/26 13:45", product: "Air Purifier Filter (Carbon)", type: "OUT", qtyChange: "-4", staff: "marias", remarks: "Order #9921" },
  { timestamp: "08/29/26 11:20", product: "Smart Thermostat Pro", type: "ADJUSTMENT", qtyChange: "-33", staff: "admin", remarks: "Cycle count discrepancy — mystery shrinkage" },
  { timestamp: "08/28/26 16:05", product: "Air Purifier Compact", type: "IN", qtyChange: "+100", staff: "carlosr", remarks: "Supplier Restock" },
];

// Section 5.2 "Suppliers Table"
export const mockSuppliers = [
  { id: 1, name: "ColdBreeze Industries", contact: "Marife Santos", phone: "0917-123-4567", email: "sales@coldbreeze.ph" },
  { id: 2, name: "PureAir Manufacturing", contact: "Renz Villanueva", phone: "0918-555-2231", email: "orders@pureair.ph" },
  { id: 3, name: "NimbusTech Thermostats", contact: "Joy Fernandez", phone: "0920-777-8899", email: "partners@nimbustech.io" },
];

// Section 5.2 "Categories Table"
export const mockCategories = [
  { id: 1, name: "Portable AC Units", type: "Seasonal", description: "Demand peaks Mar–Jun; forecast before summer." },
  { id: 2, name: "Air Purifiers", type: "Non-Seasonal", description: "Stable year-round demand." },
  { id: 3, name: "Replacement Filters", type: "Perishable / FIFO", description: "9-month carbon lining shelf life." },
  { id: 4, name: "Smart Thermostats", type: "Fast-Moving", description: "High turnover, maintain safety stock." },
];

// Section 5.2 "Users Table"
export const mockUsers = [
  { id: 1, name: "Alessandra Llenasas", username: "a.llenasas", role: "Admin", email: "a.llenasas@walangbrownout.ph" },
  { id: 2, name: "Christopher Logan", username: "c.logan", role: "Warehouse", email: "c.logan@walangbrownout.ph" },
  { id: 3, name: "John Andrei Logmao", username: "j.logmao", role: "Purchasing", email: "j.logmao@walangbrownout.ph" },
  { id: 4, name: "Prince Clarence Lopez", username: "p.lopez", role: "Warehouse", email: "p.lopez@walangbrownout.ph" },
];
