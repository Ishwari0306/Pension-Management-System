import { useState } from "react";

export default function EmployeeSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salary, setSalary] = useState(0);
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [companyName,setCompanyName]=useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/PMS/employee/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          salary,
          dateOfJoining, 
          companyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Employee signup successful:", data);

      setError("");
    
    } catch (err) {
      console.error("Error during employee signup:", err);
      setError("Failed to sign up. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="login-subtitle">Employee Signup</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="salary">Salary</label>
        <input
          type="number"
          id="salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="dateOfJoining">Date of Joining</label>
        <input
          type="date"
          id="dateOfJoining"
          value={dateOfJoining}
          onChange={(e) => setDateOfJoining(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
      <label htmlFor="companyName">Company</label>
      <select 
        value={companyName}
        onChange={(e)=>setCompanyName(e.target.value)}
        required
      >
        <option value="">Select Company</option>
        <option value="Company A">Company A</option>
        <option value="Company B">Company B</option>
      </select>
      </div>
      <button type="submit" className="submit-button">
        Sign Up
      </button>
    </form>
  );
}