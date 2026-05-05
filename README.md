# Leave Tracker — Frontend

React + Vite frontend for the Leave & Time-Off Tracker application. Employees can apply for leave and track balances. Managers can approve/reject requests, manage employees, and view team calendars.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Auth | JWT stored in localStorage |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Backend API running on `http://localhost:9000`

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:9000/api
```

### Run

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```
leave-tracker-frontend/
├── public/
│   ├── background.png         # Login page background image
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Responsive nav with hamburger menu
│   │   ├── LeaveCard.jsx       # Reusable leave request card
│   │   ├── LeaveBalanceWidget.jsx  # Balance bars per leave type
│   │   ├── LoadingSpinner.jsx  # Full-page loading indicator
│   │   ├── NotificationBell.jsx    # Bell icon with unread count
│   │   ├── AddEmployee.jsx     # Single employee creation form
│   │   └── BulkUpload.jsx      # CSV drag-and-drop upload
│   ├── hooks/
│   │   └── useAuth.js          # Auth state + localStorage persistence
│   ├── pages/
│   │   ├── LoginLanding.jsx    # Role selection screen (Employee / Manager)
│   │   ├── Login.jsx           # Login form (shared, role via prop)
│   │   ├── EmployeeDashboard.jsx   # Leave balance + recent requests
│   │   ├── ApplyLeave.jsx      # Leave application form
│   │   ├── ManagerDashboard.jsx    # Pending requests with approve/reject
│   │   ├── EmployeesPage.jsx   # Employee list + balance adjust + year-end reset
│   │   ├── LeaveHistoryPage.jsx    # Actioned requests with filters
│   │   ├── AddEmployeePage.jsx # Tabs: single form | CSV upload
│   │   ├── ProfilePage.jsx     # View profile + change password
│   │   └── TeamCalendar.jsx    # 2-week team calendar (desktop grid / mobile list)
│   ├── services/
│   │   ├── api.js              # Axios instance with JWT interceptor + 401 handler
│   │   ├── leaveService.js     # Employee API calls (apply, history, balance, cancel)
│   │   └── managerService.js   # Manager API calls (approve, reject, employees, etc.)
│   ├── App.jsx                 # Router + ProtectedRoute component
│   ├── main.jsx                # React DOM entry point
│   └── index.css               # Tailwind base import
├── .env                        # Environment variables (not committed)
├── .gitignore
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Routing

| Path | Component | Access |
|------|-----------|--------|
| `/` | Redirect → `/login` | Public |
| `/login` | LoginLanding | Public |
| `/login/employee` | Login (employee) | Public |
| `/login/manager` | Login (manager) | Public |
| `/dashboard` | EmployeeDashboard | Employee only |
| `/apply` | ApplyLeave | Employee only |
| `/manager` | ManagerDashboard | Manager only |
| `/employees` | EmployeesPage | Manager only |
| `/add-employee` | AddEmployeePage | Manager only |
| `/leave-history` | LeaveHistoryPage | Manager only |
| `/calendar` | TeamCalendar | Any authenticated |
| `/profile` | ProfilePage | Any authenticated |

### ProtectedRoute
- Redirects to `/login` if no JWT token in localStorage
- Redirects to the correct dashboard if role doesn't match the route

---

## Auth Flow

1. User selects role on `/login` landing page
2. Submits credentials → backend returns JWT + user object
3. Token and user stored in `localStorage`
4. `useAuth` hook reads from localStorage for persistent sessions
5. Axios interceptor attaches `Authorization: Bearer <token>` to every request
6. On 401 response, token is cleared and user is redirected to `/login`

---

## Key Components

### `useAuth.js`
Custom hook that manages authentication state. Reads token and user from localStorage on mount, exposes `login()` and `logout()` helpers.

### `api.js`
Axios instance pre-configured with:
- `baseURL` from `VITE_API_URL` env variable
- Request interceptor: attaches JWT token
- Response interceptor: handles 401 by clearing auth and redirecting

### `LeaveCard.jsx`
Reusable card component used in both employee and manager views. Renders leave type, dates, working days, status badge, and action buttons based on context.

### `TeamCalendar.jsx`
Shows approved leaves for the next 2 weeks. Desktop: grid layout. Mobile: list layout. Color-coded by leave type.
