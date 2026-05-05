import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LoginLanding from './pages/LoginLanding';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import ManagerDashboard from './pages/ManagerDashboard';
import AddEmployeePage from './pages/AddEmployeePage';
import EmployeesPage from './pages/EmployeesPage';
import LeaveHistoryPage from './pages/LeaveHistoryPage';
import ProfilePage from './pages/ProfilePage';
import TeamCalendar from './pages/TeamCalendar';

/**
 * ProtectedRoute
 * Redirects to /login if no token is in localStorage.
 * Optionally enforces a required role.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  if (requiredRole) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role !== requiredRole) {
        return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — login */}
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/login/employee" element={<Login role="employee" />} />
        <Route path="/login/manager" element={<Login role="manager" />} />

        {/* Employee routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute requiredRole="employee">
              <ApplyLeave />
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-employee"
          element={
            <ProtectedRoute requiredRole="manager">
              <AddEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredRole="manager">
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <TeamCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-history"
          element={
            <ProtectedRoute requiredRole="manager">
              <LeaveHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
