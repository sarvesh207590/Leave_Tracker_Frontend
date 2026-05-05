# PROMPTS.md — AI Prompt Log

---

## ChatGPT (Pre-Development)

**Prompt 1**
> "Read the word doc carefully and break that part in simple terms and understand the assessment and explain me"

AI Response:
> The assessment asks you to build a Leave Tracker using MERN stack. There are two roles — Employee and Manager. Employees can apply for leave (Sick, Casual, WFH, Comp-off), view their balance and history. Managers can approve or reject requests. You need REST APIs, a seeded database, and a clean React UI. Evaluation is based on code quality, folder structure, and working functionality.

---

**Prompt 2**
> "Give a proper prompt for development that I will send to Kiro"

AI Response:
> Here is a detailed development prompt: Build a Leave & Time-Off Tracker using MERN stack. Include Employee and Manager roles, leave application with working day calculation, dashboards, team calendar, seed data, and proper folder structure for both backend and frontend...

---

## Kiro (Development)

**Prompt 1**
> *(Pasted the full project prompt)*

AI Response:
> Created requirements.md, design.md, and tasks.md. Then implemented the full backend — Express server, MongoDB models (User, LeaveRequest), auth with JWT, leave and manager controllers, seed script with 3 managers and 20 employees. Then built the full React frontend with all pages and components.

---

**Prompt 2**
> "I think there is a feature that should be there to add bulk employees"

AI Response:
> Added POST /api/manager/bulk-upload endpoint using multer and csv-parse. Created BulkUpload component with drag-and-drop, sample CSV download, and upload result summary showing success/failure counts.

---

**Prompt 3**
> "Also add single employee add feature in manager section" + "also this feature should be in the navbar"

AI Response:
> Created AddEmployee form component and a dedicated /add-employee page with a tab switcher (Single Employee / Bulk Upload). Added "Add Employee" link to the manager navbar.

---

**Prompt 4**
> "Can you find what new things should we add?"

AI Response:
> Suggested 10 features grouped by priority — High: leave cancellation, view all employees, notifications. Medium: profile page, manager leave history, date validation, balance reset. Nice to have: stats cards, export CSV, search filters.

---

**Prompt 5**
> "Add leave cancellation, view all employees, notifications"

AI Response:
> Added PATCH /api/leave/:id/cancel that restores balance if approved. Built Employees page with leave balance progress bars. Added notification bell with unread badge that polls every 30 seconds and marks read on open.

---

**Prompt 6**
> "Add profile page, manager leave history, date validation on apply leave, leave balance reset"

AI Response:
> Built ProfilePage with name edit and password change. Added LeaveHistoryPage for managers with status/type filters. Added past date, weekend, and overlap validation on apply leave. Added per-employee balance adjust modal and year-end reset-all button on Employees page.

---

**Prompt 7**
> "create  different logins for employee and admin"

AI Response:
> Created LoginLanding role-selection screen with Employee and Manager cards. Built two separate login forms at /login/employee (blue theme) and /login/manager (purple theme) with role guards that prevent wrong-role login.

---

**Prompt 8**
> "I have added the background image in public, add it to the landing page and login page"

AI Response:
> Applied background.png as full-screen background on both pages. Removed the dark overlay and replaced the white card with bg-white/70 + backdrop-blur-md for a frosted glass effect.

---

**Prompt 9**
> "In console only show MongoDB connected and server running on port 9000"

AI Response:
> Removed all console.error and console.log from controllers. Simplified db.js to log only "MongoDB connected". Changed PORT to 9000 in .env and updated VITE_API_URL in frontend .env to match.

---

**Prompt 10**
> "Make it responsive, works on desktop and mobile also"

AI Response:
> Added hamburger menu to Navbar with a full-width mobile drawer. Switched TeamCalendar 7-column grid to a stacked day list on mobile. Made all filter bars, headers, and buttons stack vertically on small screens. Fixed notification dropdown overflow on narrow screens.

---

**Prompt 11**
> "Remove the unnecessary files that are not required"

AI Response:
> Deleted react.svg, vite.svg, hero.png, App.css, authService.js, sample-employees.csv, and icons.svg — all unused default scaffold or temporary files.

---

**Prompt 12**
> "Check the frontend error in terminal"

AI Response:
> Found that useAuth.js still imported the deleted authService.js causing an UNRESOLVED_IMPORT build error. Fixed by replacing the import with a direct api.post call. Build passed successfully after the fix.
