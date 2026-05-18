# DMW Processing - Backend Project Summary

## 🔧 Laravel PHP Backend Overview

**Location**: `c:\Users\KITTIM\dmwprocessing\backend`
**Port**: 8000
**Framework**: Laravel 11 + PHP 8.2
**Authentication**: JWT (JSON Web Tokens)
**Database**: MySQL

## 🗂 Project Structure

```
backend/
├── app/
│   ├── Models/
│   │   ├── User.php              # User model (Admin/Counter)
│   │   ├── Counter.php           # Counter model
│   │   └── Ticket.php            # Ticket model
│   └── Http/Controllers/Api/
│       ├── AuthController.php    # Login, logout, user info
│       ├── QueueController.php   # Queue management
│       └── CounterController.php # Counter management
├── database/
│   ├── migrations/
│   │   ├── ...create_users_table.php
│   │   ├── ...create_counters_table.php
│   │   └── ...create_tickets_table.php
│   └── seeders/
│       └── DatabaseSeeder.php    # Demo data
├── routes/
│   └── api.php                   # API endpoints
├── config/
│   └── auth.php                  # Authentication config
├── .env                          # Environment variables
├── .env.example                  # Template
└── composer.json                 # PHP dependencies
```

## 📊 Database Schema

### Users Table
```
id, name, email, password, role (superadmin|counter), timestamps
```

### Counters Table
```
id, counter_name, user_id, is_active, current_ticket_id, timestamps
```

### Tickets Table
```
id, priority_number (unique), counter_id, status (waiting|serving|completed),
called_at, completed_at, timestamps
```

## 🎯 Models

### User Model
**Roles**: `superadmin`, `counter`
**Methods**:
- `isSuperAdmin()` - Check if admin
- `isCounter()` - Check if counter operator
- `counter()` - Get associated counter

### Counter Model
**Fields**:
- `counter_name`: Display name (e.g., "Counter 1")
- `user_id`: Associated operator
- `is_active`: Boolean status
- `current_ticket_id`: Currently serving ticket

### Ticket Model
**Statuses**:
- `waiting`: In queue, waiting to be called
- `serving`: Currently being served
- `completed`: Service finished

**Timestamps**:
- `called_at`: When ticket was called
- `completed_at`: When service finished

## 🔐 API Endpoints

### Authentication Routes
```
POST   /api/auth/login          # Login with email/password
POST   /api/auth/logout         # Logout (requires auth)
GET    /api/auth/user           # Get current user (requires auth)
POST   /api/auth/refresh        # Refresh JWT token (requires auth)
```

### Queue Routes
```
GET    /api/queue/waiting                  # Get waiting + serving tickets
GET    /api/queue/serving                  # Get only serving tickets
POST   /api/queue/call-next/{counterId}   # Call next ticket for counter
POST   /api/queue/complete/{ticketId}     # Mark ticket as completed
GET    /api/queue/tickets                  # Get all tickets (paginated)
POST   /api/queue/tickets                  # Create new ticket
```

### Counter Routes
```
GET    /api/counters              # Get all counters
PUT    /api/counters/{id}         # Update counter info
```

## 🔑 Authentication Details

**JWT Setup**:
1. User logs in with email/password
2. Backend verifies credentials
3. JWT token is generated
4. Frontend stores token in localStorage
5. Frontend includes token in `Authorization: Bearer {token}` header
6. Backend validates token on protected routes

**Configuration** (.env):
```
JWT_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_TTL=60  # Token expires in 60 minutes
```

## 🌾 Controllers

### AuthController
**Methods**:
- `login()` - Authenticate user, return JWT token
- `logout()` - Invalidate token
- `user()` - Get current authenticated user
- `refresh()` - Generate new token

### QueueController
**Methods**:
- `getWaiting()` - Return waiting queue
- `getServing()` - Return serving queue
- `callNext()` - Move ticket from waiting to serving
- `completeService()` - Mark ticket as completed
- `getTickets()` - Get all tickets with pagination
- `addTicket()` - Create new ticket

### CounterController
**Methods**:
- `getCounters()` - Return all counters
- `updateCounter()` - Update counter information

## 📋 Demo Data (Seeder)

**DatabaseSeeder.php** creates:

**SuperAdmin User**:
- Email: admin@dmw.com
- Password: password
- Role: superadmin

