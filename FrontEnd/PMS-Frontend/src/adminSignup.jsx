"use client"

import { useState } from "react"

export default function AdminSignup() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
  
    const handleSubmit = (e) => {
      e.preventDefault()
      // Implement admin signup logic here
      console.log("Admin signup:", { name, email, password })
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <h2 className="login-subtitle">Admin Signup</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>
    )
  }

