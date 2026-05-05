# Requirements Document

## Introduction

A production-ready Leave & Time-Off Tracker internal tool built with the MERN stack (MongoDB, Express, React, Node.js). The system allows employees to apply for leave and managers to approve or reject requests, with a team calendar view and leave balance tracking.

## Glossary

- **Employee**: A company staff member who can apply for leave
- **Manager**: A staff member with elevated privileges who can approve or reject leave requests
- **Leave_Request**: A formal request by an employee to take time off
- **Leave_Balance**: The remaining number of days available per leave type for an employee
- **Working_Days**: Calendar days excluding Saturdays and Sundays
- **Leave_Type**: Category of leave — Sick, Casual, WFH, or Comp-off
- **Action_Date**: The date on which a manager approves or rejects a leave request
- **System**: The Leave & Time-Off Tracker application (backend API + frontend UI)
- **Auth_Middleware**: Server-side middleware that validates user identity and role
- **Seed_Script**: A script that populates the database with initial test data

---

## Requirements

### Requirement 1: User Authentication & Role Selection

**User Story:** As a user, I want to log in and be identified by my role, so that I can access features appropriate to my role (Employee or Manager).

#### Acceptance Criteria

1. WHEN a user submits a login request with a valid email, THE System SHALL authenticate the user and return a JWT token along with the user's role
2. WHEN a user submits a login request with an invalid email or password, THE System SHALL return a 401 status with a descriptive error message
3. THE System SHALL support two roles: `employee` and `manager`
4. WHILE a user is authenticated, THE System SHALL include the user's role and ID in every protected API response context
5. IF a request is made to a protected route without a valid token, THEN THE Auth_Middleware SHALL reject the request with a 401 status code

---

### Requirement 2: Leave Application

**User Story:** As an employee, I want to apply for leave by specifying the type, dates, reason, and manager, so that my request can be reviewed and actioned.

#### Acceptance Criteria

1. WHEN an employee submits a leave application, THE System SHALL create a Leave_Request with status `Pending`
2. THE System SHALL support the following leave types: `Sick`, `Casual`, `WFH`, `Comp-off`
3. WHEN a leave application is submitted, THE System SHALL auto-calculate Working_Days between start and end date (excluding weekends)
4. IF the start date is after the end date, THEN THE System SHALL reject the request with a 400 status and a descriptive error message
5. IF any required field (leaveType, startDate, endDate, reason, managerId) is missing, THEN THE System SHALL return a 400 status with field-level validation errors
6. WHEN a leave application is submitted, THE System SHALL validate that the selected managerId corresponds to a user with role `manager`
7. IF an employee has insufficient Leave_Balance for the requested leave type and duration, THEN THE System SHALL reject the request with a 400 status
8. WHEN a leave request is successfully created, THE System SHALL return a 201 status with the created Leave_Request object

---

### Requirement 3: Employee Dashboard

**User Story:** As an employee, I want to view my leave balance, leave history, and pending requests, so that I can track my time-off usage.

#### Acceptance Criteria

1. WHEN an employee requests their dashboard data, THE System SHALL return their Leave_Balance for all leave types
2. WHEN an employee requests their leave history, THE System SHALL return all their Leave_Request records sorted by most recent first
3. WHEN an employee filters leave history by status, THE System SHALL return only Leave_Request records matching the specified status (`Pending`, `Approved`, `Rejected`)
4. WHEN an employee filters leave history by date range, THE System SHALL return only Leave_Request records where startDate falls within the specified range
5. IF no filters are applied, THE System SHALL return the complete leave history for that employee

---

### Requirement 4: Manager Dashboard

**User Story:** As a manager, I want to view, approve, or reject pending leave requests from my team, so that I can manage team availability.

#### Acceptance Criteria

1. WHEN a manager requests pending leave requests, THE System SHALL return all Leave_Request records assigned to that manager with status `Pending`
2. WHEN a manager approves a leave request, THE System SHALL update the status to `Approved`, record the Action_Date, and store the manager's name
3. WHEN a manager rejects a leave request, THE System SHALL update the status to `Rejected`, record the Action_Date, and store the manager's name
4. WHERE a manager provides a comment during approval or rejection, THE System SHALL store the comment in the `managerComment` field
5. WHEN a leave request is approved, THE System SHALL deduct the corresponding Working_Days from the employee's Leave_Balance for that leave type
6. IF a manager attempts to action a leave request not assigned to them, THEN THE System SHALL return a 403 status
7. IF a manager attempts to action a leave request that is not in `Pending` status, THEN THE System SHALL return a 400 status with a descriptive error

