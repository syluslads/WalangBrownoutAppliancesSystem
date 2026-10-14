# WalangBrownout Appliances Inventory System

A web-based inventory management system for tracking appliances, managing stock levels, and monitoring transactions.

## Quick Start

### Prerequisites
- XAMPP (MySQL + Apache)
- Node.js 18+
- Composer

### Installation

1. **Database Setup**
   ```bash
   # Start XAMPP MySQL
   # Create database 'walangbrownout' in phpMyAdmin
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

4. **Access System**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - Login: admin@walangbrownout.local / admin123

## Features

- **Dashboard** - Real-time inventory overview with alerts
- **Products** - Manage product catalog with categories
- **Stock-In** - Record incoming stock with batch tracking
- **Stock-Out** - Process dispatches with FIFO allocation
- **Audit Trails** - Complete transaction history
- **Settings** - User management and system configuration

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Laravel 11, PHP 8.2
- **Database:** MySQL
- **Auth:** Laravel Sanctum

## User Roles

- **Admin** - Full system access
- **Warehouse Staff** - Stock operations only
- **Purchasing Manager** - Products + Stock operations

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete guide.

## Project Structure

```
├── backend/          # Laravel API
│   ├── app/         # Controllers, Models
│   ├── database/    # Migrations, Seeders
│   └── routes/      # API routes
├── src/             # React frontend
│   ├── components/  # Reusable components
│   ├── pages/       # Main screens
│   └── lib/         # API client, utilities
└── public/          # Static assets
```

## Development

```bash
# Backend (Terminal 1)
cd backend
php artisan serve

# Frontend (Terminal 2)
npm run dev
```

## License

Academic Project - 2025
