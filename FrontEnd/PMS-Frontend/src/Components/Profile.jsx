import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ title, children }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'var(--card-background)',
    }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>{title}</h2>
      {children}
    </div>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Try fetching as employee first
        let response = await fetch("http://localhost:5000/PMS/employee/profile", {
          headers: {
            "token":token,
          }
        });
        

        if (response.status === 401 || response.status === 404) {
          // If not an employee, try as admin
          response = await fetch("http://localhost:5000/PMS/admin/profile", {
            headers: {
              "token": token,
            }
          });
          
          if (response.ok) {
            setIsAdmin(true);
          }
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>My Profile</h1>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <ProfileCard title="Personal Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <p><strong>Name:</strong> {userData?.name}</p>
            <p><strong>Email:</strong> {userData?.email}</p>
            {isAdmin ? (
              <p><strong>Role:</strong> Administrator</p>
            ) : (
              <>
                <p><strong>Joined:</strong> {new Date(userData?.dateOfJoining).toLocaleDateString()}</p>
                <p><strong>Salary:</strong> ₹{Number(userData?.salary).toLocaleString()}</p>
              </>
            )}
            <p><strong>Company:</strong> {userData?.companyName}</p>
          </div>
        </div>
      </ProfileCard>
      
      {!isAdmin && (
        <ProfileCard title="Pension Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p><strong>Service Duration:</strong> {userData?.serviceDuration || 'Calculating...'}</p>
              <p><strong>Contribution to Date:</strong> ${userData?.totalContribution || (userData?.salary * 0.05 * Math.floor((new Date() - new Date(userData?.dateOfJoining)) / (30 * 24 * 60 * 60 * 1000))).toFixed(2)}</p>
              <p><strong>Estimated Monthly Pension:</strong> ${userData?.estimatedPension || (userData?.salary * 0.4).toFixed(2)}</p>
              <p><strong>Retirement Eligibility:</strong> {userData?.retirementEligibility || 'After 20 years of service'}</p>
            </div>
          </div>
        </ProfileCard>
      )}
      
      {isAdmin && (
        <ProfileCard title="Administrative Access">
          <div>
            <p>You have administrative privileges for {userData?.companyName}.</p>
            <button 
              onClick={() => navigate('/manage-employees')}
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Manage Employees
            </button>
          </div>
        </ProfileCard>
      )}
    </div>
  );
};

export default Profile;