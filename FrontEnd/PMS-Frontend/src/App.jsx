import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import AuthForm from './AuthForm.jsx';
import HeaderPMS from './Components/HeaderPMS.jsx';
import Profile from './Components/Profile.jsx';
import Home from './Components/Home.jsx';
import AdminHome from './Components/AdminPanel/AdminHome.jsx'; 
import AdminProfile from './Components/AdminPanel/AdminProfile.jsx';
import ApplyPensionScheme from './Components/Application and History/ApplyPensionScheme.jsx';
import ApplicationHistory from './Components/Application and History/ApplicationHistory.jsx';
import PensionCalculator from './Components/pension-calculator.jsx';

const ProtectedRoute = ({ children, isAdmin }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // Get the user's role from localStorage

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Redirect to the correct dashboard based on the user's role
  if (isAdmin && userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (!isAdmin && userRole === 'admin') {
    return <Navigate to="/admin/home" replace />;
  }

  return children;
};

const AuthFormWrapper = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleAuthSuccess = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      navigate('/admin/home'); // Navigate to admin home if the user is an admin
    } else {
      navigate('/home'); // Navigate to employee home if the user is an employee
    }
  };

  return (
    <AuthForm
      isAdmin={isAdmin}
      isSignup={isSignup}
      setIsAdmin={setIsAdmin}
      setIsSignup={setIsSignup}
      onAuthSuccess={handleAuthSuccess}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Page (Login/Signup) */}
        <Route path="/" element={<AuthFormWrapper />} />

        {/* Employee Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute isAdmin={false}>
              <HeaderPMS />
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAdmin={false}>
              <Profile />
            </ProtectedRoute>
          }
        />

<Route
          path="/apply-pension-scheme" // New route for applying to pension schemes
          element={
            <ProtectedRoute isAdmin={false}>
              <HeaderPMS />
              <ApplyPensionScheme />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application-history" // New route for viewing application history
          element={
            <ProtectedRoute isAdmin={false}>
              <HeaderPMS />
              <ApplicationHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute isAdmin={true}>
              <HeaderPMS />
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* Additional routes for future implementation */}
        <Route
          path="/pension-calculator"
          element={
            <ProtectedRoute isAdmin={false}>
              <PensionCalculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute isAdmin={false}>
              <div style={{ padding: '20px' }}>
                <h1>Documents</h1>
                <p>This feature is coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-employees"
          element={
            <ProtectedRoute isAdmin={true}>
              <div style={{ padding: '20px' }}>
                <h1>Manage Employees</h1>
                <p>This feature is coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-settings"
          element={
            <ProtectedRoute isAdmin={true}>
              <div style={{ padding: '20px' }}>
                <h1>Company Settings</h1>
                <p>This feature is coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for invalid paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;