import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';


// Navigation menu component
const NavMenu = ({ isAdmin }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/home' },
    { name: 'Profile', path: '/profile' },
    ...(isAdmin ? [
      { name: 'Manage Employees', path: '/manage-employees' },
      { name: 'Company Settings', path: '/company-settings' }
    ] : [
      { name: 'Apply for Pension Scheme', path: '/apply-pension-scheme' }, 
      { name: 'Application History', path: '/application-history' },
      { name: 'Pension Calculator', path: '/pension-calculator' },
      { name: 'Documents', path: '/documents' }
    ])
  ];

  return (
    <div style={{
      backgroundColor: 'var(--card-background)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Navigation</h2>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link to={item.path} style={{
              backgroundColor: window.location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
              color: window.location.pathname === item.path ? 'white' : 'var(--text-color)',
              padding: '8px 16px',
              borderRadius: '5px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main Home component
const Home = () => {
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Calculate some example metrics for employee dashboard
  const calculateEmployeeMetrics = () => {
    if (!userData) return {};
    
    const joiningDate = new Date(userData.dateOfJoining);
    const currentDate = new Date();
    const monthsEmployed = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - joiningDate.getMonth());
    
    const contributionPerMonth = userData.salary * 0.05; // Assuming 5% contribution
    const totalContribution = contributionPerMonth * monthsEmployed;
    const projectedPension = userData.salary * 0.4; // Example calculation
    
    return {
      monthsEmployed,
      totalContribution: totalContribution.toFixed(2),
      projectedPension: projectedPension.toFixed(2)
    };
  };

  // Example admin metrics
  const calculateAdminMetrics = () => {
    // These would come from API in real implementation
    return {
      totalEmployees: 42,
      avgContribution: "3,850.00",
      pensioners: 5
    };
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const metrics = isAdmin ? calculateAdminMetrics() : calculateEmployeeMetrics();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: 'var(--primary-color)' }}>
          {isAdmin ? 'Admin Dashboard' : 'Employee Dashboard'}
        </h1>
        <div>
          <span style={{ marginRight: '15px' }}>
            Welcome {userData?.name}
          </span>
          <button
            onClick={() => navigate('/profile')}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
        </div>
      </div>

      <NavMenu isAdmin={isAdmin} />

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {isAdmin ? (
          <>
            <DashboardCard 
              title="Total Employees" 
              value={metrics.totalEmployees} 
              icon="👥" 
              color="#3498db"
            />
            <DashboardCard 
              title="Avg. Contribution" 
              value={`$${metrics.avgContribution}`} 
              icon="💰" 
              color="#2ecc71"
            />
            <DashboardCard 
              title="Pensioners" 
              value={metrics.pensioners} 
              icon="👴" 
              color="#e67e22"
            />
            <DashboardCard 
              title="Companies" 
              value="1" 
              icon="🏢" 
              color="#9b59b6"
            />
          </>
        ) : (
          <>
            <DashboardCard 
              title="Months of Service" 
              value={metrics.monthsEmployed} 
              icon="⏱️" 
              color="#3498db"
            />
            <DashboardCard 
              title="Total Contribution" 
              value={`$${metrics.totalContribution}`} 
              icon="💰" 
              color="#2ecc71"
            />
            <DashboardCard 
              title="Monthly Salary" 
              value={`$${userData?.salary}`} 
              icon="💵" 
              color="#e67e22"
            />
            <DashboardCard 
              title="Projected Pension" 
              value={`$${metrics.projectedPension}`} 
              icon="🎯" 
              color="#9b59b6"
            />
          </>
        )}
      </div>

      {/* Quick Actions Section */}
      <div style={{
        backgroundColor: 'var(--card-background)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Quick Actions</h2>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {isAdmin ? (
            <>
              <button style={buttonStyle}>Add New Employee</button>
              <button style={buttonStyle}>Generate Reports</button>
              <button style={buttonStyle}>Update Company Info</button>
              <button style={buttonStyle}>Manage Pension Plans</button>
            </>
          ) : (
            <>
              <button style={buttonStyle}>Calculate Pension</button>
              <button style={buttonStyle}>Update Personal Info</button>
              <button style={buttonStyle}>Download Statements</button>
              <button style={buttonStyle}>Contact Admin</button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity Section - This would be populated with real data in a full implementation */}
      <div style={{
        backgroundColor: 'var(--card-background)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Recent Activity</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tableCellStyle}>{new Date().toLocaleDateString()}</td>
              <td style={tableCellStyle}>
                {isAdmin ? 'Employee report generated' : 'Monthly contribution processed'}
              </td>
              <td style={tableCellStyle}>
                <span style={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  Completed
                </span>
              </td>
            </tr>
            <tr>
              <td style={tableCellStyle}>{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
              <td style={tableCellStyle}>
                {isAdmin ? 'New employee added' : 'Profile information updated'}
              </td>
              <td style={tableCellStyle}>
                <span style={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  Completed
                </span>
              </td>
            </tr>
            <tr>
              <td style={tableCellStyle}>{new Date(Date.now() - 172800000).toLocaleDateString()}</td>
              <td style={tableCellStyle}>
                {isAdmin ? 'Pension calculation updated' : 'Document uploaded'}
              </td>
              <td style={tableCellStyle}>
                <span style={{
                  backgroundColor: '#fff8e1',
                  color: '#f57c00',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles for reuse
const buttonStyle = {
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '12px 15px',
  borderBottom: '1px solid #ddd',
  backgroundColor: '#f8f9fa'
};

const tableCellStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #ddd'
};

export default Home;