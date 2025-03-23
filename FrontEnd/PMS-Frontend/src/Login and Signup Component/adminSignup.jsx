import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSignup({ onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/PMS/admin/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, companyName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create admin");
      }

      const data = await response.json();
      console.log("Admin created:", data);
      setError("");

      localStorage.setItem("token", data.token); // Store token in localStorage
      localStorage.setItem("userRole","admin");
      onAuthSuccess(); // Navigate to home page
    } catch (err) {
      console.error("Error creating admin:", err);
      setError("Failed to create admin");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="login-subtitle">Admin Signup</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
      <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
      </div>
      <div className="form-group">
      <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
      <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
      </div>
      <div className="form-group">
      <label htmlFor="companyName">Company</label>
        <select
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        >
          <option value="">Select Company</option>
          <option value="Company A">Company A</option>
          <option value="Company B">Company B</option>
        </select>
      </div>
      <div>
        <button type="submit" className="submit-button">Sign Up</button>
      </div>
      
    </form>
  );
}