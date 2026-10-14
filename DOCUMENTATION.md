# WalangBrownout Appliances Inventory System
## Documentation

### About This Project
This is an inventory management system for WalangBrownout Appliances. It helps track products, manage stock levels, and monitor inventory transactions in real-time.

---

## Getting Started

### What You Need
- XAMPP (for MySQL database)
- Node.js (for frontend)
- PHP 8.2+ (comes with XAMPP)
- Composer (PHP package manager)

### Installation Steps

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

2. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database called `walangbrownout`

3. **Setup Backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

4. **Setup Frontend**
   ```bash
   npm install
   npm run dev
   ```

5. **Access the System**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

---

## Default Login Credentials

**Admin Account:**
- Email: `admin@walangbrownout.local`
- Password: `admin123`

**Note:** Change this password after first login!

---

## System Features

### 1. Dashboard
- Real-time clock and date display
- Current inventory statistics
- Low stock alerts
- Recent transactions

### 2. Products Management
- Add, edit, and delete products
- Track product details (SKU, name, category, supplier)
- Set reorder points and safety stock levels
- Mark products as perishable

### 3. Stock-In Operations
- Record new stock arrivals
- Track batch numbers and expiration dates
- Record warehouse locations
- Automatic stock level updates

### 4. Stock-Out Operations
- Process stock requests
- FIFO (First In, First Out) allocation
- Track dispatch reasons
- Update available stock automatically

### 5. Audit Trails
- View all inventory transactions
- Filter by product, user, type, or date
- Track who made changes and when
- Export transaction history

### 6. Settings
- Manage user accounts and roles
- Configure categories and suppliers
- Set alert thresholds
- Change system appearance (light/dark mode)

---

## User Roles

### Admin
- Full system access
- Manage users, categories, and suppliers
- Configure system settings
- View all reports and audit trails

### Warehouse Staff
- Record stock-in and stock-out transactions
- View product information
- Check inventory levels

### Purchasing Manager
- All warehouse staff permissions
- Manage products, categories, and suppliers
- Review reorder points and alerts

---

## How to Use

### Adding a New Product
1. Go to Products page
2. Click "Add Product" button
3. Fill in product details:
   - Name and SKU
   - Select category and supplier
   - Set prices and stock levels
4. Click "Save"

### Recording Stock-In
1. Go to Stock-In page
2. Select or scan product
3. Enter quantity received
4. Fill in batch details (number, location, dates)
5. Submit the form

### Recording Stock-Out
1. Go to Stock-Out page
2. Select product
3. Enter quantity to dispatch
4. Select reason (sale, transfer, damage, etc.)
5. System automatically uses FIFO to allocate stock

### Managing Users
1. Go to Settings > Users & Roles
2. Click "Add User" to create new accounts
3. Assign appropriate role
4. Users cannot edit their own role or delete themselves

---

## Database Structure

### Main Tables
- `users` - System user accounts
- `products` - Product catalog
- `categories` - Product categories
- `suppliers` - Supplier information
- `inventory_batches` - Stock batches with FIFO tracking
- `inventory_transactions` - All stock movements
- `stock_out_records` - Stock dispatch records
- `stock_out_allocations` - FIFO allocation details

---

## Troubleshooting

### Problem: Can't login
**Solution:** 
- Check if database is running in XAMPP
- Verify email and password are correct
- Make sure you ran `php artisan db:seed`

### Problem: "Connection refused" error
**Solution:**
- Make sure backend server is running (`php artisan serve`)
- Check if MySQL is running in XAMPP
- Verify .env database credentials

### Problem: Changes not saving
**Solution:**
- Check browser console for errors (F12)
- Verify you have permission for that action
- Make sure API server is running

### Problem: Foreign key constraint error
**Solution:**
- This happens when trying to delete items that are still being used
- Example: Can't delete a product that has stock batches
- Delete dependent records first, or deactivate instead

---

## System Testing Done

We tested the following to make sure everything works:

### Security Tests
✅ Users can only access pages they have permission for
✅ Passwords are encrypted and never shown
✅ Cannot delete your own account
✅ Cannot change your own role
✅ Login required for all pages

### Functionality Tests
✅ All CRUD operations work (Create, Read, Update, Delete)
✅ Stock calculations are accurate
✅ FIFO allocation works correctly
✅ Audit trails record all transactions
✅ Notifications update in real-time
✅ Search and filters work properly

### Data Integrity Tests
✅ Can't delete products that have inventory
✅ Can't delete users who created transactions
✅ Foreign key constraints prevent data corruption
✅ Dates validate properly (expiry after received date)
✅ Negative quantities are rejected

---

## Known Issues

### Minor Issues
1. **Default Password**: Admin password is simple (`admin123`) - change it immediately
2. **Migration Timestamps**: Two migrations have the same timestamp - doesn't affect functionality

---

## Future Improvements

Ideas for future versions:
- Email notifications for low stock
- PDF report generation
- Barcode scanning integration
- Mobile app version
- Advanced analytics dashboard
- Multi-warehouse support

---

## Development Notes

### Technology Stack
- **Frontend:** React 19, Vite, React Router
- **Backend:** Laravel 11, PHP 8.2
- **Database:** MySQL
- **Authentication:** Laravel Sanctum (token-based)

### Code Organization
- Controllers: Handle API requests
- Models: Represent database tables
- Migrations: Database structure
- Components: Reusable UI pieces
- Pages: Main application screens

### Design Decisions

**Why MySQL instead of SQLite?**
- Better for multi-user access
- Easier to manage with XAMPP
- Industry-standard for web applications

**Why token-based authentication?**
- Stateless (no server sessions)
- Works well with React frontend
- Easy to implement and secure

**Why FIFO for stock allocation?**
- Prevents expiration of old stock
- Industry best practice
- Automatic allocation reduces errors

---

## Credits

**Developed by:** [Your Name/Team Name]
**Project Type:** Inventory Management System
**Purpose:** Academic Project / Business Application
**Year:** 2025

---

## Support

For issues or questions:
1. Check this documentation first
2. Review error messages in browser console
3. Check Laravel logs in `backend/storage/logs/`
4. Verify all services are running (XAMPP, backend, frontend)

---

**Last Updated:** January 22, 2025