**5 Counter Users** (Counter 1-5):
- Email: counter1@dmw.com ... counter5@dmw.com
- Password: password (same for all)
- Role: counter

**10 Demo Tickets**:
- Tickets 0001-0002: Status = serving (assigned to counters 1-2)
- Tickets 0003-0010: Status = waiting

## 🚀 Installation & Setup

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Generate application key
php artisan key:generate

# 4. Generate JWT secret
php artisan jwt:secret

# 5. Create MySQL database
# CREATE DATABASE dmw_processing;

# 6. Run migrations
php artisan migrate:fresh --seed

# 7. Start server
php artisan serve
```

**Result**: Server runs on http://localhost:8000

## 🔧 Configuration Files

### .env Configuration
```
APP_KEY=base64:... (generated)
APP_DEBUG=true (set to false in production)

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dmw_processing
DB_USERNAME=root
DB_PASSWORD=(your password)

JWT_SECRET=(generated with jwt:secret)
JWT_ALGORITHM=HS256
JWT_TTL=60
```

### config/auth.php
- Default guard: `api`
- JWT driver for API authentication
- Eloquent provider for users

## 🧪 Testing API

**Using cURL**:
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dmw.com","password":"password"}'

# Get waiting queue (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/queue/waiting \
  -H "Authorization: Bearer TOKEN"
```

**Using Postman**:
1. POST to `/api/auth/login` with email/password
2. Copy `token` from response
3. Add `Authorization: Bearer {token}` header to protected routes
4. Make requests to endpoints

## 📡 Middleware

**Routes Protected By**:
- `auth:api` - Requires valid JWT token
- `throttle:60,1` - Rate limiting (can be added)

**CORS** (may need configuration):
- Allow requests from `http://localhost:3000`
- Allow methods: GET, POST, PUT, DELETE
- Allow headers: Content-Type, Authorization

## 🛠 Artisan Commands

```bash
# Database operations
php artisan migrate                    # Run all pending migrations
php artisan migrate:fresh --seed      # Reset and seed
php artisan migrate:rollback          # Undo last batch

# Cache & optimization
php artisan config:cache              # Cache configuration
php artisan route:cache               # Cache routes
php artisan cache:clear               # Clear all cache

# Development
php artisan tinker                    # Interactive shell
php artisan serve --port=8001         # Run on different port
php artisan queue:work                # Process queued jobs
```

## 🔄 Request/Response Flow

**Example: Calling Next Ticket**

```
POST /api/queue/call-next/1
Authorization: Bearer {token}

Server finds:
1. Counter with ID = 1
2. First waiting ticket
3. Updates ticket status to "serving"
4. Updates counter current_ticket_id
5. Sets called_at timestamp

Response 200:
{
  "message": "Ticket called",
  "ticket": {
    "id": 1,
    "priority_number": "0003",
    "status": "serving",
    "counter_id": 1,
    "called_at": "2024-01-15 10:30:00"
  }
}
```

## 🚢 Deployment Tips

**Production Setup**:
```bash
# Optimize autoload
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Set debug to false
APP_DEBUG=false
```

**Environment**:
- Use strong JWT_SECRET
- Set APP_ENV=production
- Use HTTPS URLs
- Configure CORS properly
- Set up environment-specific database

## 🐛 Troubleshooting

**"SQLSTATE[HY000]: General error"**:
- Run: `php artisan migrate:fresh --seed`
- Check database name in .env

**JWT token not working**:
- Run: `php artisan jwt:secret` to regenerate
- Check JWT_SECRET in .env

**CORS errors from frontend**:
- Ensure backend returns proper CORS headers
- May need to install/configure laravel-cors package

**Port 8000 in use**:
- Run: `php artisan serve --port=8001`

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| User.php | User authentication model |
| Counter.php | Counter information model |
| Ticket.php | Queue ticket model |
| AuthController.php | Handle login/logout |
| QueueController.php | Queue operations |
| CounterController.php | Counter operations |
| api.php | API route definitions |
| DatabaseSeeder.php | Demo data |
| .env | Configuration |

## 🔗 Additional Resources

- [Laravel Docs](https://laravel.com/docs)
- [JWT-Auth Docs](https://jwt-auth.readthedocs.io)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [RESTful API Best Practices](https://restfulapi.net/)
