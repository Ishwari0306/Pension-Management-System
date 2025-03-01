import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AdminLogin from "./adminLogin.jsx"
import EmployeeLogin from "./EmployeeLogin.jsx"
import AdminSignup from "./adminSignup.jsx"
import EmployeeSignup from "./EmployeeSignup.jsx"

function App() {
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Pension Management System</h1>
        <div className="toggle-buttons">
          <button className={`toggle-button ${!isAdmin ? "active" : ""}`} onClick={() => setIsAdmin(false)}>
            Employee
          </button>
          <button className={`toggle-button ${isAdmin ? "active" : ""}`} onClick={() => setIsAdmin(true)}>
            Admin
          </button>
        </div>
        {isAdmin ? isSignup ? <AdminSignup /> : <AdminLogin /> : isSignup ? <EmployeeSignup /> : <EmployeeLogin />}
        <p className="switch-mode">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button className="switch-button" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )

}

export default App
