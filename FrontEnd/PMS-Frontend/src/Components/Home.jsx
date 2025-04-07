import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiDollarSign, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import HeaderPMS from './HeaderPMS';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'translateY(-5px)'
      }
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            margin: '0 0 8px 0',
            color: '#7f8c8d',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            {title}
          </p>
          <p style={{ 
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#2c3e50'
          }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/PMS/employee/profile", {
          headers: { "token": token }
        });

        if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);

        const data = await response.json();
        setUserData(data);

        const schemesResponse = await fetch("http://localhost:5000/PMS/employee/applied-schemes", {
          headers: { "token": token }
        });
        
        if (schemesResponse.ok) {
          setAppliedSchemes(await schemesResponse.json());
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || 
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateMetrics = () => {
    if (!userData) return {};
    
    // Service duration
    const joiningDate = new Date(userData.dateOfJoining);
    const currentDate = new Date();
    const monthsEmployed = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - joiningDate.getMonth());

    // Pension calculations
    const activeSchemes = appliedSchemes.filter(s => s.status === 'Accepted');
    const totalMonthlyInvestment = activeSchemes.reduce((sum, scheme) => sum + (scheme.investmentAmount || 0), 0);
    const yearsToRetirement = Math.max(0, 60 - calculateAge(userData.dateOfBirth));
    
    return {
      monthsEmployed,
      totalMonthlyInvestment: `₹${totalMonthlyInvestment.toLocaleString('en-IN')}`,
      salary: `₹${userData.salary.toLocaleString('en-IN')}`,
      activeSchemes: activeSchemes.length,
      yearsToRetirement
    };
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <HeaderPMS />
      
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '30px 20px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            margin: 0,
            fontSize: '1.8rem',
            color: '#2c3e50',
            fontWeight: 600
          }}>
            Welcome back, {userData?.name}
          </h2>
          <button
            onClick={() => navigate('/apply-pension-scheme')}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#2980b9'
              }
            }}
          >
            <FiTrendingUp size={18} />
            Apply for New Scheme
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <StatCard 
            title="Months of Service" 
            value={metrics.monthsEmployed} 
            icon={FiClock} 
            color="#3498db"
          />
          <StatCard 
            title="Monthly Salary" 
            value={metrics.salary} 
            icon={FiDollarSign} 
            color="#2ecc71"
          />
          <StatCard 
            title="Active Schemes" 
            value={metrics.activeSchemes} 
            icon={FiCheckCircle} 
            color="#9b59b6"
          />
          <StatCard 
            title="Years to Retirement" 
            value={metrics.yearsToRetirement} 
            icon={FiTrendingUp} 
            color="#e67e22"
          />
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            color: '#2c3e50',
            fontSize: '1.2rem'
          }}>
            Quick Actions
          </h3>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <button 
              onClick={() => navigate('/profile')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#2c3e50',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e2e8f0'
                }
              }}
            >
              View Profile
            </button>
            <button 
              onClick={() => navigate('/apply-pension-scheme')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#2c3e50',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px', 
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e2e8f0'
                }
              }}
            >
              Browse Schemes
            </button>
            <button 
              onClick={() => navigate('/pension-calculator')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#2c3e50',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e2e8f0'
                }
              }}
            >
              <FaCalculator size={18} />
              Pension Calculator
            </button>
            <button 
              onClick={() => navigate('/application-history')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#2c3e50',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e2e8f0'
                }
              }}
            >
              Application History
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {appliedSchemes.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0',
              color: '#2c3e50',
              fontSize: '1.2rem'
            }}>
              Recent Scheme Applications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appliedSchemes.slice(0, 3).map((scheme, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  <div>
                    <p style={{ 
                      margin: '0 0 5px 0',
                      fontWeight: 500,
                      color: '#2c3e50'
                    }}>
                      {scheme.schemeName}
                    </p>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#7f8c8d'
                    }}>
                      Applied on {new Date(scheme.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    backgroundColor: 
                      scheme.status === 'Accepted' ? '#e8f5e9' : 
                      scheme.status === 'Rejected' ? '#ffebee' : '#fff8e1',
                    color: 
                      scheme.status === 'Accepted' ? '#2e7d32' : 
                      scheme.status === 'Rejected' ? '#c62828' : '#f57c00'
                  }}>
                    {scheme.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;