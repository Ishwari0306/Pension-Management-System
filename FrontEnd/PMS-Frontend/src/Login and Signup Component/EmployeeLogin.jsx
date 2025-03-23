"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin({ onAuthSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error,setError]=useState("");
    const navigate=useNavigate();

    const handleSubmit = async(e) => {
      e.preventDefault()
      
      try{
        
        const response=await fetch("http://localhost:5000/PMS/employee/signin",{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data=await response.json();
        console.log("Login Successful:",data);

        localStorage.setItem("token",data.token);
        localStorage.setItem("userRole","employee");

        setError("");
        alert("Login successful!");

        onAuthSuccess();

        } 
        catch (err) {
          console.error("Error during login:", err);
          setError("Invalid email or password. Please try again.");

      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <h2 className="login-subtitle">Employee Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    )
  }
