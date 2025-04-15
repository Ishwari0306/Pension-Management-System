import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ title, children }) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      backgroundColor: 'white',
    }}>
      <h2 style={{ 
        color: '#2c3e50', 
        marginBottom: '20px',
        fontSize: '1.5rem',
        fontWeight: '600',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
};

const InvestmentSchemeCard = ({ scheme }) => {
  const statusColors = {
    'Accepted': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
    'Pending': { bg: '#fff8e1', text: '#ff8f00', border: '#ffe082' },
    'Rejected': { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' }
  };

  const statusStyle = statusColors[scheme.status] || statusColors['Pending'];

  return (
    <div style={{
      border: `1px solid ${statusStyle.border}`,
      borderRadius: '8px',
      padding: '16px',
      margin: '12px 0',
      backgroundColor: statusStyle.bg,
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          margin: 0,
          fontSize: '1.1rem'
        }}>
          {scheme.schemeName}
        </h3>
        <span style={{
          backgroundColor: statusStyle.border,
          color: statusStyle.text,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {scheme.status}
        </span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px',
        fontSize: '0.9rem'
      }}>
        <div>
          <p style={{ margin: '6px 0' }}>
            <strong>Invested Amount:</strong> 
            <span style={{ 
              color: '#2c3e50',
              fontWeight: '600',
              marginLeft: '6px'
            }}>
              ₹{scheme.investmentAmount?.toLocaleString('en-IN') || '0'}
            </span>
          </p>
          <p style={{ margin: '6px 0' }}>
            <strong>Monthly Contribution:</strong> 
            <span style={{ 
              color: '#2c3e50',
              fontWeight: '600',
              marginLeft: '6px'
            }}>
              ₹{(scheme.investmentAmount || 0).toLocaleString('en-IN')}
            </span>
          </p>
        </div>
        <div>
          <p style={{ margin: '6px 0' }}>
            <strong>Applied On:</strong> 
            <span style={{ marginLeft: '6px' }}>
              {new Date(scheme.appliedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </p>
          {scheme.adminNote && (
            <p style={{ margin: '6px 0' }}>
              <strong>Admin Note:</strong> 
              <span style={{ 
                color: '#666',
                fontStyle: 'italic',
                marginLeft: '6px'
              }}>
                {scheme.adminNote}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, color }) => {
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      padding: '16px',
      textAlign: 'center',
      borderLeft: `4px solid ${color}`
    }}>
      <h3 style={{ 
        margin: '0 0 8px 0',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: '0',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#343a40'
      }}>
        {value}
      </p>
      {subtext && (
        <p style={{ 
          margin: '8px 0 0 0',
          fontSize: '0.7rem',
          color: '#6c757d'
        }}>
          {subtext}
        </p>
      )}
    </div>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/PMS/employee/profile", {
          headers: {
            "token": token,
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);

        const schemesResponse = await fetch("http://localhost:5000/PMS/employee/applied-schemes", {
          headers: {
            "token": token,
          }
        });
        
        if (schemesResponse.ok) {
          const schemesData = await schemesResponse.json();
          setAppliedSchemes(schemesData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);
 
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const calculateYearsToRetirement = () => {
    if (!userData?.dateOfBirth) return 0;
    const currentAge = calculateAge(userData.dateOfBirth);
    return Math.max(0, 60 - currentAge);
  };

  const calculateTotalInvested = () => {
    if (appliedSchemes.length === 0) return 0;
    
    const today = new Date();
    
    return appliedSchemes
      .filter(scheme => scheme.status === 'Accepted')
      .reduce((total, scheme) => {
        const appliedDate = new Date(scheme.appliedAt);
        const monthsInvested = (today.getFullYear() - appliedDate.getFullYear()) * 12 + 
                              (today.getMonth() - appliedDate.getMonth());
        
        // Ensure at least 1 month if applied this month
        const effectiveMonths = Math.max(1, monthsInvested);
        
        return total + (scheme.investmentAmount || 0) * effectiveMonths;
      }, 0);
  };
  
  const calculateEstimatedPension = () => {
    if (!userData?.dateOfBirth || appliedSchemes.length === 0) return 0;
    
    const yearsToRetirement = calculateYearsToRetirement();
    if (yearsToRetirement <= 0) return 0;

    // Calculate future value with monthly compounding
    const monthlyRate = (scheme) => scheme.interestRate / 12 / 100;
    const totalMonths = yearsToRetirement * 12;

    const futureValue = appliedSchemes
        .filter(scheme => scheme.status === 'Accepted')
        .reduce((total, scheme) => {
            const rate = monthlyRate(scheme);
            const monthsRemaining = Math.min(
                scheme.tenureYears * 12, 
                totalMonths
            );
            const monthlyContribution = scheme.investmentAmount;
            
            // Future value of an annuity formula
            const fv = monthlyContribution * 
                (Math.pow(1 + rate, monthsRemaining) - 1) / rate;
            
            return total + fv;
        }, 0);

    // Estimate monthly pension (divide by scheme duration in months)
    const longestTenureMonths = Math.max(
        ...appliedSchemes
            .filter(scheme => scheme.status === 'Accepted')
            .map(scheme => scheme.tenureYears * 12),
        300 // Default: 25 years (300 months)
    );

    return futureValue / longestTenureMonths;
  };

  const calculateReadinessScore = () => {
    const targetPension = userData?.salary * 0.7; // 70% of salary
    const estimated = calculateEstimatedPension();
    return Math.min(100, Math.round((estimated / targetPension) * 100));
  };
  
  
  const calculateTotalMonthlyInvestment = () => {
    return appliedSchemes
      .filter(scheme => scheme.status === 'Accepted')
      .reduce((total, scheme) => total + (scheme.investmentAmount || 0), 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#e74c3c',
        fontSize: '1.2rem'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ 
            color: '#2c3e50', 
            margin: 0,
            fontSize: '1.8rem'
          }}>
            Employee Profile
          </h1>
          <p style={{ 
            color: '#7f8c8d', 
            margin: '5px 0 0 0',
            fontSize: '0.9rem'
          }}>
            {userData?.employeeId}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: '#c0392b'
            }
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          <ProfileCard title="Personal Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '60px' }}>Name:</strong>
                  <span>{userData?.name}</span>
                </p>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '60px' }}>Email:</strong>
                  <span>{userData?.email}</span>
                </p>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '110px' }}>Date of Birth:</strong>
                  <span>
                    {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '140px' }}>Date of Joining:</strong>
                  <span>
                    {userData?.dateOfJoining ? new Date(userData.dateOfJoining).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </p>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '60px' }}>Salary:</strong>
                  <span>₹{Number(userData?.salary || 0).toLocaleString('en-IN')}</span>
                </p>
                <p style={{ margin: '10px 0' }}>
                  <strong style={{ display: 'inline-block', width: '40px' }}>Age:</strong>
                  <span>
                    {userData?.dateOfBirth ? `${calculateAge(userData.dateOfBirth)} years` : 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          </ProfileCard>

          <ProfileCard title="Pension Summary">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <StatCard 
                title="Total Invested" 
                value={`₹${calculateTotalInvested().toLocaleString('en-IN')}`} 
                subtext="Includes all accepted schemes"
                color="#3498db"
              />
              <StatCard 
                title="Monthly Investment" 
                value={`₹${calculateTotalMonthlyInvestment().toLocaleString('en-IN')}`} 
                subtext="Current monthly contribution"
                color="#9b59b6"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <StatCard 
                title="Years to Retirement" 
                value={calculateYearsToRetirement()} 
                subtext={`Retirement age: 60 years`}
                color="#e67e22"
              />
            </div>
          </ProfileCard>
        </div>

        {/* Right Column */}
        <div>
          <ProfileCard title={appliedSchemes.length > 0 ? "Your Pension Schemes" : "Pension Schemes"}>
            {appliedSchemes.length > 0 ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '15px',
                  alignItems: 'center'
                }}>
                  <p style={{ margin: 0, color: '#7f8c8d' }}>
                    {appliedSchemes.filter(s => s.status === 'Accepted').length} active schemes
                  </p>
                  <button 
                    onClick={() => navigate('/apply-pension-scheme')}
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        backgroundColor: '#2980b9'
                      }
                    }}
                  >
                    Apply for New Scheme
                  </button>
                </div>
                
                {appliedSchemes.map((scheme, index) => (
                  <InvestmentSchemeCard key={index} scheme={scheme} />
                ))}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                color: '#7f8c8d'
              }}>
                <p style={{ marginBottom: '20px' }}>You haven't applied to any pension schemes yet.</p>
                <button 
                  onClick={() => navigate('/apply-pension-scheme')}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: '#2980b9'
                    }
                  }}
                >
                  Browse Available Schemes
                </button>
              </div>
            )}
          </ProfileCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;