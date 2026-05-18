# DMW Processing - Queue Management System

A complete queue management system for Department of Migrant Workers processing centers, built with React.js frontend, Laravel PHP backend, and MySQL database.

## 🚀 Quick Start

This workspace contains THREE separate projects:

```
dmwprocessing/
├── frontend/          # React.js application (Port 3000)
├── backend/           # Laravel PHP API (Port 8000)
├── app/               # (Original Expo React Native app)
├── SETUP.md          # Complete setup instructions
└── README.md
```

### Quick Setup (3 Steps)

**Terminal 1 - Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access the app:**
- Landing Page: http://localhost:3000/landing
- Login: http://localhost:3000/login
- Admin Credentials: admin@dmw.com / password

## 📋 Features

### Landing Page
- Real-time queue display (updates every 2 seconds)
- Shows waiting customers and currently serving
- Matches the DMW design requirement
- Display on public TVs

### Admin Dashboard
- View all counters and statistics
- Monitor system status

### Counter Panel
- Call next ticket
- Mark service as completed
- View queue preview

### Demo Credentials
- **Admin**: admin@dmw.com / password
- **Counter 1-5**: counter1@dmw.com ... counter5@dmw.com / password

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 + TypeScript + Vite |
| Backend | Laravel 11 + PHP 8.2 |
| Database | MySQL |
| API | REST + JWT Auth |

## 📖 Full Documentation

See [SETUP.md](SETUP.md) for:
- Detailed installation steps
- Database configuration
- Troubleshooting guide
- Development workflow

## 🎯 Project Structure

```
backend/
├── app/Models/ → User, Counter, Ticket
├── app/Http/Controllers/Api/ → AuthController, QueueController, CounterController
├── database/migrations/ → Database schema
├── routes/api.php → API endpoints
└── .env → Configuration

frontend/
├── src/pages/ → Login, Landing, Dashboard
├── src/components/ → QueueDisplay, CounterPanel, ProtectedRoute
├── src/services/api.ts → API client
└── vite.config.ts → Build configuration
```

## 🔌 API Endpoints

**Authentication:**
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`

**Queue:**
- `GET /api/queue/waiting` - All waiting tickets
- `GET /api/queue/serving` - Serving tickets
- `POST /api/queue/call-next/{counterId}` - Call next ticket
- `POST /api/queue/complete/{ticketId}` - Complete service

**Counters:**
- `GET /api/counters` - Get all counters
- `PUT /api/counters/{id}` - Update counter

## 🚢 Deployment

See README section in SETUP.md for production deployment instructions.

## 📝 Database Schema

**Users** - Store admin and counter operators
**Counters** - 5 service counters (1-5)
**Tickets** - Queue tickets with status: waiting → serving → completed

## ❓ Need Help?

1. Check [SETUP.md](SETUP.md) for detailed instructions
2. Ensure both frontend and backend are running
3. Verify database is created and migrations ran
4. Check .env files have correct configuration

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
