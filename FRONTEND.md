# DMW Processing - Frontend Project Summary

## 📱 React.js Frontend Overview

**Location**: `c:\Users\KITTIM\dmwprocessing\frontend`
**Port**: 3000
**Framework**: React 18 + TypeScript + Vite

## 🗂 Project Structure

```
frontend/
├── index.html                    # HTML entry point
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript Node config
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── .gitignore
└── src/
    ├── main.tsx                 # React app entry
    ├── index.css                # Global styles
    ├── App.tsx                  # Main app component with routing
    ├── App.css                  # App styles
    ├── pages/
    │   ├── Login.tsx            # Login page
    │   ├── Login.css
    │   ├── Landing.tsx          # Queue display page (public)
    │   ├── Landing.css
    │   ├── Dashboard.tsx        # Admin/Counter dashboard
    │   └── Dashboard.css
    ├── components/
    │   ├── ProtectedRoute.tsx   # Private route wrapper
    │   ├── QueueDisplay.tsx     # Queue display component
    │   ├── QueueDisplay.css     # Beautiful queue styling
    │   ├── CounterPanel.tsx     # Counter operator panel
    │   └── CounterPanel.css
    └── services/
        └── api.ts               # Axios API client & service methods
```

## 🎨 Pages Breakdown

### Landing Page (`Landing.tsx`)
- **Route**: `/landing`
- **Description**: Public queue display for waiting area TVs
- **Features**:
  - Real-time queue updates (every 2 seconds)
  - Two-column layout (Waiting | Serving)
  - Large, readable numbers for TV display
  - Auto-refresh using `setInterval`

### Login Page (`Login.tsx`)
- **Route**: `/login`
- **Description**: User authentication
- **Features**:
  - Email and password fields
  - JWT token storage
  - Error messages
  - Demo credentials display

### Dashboard (`Dashboard.tsx`)
- **Route**: `/dashboard` (protected)
- **Roles**:
  - **SuperAdmin**: System overview, counter statistics
  - **Counter Operator**: Counter service panel
- **Features**:
  - Role-based layout
  - User info display
  - Logout functionality

## 🔑 Key Components

### ProtectedRoute
- Wraps authenticated routes
- Redirects to login if not authenticated
- Checks `localStorage` for auth token

### QueueDisplay
- Displays waiting or serving queue
- Props:
  - `title`: "WAITING" or "SERVING"
  - `items`: Array of tickets
  - `type`: "waiting" or "serving"
- Styling highlights first item in queue

### CounterPanel
- Counter operator interface
- Features:
  - Shows current ticket (large display)
  - Shows next 3 tickets
  - "Call Next" and "Complete" buttons
  - Auto-refresh queue every 2 seconds

## 📡 API Client (`api.ts`)

**Services**:
- `authService`: Login, logout, getCurrentUser
- `queueService`: Get waiting/serving, call next, complete service
- `counterService`: Get counters, update counter

**Configuration**:
- Base URL: `http://localhost:8000/api`
- Auto-includes JWT token in headers
- Error handling with axios interceptors

## 🎨 Styling

**Color Scheme**:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)

**Responsive Design**:
- Mobile-first approach
- Grid layouts for responsiveness
- Flexbox for alignment

## 🚀 Getting Started

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Access: http://localhost:3000

## 📦 Dependencies

**Main**:
- react: UI library
- react-dom: DOM rendering
- react-router-dom: Routing
- axios: HTTP client

**Dev**:
- typescript: Type safety
- vite: Build tool
- @vitejs/plugin-react: React support for Vite
- @types/react: TypeScript types

## 🔐 Authentication Flow

1. User enters credentials on Login page
2. Frontend sends POST to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in `localStorage`
5. Token included in all API requests via interceptor
6. Protected routes check for token existence
7. Landing page accessible without auth (public)

## 🔄 Real-time Updates

- Landing page refreshes queue every 2 seconds
- Uses `setInterval` in useEffect
- Calls `/api/queue/waiting` and `/api/queue/serving`
- Cleanup on component unmount

## 🎯 Development Tips

**Local API**: Frontend proxy forwards `/api` to `http://localhost:8000`

**Browser DevTools**:
- Check Network tab for API calls
- Check localStorage for auth token
- Check Console for errors

**Environment Variables** (.env):
```
VITE_API_URL=http://localhost:8000/api
```

## 📱 Mobile Responsive

- Dashboard works on mobile
- Landing page optimized for TV display
- Counter panel responsive
- Touch-friendly button sizes

## 🐛 Common Issues

**API Connection Failed**:
- Check backend is running on port 8000
- Check network tab in DevTools
- Verify CORS is enabled

**Token Expired**:
- Clear localStorage and login again
- Check JWT_TTL in backend .env

**Styling Issues**:
- Clear browser cache
- Check CSS is loaded in DevTools
- Verify className matches CSS selector

## 🚢 Building for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment

## 📚 File Reference

| File | Purpose |
|------|---------|
| App.tsx | Router and main layout |
| Login.tsx | Authentication UI |
| Landing.tsx | Public queue display |
| Dashboard.tsx | Admin/counter interface |
| QueueDisplay.tsx | Queue component |
| CounterPanel.tsx | Counter operator UI |
| api.ts | API communication |
