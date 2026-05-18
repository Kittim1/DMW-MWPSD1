# DMW Processing - Complete System Overview

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC TV (Landing Page)                 │
│  http://localhost:3000/landing                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │   WAITING            │  │  SERVING        │  Counter   │    │
│  ├──────────────────────┤  ├─────────────────┼────────────┤    │
│  │  0006                │  │  0001           │     1      │    │
│  │  0007                │  │  0002           │     2      │    │
│  │  0008                │  │                 │            │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
│            (Auto-refresh every 2 seconds)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
        ┌─────────────────────────────────────────┐
        │      REACT.JS FRONTEND                  │
        │  http://localhost:3000                  │
        │  ├── Login (admin@dmw.com)             │
        │  ├── Landing (public)                   │
        │  └── Dashboard (protected)              │
        │      ├── Admin View                     │
        │      └── Counter Panel                  │
        └─────────────────────────────────────────┘
                              ↓ ↑
        ┌─────────────────────────────────────────┐
        │    LARAVEL PHP BACKEND (REST API)       │
        │  http://localhost:8000/api              │
        │  ├── /auth/login (JWT)                 │
        │  ├── /queue/waiting                     │
        │  ├── /queue/serving                     │
        │  ├── /queue/call-next                   │
        │  ├── /queue/complete                    │
        │  └── /counters                          │
        └─────────────────────────────────────────┘
                              ↓ ↑
        ┌─────────────────────────────────────────┐
        │         MYSQL DATABASE                  │
        │   dmw_processing                        │
        │  ├── users (5 counters + 1 admin)      │
        │  ├── counters (5)                       │
        │  └── tickets (queue items)              │
        └─────────────────────────────────────────┘