---

### Requirement 5: Team Calendar

**User Story:** As a user, I want to view a team calendar showing who is on leave, so that I can plan work around team availability.

#### Acceptance Criteria

1. WHEN a user requests the team calendar, THE System SHALL return all `Approved` Leave_Request records for the current week and the next week
2. WHEN a user filters the team calendar by leave type, THE System SHALL return only records matching the specified Leave_Type
3. THE System SHALL include the employee's name and leave type in each calendar entry
4. THE System SHALL define "current week" as Monday through Sunday of the current calendar week

---

### Requirement 6: Backend API Standards

**User Story:** As a developer, I want the backend to follow REST standards with proper validation and status codes, so that the API is reliable and testable in Postman.

#### Acceptance Criteria

1. THE System SHALL use proper HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
2. THE System SHALL perform server-side validation on all incoming request bodies independent of frontend validation
3. WHEN an unhandled error occurs, THE System SHALL return a 500 status with a generic error message and log the error server-side
4. THE System SHALL expose all APIs as RESTful endpoints accessible and testable via Postman
5. THE System SHALL use CORS middleware to allow requests from the configured frontend origin

---

### Requirement 7: Database Design

**User Story:** As a developer, I want well-structured database models, so that data is consistent and relationships are clear.

#### Acceptance Criteria

1. THE System SHALL define a `User` model with fields: `name`, `email`, `password`, `role` (`employee` | `manager`), `leaveBalance` (object with keys: `Sick`, `Casual`, `WFH`, `Comp-off`)
2. THE System SHALL define a `LeaveRequest` model with fields: `userId` (ref User), `leaveType`, `startDate`, `endDate`, `workingDays`, `reason`, `status`, `managerId` (ref User), `managerComment`, `actionDate`
3. THE `LeaveRequest` model SHALL default `status` to `Pending`
4. THE System SHALL enforce unique email addresses in the `User` model
5. THE System SHALL use Mongoose schema validation to enforce required fields at the database level

---

### Requirement 8: Seed Data

**User Story:** As a developer, I want realistic seed data, so that I can test all features without manually creating records.

#### Acceptance Criteria

1. THE Seed_Script SHALL create exactly 20 employee users and 3 manager users (23 total)
2. THE Seed_Script SHALL create between 25 and 30 Leave_Request records with varied statuses (`Pending`, `Approved`, `Rejected`) and leave types
3. THE Seed_Script SHALL assign realistic Leave_Balance values to each user
4. WHEN the Seed_Script is run, THE System SHALL clear existing data before inserting seed records to ensure idempotency
5. THE Seed_Script SHALL be runnable via a single npm script command

---

### Requirement 9: Frontend Pages & UI

**User Story:** As a user, I want a clean, responsive UI, so that I can use the application comfortably on any device.

#### Acceptance Criteria

1. THE System SHALL provide a Login page with mock role selection (employee / manager)
2. THE System SHALL provide an Employee Dashboard page showing leave balance, leave history with filters, and pending requests
3. THE System SHALL provide an Apply Leave form page with fields for leave type, start date, end date, reason, and manager selection
4. THE System SHALL provide a Manager Dashboard page showing pending requests with approve/reject actions and optional comment input
5. THE System SHALL provide a Team Calendar page showing approved leaves for the current and next week with leave type filter
6. WHEN an API call is in progress, THE System SHALL display a loading indicator
7. WHEN an API call fails, THE System SHALL display a descriptive error message to the user
8. THE System SHALL use Tailwind CSS for styling and be responsive across desktop and mobile viewports

---

### Requirement 10: Frontend–Backend Integration

**User Story:** As a developer, I want the frontend to communicate with the backend via Axios, so that data flows correctly between layers.

#### Acceptance Criteria

1. THE System SHALL configure an Axios base URL pointing to the backend API
2. WHEN a user logs in, THE System SHALL store the JWT token and use it in the Authorization header for all subsequent requests
3. WHEN an API returns a success response, THE System SHALL display a success message or update the UI state accordingly
4. WHEN an API returns an error response, THE System SHALL display the error message returned by the server
5. THE System SHALL use React hooks and a `services/` layer to separate API call logic from UI components
