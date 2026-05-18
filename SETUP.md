# Complete Setup Instructions

## Overview
This is a full-stack queue management system with three components:
1. **Frontend**: React.js (runs on port 3000)
2. **Backend**: Laravel PHP (runs on port 8000)
3. **Database**: MySQL

## Step-by-Step Installation

### Step 1: Install Backend Dependencies

```bash
cd backend
composer install
```

If you don't have Composer installed, download from: https://getcomposer.org

### Step 2: Configure Backend Environment

```bash
# Copy environment file
copy .env.example .env

# On Mac/Linux:
# cp .env.example .env
```

Edit `.env` file and update:
```
APP_KEY=base64:... (will be generated next)
DB_DATABASE=dmw_processing
DB_USERNAME=root
DB_PASSWORD=(your mysql password)
JWT_SECRET=(will be generated)
```

### Step 3: Generate Laravel Keys

```bash
cd backend

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

### Step 4: Create Database

Open MySQL and run:
```sql
CREATE DATABASE dmw_processing;
```

### Step 5: Run Database Migrations

```bash
# From backend folder
php artisan migrate:fresh --seed
```

This will create tables and populate demo data.

### Step 6: Start Backend Server

```bash
php artisan serve
```

Server will run on: http://localhost:8000

### Step 7: Install Frontend Dependencies

In a new terminal/command prompt:

```bash
cd frontend
npm install
```

### Step 8: Start Frontend Development Server

```bash
npm run dev
```

Server will run on: http://localhost:3000

## Accessing the Application

### Landing Page (Public)
- **URL**: http://localhost:3000/landing
- Shows real-time queue display
- Display on public TVs in waiting area

### Login Page
- **URL**: http://localhost:3000/login

### Dashboard (After Login)
- **URL**: http://localhost:3000/dashboard

## Demo Credentials

**SuperAdmin:**
- Email: admin@dmw.com
- Password: password

**Counter Operators:**
- counter1@dmw.com / password
- counter2@dmw.com / password
- counter3@dmw.com / password
- counter4@dmw.com / password
- counter5@dmw.com / password

## Testing the Queue System

1. Go to landing page (http://localhost:3000/landing)
   - Should see empty queue initially

2. Login as admin (admin@dmw.com)
   - Dashboard shows all counters

3. Add ticket via API (using Postman or curl):
   ```bash
   curl -X POST http://localhost:8000/api/queue/tickets \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"priority_number":"0001"}'
   ```

4. Login as counter1 (counter1@dmw.com)
   - Can call next ticket and complete service

5. Watch landing page update in real-time

## Project Structure

```
backend/
  ├── app/
  │   ├── Models/          # Eloquent models (User, Counter, Ticket)
  │   └── Http/Controllers/ # API controllers
  ├── database/
  │   ├── migrations/      # Database schema
  │   └── seeders/         # Demo data
  ├── routes/
  │   └── api.php          # API routes
  └── .env                 # Configuration

frontend/
  ├── src/
  │   ├── pages/           # React pages (Login, Landing, Dashboard)
  │   ├── components/      # Reusable components
  │   ├── services/        # API service
  │   └── App.tsx          # Main app component
  ├── vite.config.ts       # Build configuration
  └── package.json         # Dependencies
```

## Common Issues & Solutions

### Issue: Cannot connect to database
**Solution:**
- Make sure MySQL is running
- Check .env file has correct DB_USERNAME and DB_PASSWORD
- Verify database exists: `CREATE DATABASE dmw_processing;`

### Issue: Port 3000 or 8000 already in use
**Solution:**
- Change port in frontend: edit `frontend/vite.config.ts`
- Change port for backend: `php artisan serve --port=8001`

### Issue: JWT authentication not working
**Solution:**
- Regenerate JWT secret: `php artisan jwt:secret`
- Clear cache: `php artisan cache:clear`

### Issue: Frontend not connecting to backend
**Solution:**
- Ensure backend is running on http://localhost:8000
- Check CORS is enabled in backend
- Verify API proxy in vite.config.ts

## Next Steps

1. **Customize Design**: Edit CSS files in `frontend/src/**/*.css`
2. **Add More Counters**: Update seeder in `backend/database/seeders/DatabaseSeeder.php`
3. **Add Priority Rules**: Modify ticket creation logic in `QueueController`
4. **Deploy**: Follow deployment guides in README.md

## Need Help?

Check the main README.md for:
- Detailed API documentation
- Architecture overview
- Deployment instructions
- Security recommendations