```

## 👥 User Roles & Access

```
┌────────────────────┬─────────────────────────────────┐
│  Role              │  Access                         │
├────────────────────┼─────────────────────────────────┤
│  SUPERADMIN        │                                 │
│  (admin@dmw.com)   │  • Login to dashboard           │
│                    │  • View all counters            │
│                    │  • View system statistics       │
│                    │  • Monitor queue status         │
├────────────────────┼─────────────────────────────────┤
│  COUNTER 1-5       │                                 │
│  (counter1-5@...com│  • Login to dashboard           │
│                    │  • See current ticket           │
│                    │  • Call next ticket             │
│                    │  • Complete service             │
├────────────────────┼─────────────────────────────────┤
│  PUBLIC (TV)       │                                 │
│  (No login needed) │  • View waiting queue           │
│                    │  • View serving queue           │
│                    │  • Real-time updates            │
└────────────────────┴─────────────────────────────────┘
```

## 📱 Frontend Pages

### 1. Landing Page (Public)
```
URL: http://localhost:3000/landing
├── No login required
├── Auto-refreshes every 2 seconds
└── Shows:
    ├── WAITING column (all waiting customers)
    └── SERVING column (current customers at counters)
```

### 2. Login Page
```
URL: http://localhost:3000/login
├── Email input field
├── Password input field
├── Demo credentials display
└── "Remember Me" option (optional)
```

### 3. Dashboard - SuperAdmin View
```
URL: http://localhost:3000/dashboard
├── Welcome message with user name
├── System statistics:
│   ├── Total Counters (5)
│   └── Active Counters (count)
├── All Counters display
│   └── Shows counter name and current ticket
└── Logout button
```

### 4. Dashboard - Counter View
```
URL: http://localhost:3000/dashboard
├── Now Serving section
│   ├── Large ticket number display (current)
│   └── "Complete Service" button
├── Next in Queue section
│   ├── Shows next 3 tickets
│   └── Formatted as #1, #2, #3
└── "Call Next Ticket" button (large, prominent)
```

## 🔄 Ticket Lifecycle

```
┌─────────────────┐
│  PRINT TICKET   │  Guard prints ticket at entrance
│   (e.g., 0001)  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  CREATE IN DATABASE (Waiting Status)    │
│  Ticket: priority_number=0001           │
│          status=waiting                 │
│          counter_id=NULL                │
│          called_at=NULL                 │
└────────┬────────────────────────────────┘
         │
         ↓ (Customer sees it on TV)
┌─────────────────────────────────────────┐
│  CUSTOMER SEES ON LANDING PAGE           │
│  Appears in WAITING column              │
└────────┬────────────────────────────────┘
         │
         ↓ (Counter calls next)
┌─────────────────────────────────────────┐
│  COUNTER CALLS NEXT (POST /queue/call-next/1)│
│  Updates:                               │
│  ├── status=serving                     │
│  ├── counter_id=1                       │
│  └── called_at=NOW()                    │
└────────┬────────────────────────────────┘
         │
         ↓ (Customer sees counter # on TV)
┌─────────────────────────────────────────┐
│  APPEARS IN SERVING COLUMN              │
│  Paired with Counter 1                  │
└────────┬────────────────────────────────┘
         │
         ↓ (Counter completes service)
┌─────────────────────────────────────────┐
│  COMPLETE SERVICE (POST /queue/complete/)│
│  Updates:                               │
│  ├── status=completed                   │
│  ├── completed_at=NOW()                 │
│  └── counter_id becomes available       │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  NO LONGER APPEARS ON TV                │
│  Ticket archived in database            │
└─────────────────────────────────────────┘
```

## 📡 API Call Flow

### Login Flow
```
Frontend Login Page
        │
        ↓ POST /api/auth/login
        │ {email: "admin@dmw.com", password: "password"}
        │
        ↓
Backend AuthController.login()
        │
        ├─ Validate credentials
        ├─ Find user in DB
        ├─ Check password
        └─ Generate JWT token
        │
        ↓ Response 200
        │ {token: "eyJhbGc...", user: {...}}
        │
        ↓
Frontend stores token
├─ localStorage.setItem('auth_token', token)
├─ localStorage.setItem('user', JSON.stringify(user))
└─ Navigate to /dashboard
```

### Queue Display Flow
```
Landing Page loads
        │
        ↓ GET /api/queue/waiting
        │ GET /api/queue/serving
        │ (No auth required - public endpoint)
        │
        ↓
Backend QueueController
        │
        ├─ Get waiting tickets
        │  WHERE status='waiting' OR status='serving'
        │
        ├─ Get serving tickets
        │  WHERE status='serving'
        │
        ↓ Response 200
        │ waiting: [{id:1, priority_number:"0001", ...}, ...]
        │ serving: [{id:2, priority_number:"0002", counter_id:1, ...}, ...]
        │
        ↓
Frontend renders QueueDisplay
├─ Left column: waiting tickets
└─ Right column: serving tickets with counter #
        │
        ↓ After 2 seconds
        └─ Repeat GET requests (setInterval)
```

### Call Next Ticket Flow
```
Counter clicks "Call Next Ticket" button
        │
        ↓ POST /api/queue/call-next/1
        │ Header: Authorization: Bearer {token}
        │ 1 = counter ID
        │
        ↓
Backend QueueController.callNext()
        │
        ├─ Find Counter with ID=1
        ├─ Find first ticket WHERE status='waiting'
        ├─ Update ticket:
        │  ├─ status='serving'
        │  ├─ counter_id=1
        │  └─ called_at=NOW()
        │
        └─ Response 200
        │ {message: "Ticket called", ticket: {...}}
        │
        ↓
Frontend receives response
        │
        ├─ Update counter panel
        │  └─ Show new current ticket
        │
        └─ Landing page auto-refresh in 2 seconds
           └─ Shows ticket in SERVING column with Counter #1
```

## 🛢 Database Tables

### Users Table
```
id | name              | email              | password | role       | created_at
---+-------------------+--------------------+----------+------------+----------
1  | Administrator     | admin@dmw.com      | hash...  | superadmin | 2024-01-15
2  | Counter 1 User    | counter1@dmw.com   | hash...  | counter    | 2024-01-15
3  | Counter 2 User    | counter2@dmw.com   | hash...  | counter    | 2024-01-15
4  | Counter 3 User    | counter3@dmw.com   | hash...  | counter    | 2024-01-15
5  | Counter 4 User    | counter4@dmw.com   | hash...  | counter    | 2024-01-15
6  | Counter 5 User    | counter5@dmw.com   | hash...  | counter    | 2024-01-15
```

### Counters Table
```
id | counter_name | user_id | is_active | current_ticket_id | created_at
---+--------------+---------+-----------+-------------------+-----------
1  | Counter 1    | 2       | 1         | 2                 | 2024-01-15
2  | Counter 2    | 3       | 1         | 3                 | 2024-01-15
3  | Counter 3    | 4       | 1         | NULL              | 2024-01-15
4  | Counter 4    | 5       | 1         | NULL              | 2024-01-15
5  | Counter 5    | 6       | 1         | NULL              | 2024-01-15
```

### Tickets Table
```
id | priority_number | counter_id | status    | called_at           | completed_at | created_at
---+-----------------+------------+-----------+---------------------+--------------+-----------
1  | 0001            | 1          | serving   | 2024-01-15 09:30:00 | NULL         | 2024-01-15 09:25:00
2  | 0002            | 2          | serving   | 2024-01-15 09:31:00 | NULL         | 2024-01-15 09:26:00
3  | 0003            | NULL       | waiting   | NULL                | NULL         | 2024-01-15 09:27:00
4  | 0004            | NULL       | waiting   | NULL                | NULL         | 2024-01-15 09:28:00
...
```

## 🔐 Security Notes

**Authentication**:
- JWT tokens expire after 60 minutes (configurable)
- Tokens are stored in localStorage (XSS consideration)
- Passwords are hashed with bcrypt

**Protected Routes**:
- All `/api` routes require `Authorization: Bearer {token}` header
- Landing page is intentionally public (no auth required)
- Protected routes redirect to login if token missing

**Database**:
- Sensitive data: passwords hashed
- No plain text passwords stored
- SQL injection protection via Eloquent ORM

## 📊 Real-time Features

```
Landing Page Updates:
├─ Every 2 seconds
├─ Fetches waiting queue
├─ Fetches serving queue
├─ Renders new data
└─ No page reload needed

Counter Panel Updates:
├─ Every 2 seconds
├─ Checks for new waiting tickets
├─ Shows next 3 in queue
└─ Current ticket auto-updates

Data Flow:
Frontend (React)
    ↓ (GET request every 2 sec)
Backend (Laravel)
    ↓ (Query database)
Database (MySQL)
    ↓ (Return results)
Backend (JSON response)
    ↓ (Parse and render)
Frontend (Updated UI)
```

## 🚀 Getting Everything Running

**Terminal 1 (Backend)**:
```bash
cd backend
php artisan serve
# Output: Server running on http://localhost:8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
# Output: http://localhost:3000
```

**Then**:
1. Open http://localhost:3000/landing in a web browser or TV screen
2. Open http://localhost:3000/login in another browser
3. Login as admin@dmw.com / password
4. You can now:
   - See landing page with queue
   - See dashboard
   - Open counter panel and test "Call Next" button

## 📚 Quick File Reference

**Frontend Key Files**:
- [FRONTEND.md](FRONTEND.md) - Detailed frontend documentation

**Backend Key Files**:
- [BACKEND.md](BACKEND.md) - Detailed backend documentation

**Setup Instructions**:
- [SETUP.md](SETUP.md) - Step-by-step installation guide

**Main README**:
- [README.md](README.md) - Project overview and quick start
