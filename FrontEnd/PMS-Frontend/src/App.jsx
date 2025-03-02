import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AdminLogin from "../src/Login and Signup Component/adminLogin.jsx"
import EmployeeLogin from "./Login and Signup Component/EmployeeLogin.jsx"
import AdminSignup from "./Login and Signup Component/adminSignup.jsx"
import EmployeeSignup from "./Login and Signup Component/EmployeeSignup.jsx"
import AuthForm from './AuthForm.jsx'

function App() {
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  return (
    <div className="App">
      <AuthForm
        isAdmin={isAdmin}
        isSignup={isSignup}
        setIsAdmin={setIsAdmin}
        setIsSignup={setIsSignup}
      />
    </div>
  );

}

export default App
