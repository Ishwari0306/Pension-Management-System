import { useState } from "react";

export default function AdminSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

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
    } catch (err) {
      console.error("Error creating admin:", err);
      setError("Failed to create admin");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Signup</h2>
      {error && <p>{error}</p>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      >
        <option value="">Select Company</option>
        <option value="Company A">Company A</option>
        <option value="Company B">Company B</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
}