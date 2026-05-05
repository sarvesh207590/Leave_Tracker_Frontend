# Architecture — Leave & Time-Off Tracker

## Why This Stack (MERN)?

| Choice | Reason |
|--------|--------|
| **MongoDB** | Flexible schema suits leave requests with optional fields (managerComment, actionDate). Easy to evolve without migrations. |
| **Express.js** | Minimal, unopinionated REST API layer. Fast to set up, easy to reason about middleware chain. |
| **React + Vite** | Component-driven UI with fast HMR. Vite gives near-instant dev server startup. |
| **Tailwind CSS** | Utility-first CSS eliminates context switching. Responsive design with built-in breakpoints. |
| **JWT Auth** | Stateless authentication — no session store needed. Token carries role for instant authorization. |

---

## Folder Structure

```
leave-tracker-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Login, profile, notifications
│   ├── leaveController.js     # Apply, history, balance, cancel
│   ├── managerController.js   # Pending, approve, reject, employees, history, balance reset
│   └── bulkController.js      # CSV bulk employee upload
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access guard
│   └── uploadMiddleware.js    # Multer CSV upload config
├── models/
│   ├── User.js                # Employee & Manager schema
│   └── LeaveRequest.js        # Leave request schema
├── routes/
│   ├── authRoutes.js
│   ├── leaveRoutes.js
│   └── managerRoutes.js
├── seed/
│   └── seed.js                # 3 managers, 20 employees, 27 leave requests
├── utils/
│   └── workingDays.js         # Weekend-excluding day calculator
└── __tests__/                 # Jest + fast-check property tests

leave-tracker-frontend/
├── public/
│   └── background.png         # Login page background
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Responsive nav with hamburger
│   │   ├── LeaveCard.jsx       # Reusable leave request card
│   │   ├── LeaveBalanceWidget.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── AddEmployee.jsx
│   │   └── BulkUpload.jsx
│   ├── hooks/
│   │   └── useAuth.js          # Auth state + localStorage persistence
│   ├── pages/
│   │   ├── LoginLanding.jsx    # Role selection screen
│   │   ├── Login.jsx           # Employee / Manager login form
│   │   ├── EmployeeDashboard.jsx
│   │   ├── ApplyLeave.jsx
│   │   ├── ManagerDashboard.jsx
│   │   ├── EmployeesPage.jsx
│   │   ├── LeaveHistoryPage.jsx
│   │   ├── AddEmployeePage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── TeamCalendar.jsx
│   └── services/
│       ├── api.js              # Axios instance with JWT interceptor
│       ├── leaveService.js
│       └── managerService.js
```

---

## Database Schema

### User
```
{
  name:         String (required)
  email:        String (unique, lowercase)
  password:     String (bcrypt hashed)
  role:         "employee" | "manager"
  leaveBalance: {
    Sick:     Number (default 10)
    Casual:   Number (default 10)
    WFH:      Number (default 15)
    Comp-off: Number (default 5)
  }
  notifications: [
    { message: String, read: Boolean, createdAt: Date }
  ]
  timestamps: true
}
```

### LeaveRequest
```
{
  userId:         ObjectId → User
  leaveType:      "Sick" | "Casual" | "WFH" | "Comp-off"
  startDate:      Date
  endDate:        Date
  workingDays:    Number (server-calculated, excludes weekends)
  reason:         String
  status:         "Pending" | "Approved" | "Rejected" | "Cancelled"
  managerId:      ObjectId → User
  managerComment: String
  actionDate:     Date
  timestamps: true
}
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Login, returns JWT + user |
| GET | `/me` | Auth | Get current user profile |
| PATCH | `/profile` | Auth | Update name or password |
| GET | `/managers` | Auth | List all managers (for dropdown) |
| GET | `/notifications` | Auth | Get user notifications |
| PATCH | `/notifications/read` | Auth | Mark all notifications read |

### Leave — `/api/leave`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/apply` | Employee | Submit leave request |
| GET | `/my` | Employee | Leave history with filters |
| GET | `/balance` | Employee | Current leave balance |
| GET | `/calendar` | Auth | Team calendar (2 weeks) |
| PATCH | `/:id/cancel` | Employee | Cancel a leave request |

### Manager — `/api/manager`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/pending` | Manager | All pending requests |
| PATCH | `/:id/approve` | Manager | Approve a request |
| PATCH | `/:id/reject` | Manager | Reject a request |
| GET | `/history` | Manager | All actioned requests |
| GET | `/employees` | Manager | All employees + balances |
| POST | `/add-employee` | Manager | Create single employee |
| POST | `/bulk-upload` | Manager | CSV bulk employee upload |
| PATCH | `/balance/:employeeId` | Manager | Adjust employee balance |
| POST | `/balance/reset-all` | Manager | Year-end balance reset |

---

## Component Structure

```
App (Router)
├── LoginLanding          → role selection
├── Login (role prop)     → employee or manager form
├── ProtectedRoute
│   ├── EmployeeDashboard
│   │   ├── Navbar
│   │   ├── LeaveBalanceWidget
│   │   └── LeaveCard (with cancel)
│   ├── ApplyLeave
│   ├── ManagerDashboard
│   │   ├── Navbar
│   │   └── LeaveCard (with approve/reject)
│   ├── EmployeesPage     → balance bars + adjust modal + year-end reset
│   ├── LeaveHistoryPage  → actioned requests with filters
│   ├── AddEmployeePage   → tabs: single form | CSV upload
│   ├── ProfilePage       → view info + change password
│   └── TeamCalendar      → 2-week grid (desktop) / list (mobile)
```

---

## What I'd Improve With More Time

1. **Email notifications** — send email on approve/reject using Nodemailer or SendGrid instead of in-app only.
2. **Refresh token** — current JWT expires in 7 days with no refresh mechanism. Add a short-lived access token + refresh token pair.
3. **Holiday calendar** — integrate public holidays so working day calculation excludes them too.
4. **Leave approval workflow** — multi-level approval (manager → HR) for longer leaves.
5. **Analytics dashboard** — charts showing leave trends per team, most common leave types, absenteeism rate.
6. **Role: HR Admin** — separate admin role that can manage all employees across all managers, view org-wide reports.
7. **Pagination** — large employee lists and leave history should be paginated server-side.
8. **Unit test coverage for frontend** — add Vitest + React Testing Library tests for components.
9. **Docker setup** — containerize backend + MongoDB for consistent dev/prod environments.
10. **PWA support** — make the frontend installable on mobile with offline capability.
