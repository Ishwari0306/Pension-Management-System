import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import AuthForm from './AuthForm.jsx';
import Header from './Components/Header.jsx';

// Home Component
const Home = () => {
  return (
    <div>
      <Header />
      <h1>Welcome to the Home Page!</h1>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if the user is authenticated
  if (!token) {
    return <Navigate to="/" replace />; // Redirect to login if no token
  }
  return children; // Render the protected component if authenticated
};

// AuthFormWrapper Component
const AuthFormWrapper = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleAuthSuccess = () => {
    navigate('/home'); // Navigate to home page after successful auth
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

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Page (Login/Signup) */}
        <Route path="/" element={<AuthFormWrapper />} />

        {/* Protected Home Page */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;