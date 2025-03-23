import { useState } from "react";
import { href, useNavigate } from "react-router-dom";

import AdminLogin from "../src/Login and Signup Component/adminLogin.jsx"
import EmployeeLogin from "./Login and Signup Component/EmployeeLogin.jsx"
import AdminSignup from "./Login and Signup Component/adminSignup.jsx"
import EmployeeSignup from "./Login and Signup Component/EmployeeSignup.jsx"

const AuthForm = ({ isAdmin, isSignup, setIsSignup,setIsAdmin,onAuthSuccess }) => {

      return (
        <div className="login-container">
          <div className="login-card">
            <div>
                <h1 style={{textAlign:"center", color:"#3fb4d7"}}>Pension Management System</h1>
            </div>
            <div className="toggle-buttons">
                <button
                    className={`toggle-button ${!isAdmin ? "active" : ""}`} // Active when isAdmin is false
                    onClick={() => setIsAdmin(false)}>
                    Employee
                </button>
                <button
                    className={`toggle-button ${isAdmin ? "active" : ""}`} // Active when isAdmin is true
                    onClick={() => setIsAdmin(true)}>
                    Admin
                </button>
            </div>
            {isAdmin ? isSignup ? <AdminSignup onAuthSuccess={onAuthSuccess} /> 
            
            : <AdminLogin onAuthSuccess={onAuthSuccess} /> 
            
            : isSignup ? <EmployeeSignup onAuthSuccess={onAuthSuccess} /> 
            : (<EmployeeLogin onAuthSuccess={onAuthSuccess} />

            )};
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


export default AuthForm;