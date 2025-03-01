import { useState } from "react"

export default function AdminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
  
    const handleSubmit = (e) => {
      e.preventDefault()
      // Implement admin login logic here
      console.log("Admin login:", { email, password })
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <h2 className="login-subtitle">Admin Login</h2>
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
