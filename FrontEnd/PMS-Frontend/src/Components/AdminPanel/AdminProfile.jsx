import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastLogin, setLastLogin] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        // Fetch admin profile data
        const adminResponse = await fetch('http://localhost:5000/PMS/admin/profile', {
          headers: { 'token': token }
        });

        if (!adminResponse.ok) throw new Error('Failed to fetch admin data');
        const adminProfileData = await adminResponse.json();
        
        // Set admin data
        setAdminData({
          name: adminProfileData.name || 'N/A',
          email: adminProfileData.email || 'N/A',
          companyId: adminProfileData.companyId || 'N/A'
        });

        // Set company data from profile response
        setCompanyData({
          name: adminProfileData.companyName || 'N/A',
          address: adminProfileData.companyAddress || 'N/A',
          totalEmployees: adminProfileData.totalEmployees || 0,
          activeSchemes: adminProfileData.activeSchemes || 0
        });

        // Fetch employees data
        const employeesResponse = await fetch('http://localhost:5000/PMS/admin/employees', {
          headers: { 'token': token }
        });

        if (!employeesResponse.ok) throw new Error('Failed to fetch employees data');
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (!employees.length) return null;

    const activeEmployees = employees.filter(emp => emp.status === 'Accepted').length;
    const pendingEmployees = employees.filter(emp => emp.status === 'Pending').length;
    const rejectedEmployees = employees.filter(emp => emp.status === 'Rejected').length;

    // Monthly contributions
    const monthlyContributions = {};
    employees.forEach(emp => {
      if (emp.appliedSchemes && emp.appliedSchemes.length > 0) {
        emp.appliedSchemes.forEach(scheme => {
          if (scheme.appliedAt) {
            const monthYear = new Date(scheme.appliedAt).toLocaleString('default', { 
              month: 'short', 
              year: 'numeric' 
            });
            
            if (!monthlyContributions[monthYear]) {
              monthlyContributions[monthYear] = 0;
            }
            monthlyContributions[monthYear] += scheme.investmentAmount || 0;
          }
        });
      }
    });

    // Upcoming retirements
    const upcomingRetirements = employees.reduce((count, emp) => {
      if (!emp.appliedSchemes) return count;
      
      const hasUpcoming = emp.appliedSchemes.some(scheme => {
        if (!scheme.appliedAt || !scheme.schemeId) return false;
        
        const appliedDate = new Date(scheme.appliedAt);
        const retirementDate = new Date(appliedDate);
        const duration = typeof scheme.schemeId === 'object' ? 
                       scheme.schemeId.duration : 0;
                       
        retirementDate.setFullYear(retirementDate.getFullYear() + duration);
        return retirementDate > new Date() && retirementDate < new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      });
      return hasUpcoming ? count + 1 : count;
    }, 0);

    return {
      activeEmployees,
      pendingEmployees,
      rejectedEmployees,
      monthlyContributions,
      upcomingRetirements,
      totalContributions: employees.reduce((total, emp) => {
        if (!emp.appliedSchemes) return total;
        return total + emp.appliedSchemes.reduce((sum, scheme) => sum + (scheme.investmentAmount || 0), 0);
      }, 0),
      companyContributions: employees.reduce((total, emp) => {
        if (!emp.appliedSchemes) return total;
        return total + emp.appliedSchemes.reduce((sum, scheme) => sum + (scheme.investmentAmount || 0) * 0.12, 0);
      }, 0)
    };
  };

  const analyticsData = calculateAnalytics();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Admin Profile</h1>
      
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Profile Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Reports & Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Details
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-header">
              <h2>Admin Information</h2>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Name</span>
                <span className="detail-value">{adminData?.name || 'N/A'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{adminData?.email || 'N/A'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">Pension Administrator</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Last Login</span>
                <span className="detail-value">{lastLogin}</span>
              </div>
            </div>
          </div>
          
          <br />
          <br />
          <div className="profile-card">
            <div className="profile-header">
              <h2>Company Information</h2>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Company Name</span>
                <span className="detail-value">{companyData?.name || 'N/A'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Company Address</span>
                <span className="detail-value">{companyData?.address || 'N/A'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Total Employees</span>
                <span className="detail-value">{companyData?.totalEmployees || 0}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Active Schemes</span>
                <span className="detail-value">{companyData?.activeSchemes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analyticsData && (
        <div className="analytics-section">
          <div className="dashboard-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Employees</h3>
                <p>{companyData?.totalEmployees || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#388e3c">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Active Employees</h3>
                <p>{analyticsData.activeEmployees}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fb8c00">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9v-2h2v-2c0-.55.45-1 1-1s1 .45 1 1v2h2v2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Upcoming Retirements</h3>
                <p>{analyticsData.upcomingRetirements}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f3e5f5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#8e24aa">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Company Contributions</h3>
                <p>₹{analyticsData.companyContributions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Monthly Contributions (₹)</h3>
              {analyticsData.monthlyContributions && Object.keys(analyticsData.monthlyContributions).length > 0 ? (
                <Bar 
                  data={{
                    labels: Object.keys(analyticsData.monthlyContributions),
                    datasets: [{
                      label: 'Monthly Contributions',
                      data: Object.values(analyticsData.monthlyContributions),
                      backgroundColor: '#4a6baf'
                    }]
                  }} 
                  options={{ responsive: true }}
                />
              ) : (
                <p>No contribution data available</p>
              )}
            </div>
            
            <div className="analytics-card">
              <h3>Employee Status</h3>
              <Pie 
                data={{
                  labels: ['Active', 'Pending', 'Rejected'],
                  datasets: [{
                    data: [
                      analyticsData.activeEmployees, 
                      analyticsData.pendingEmployees, 
                      analyticsData.rejectedEmployees
                    ],
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
                  }]
                }} 
                options={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="employee-section">
          <h2>Employee Pension Scheme Details</h2>
          
          {employees.length === 0 ? (
            <div className="no-data">No employee data available</div>
          ) : (
            <div className="employee-list">
              {employees.map(employee => (
                <div key={employee._id} className="employee-card">
                  <div className="employee-summary">
                    <div className="employee-info">
                      <span className="employee-name">{employee.name}</span>
                      <span className="employee-email">{employee.email}</span>
                      
                    </div>
                  </div>
                  
                  <div className="scheme-details">
                    {employee.appliedSchemes && employee.appliedSchemes.length > 0 ? (
                      employee.appliedSchemes.map(scheme => (
                        <div key={scheme._id} className="scheme-card">
                          <div className="scheme-header">
                            <h3>
                              {typeof scheme.schemeId === 'object' ? 
                                scheme.schemeId.name : 
                                'Unknown Scheme'}
                            </h3>
                            <span className={`status-tag ${scheme.status.toLowerCase()}`}>
                              {scheme.status}
                            </span>
                          </div>
                          
                          <div className="scheme-body">
                            <div className="scheme-row">
                              <div className="scheme-info">
                                <label>Employee Contribution</label>
                                <p>₹{(scheme.investmentAmount || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="scheme-info">
                                <label>Company Contribution</label>
                                <p>₹{((scheme.investmentAmount || 0) * 0.12).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            
                            <div className="scheme-row">
                              <div className="scheme-info">
                                <label>Total Contribution</label>
                                <p>₹{((scheme.investmentAmount || 0) * 1.12).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="scheme-info">
                                <label>Scheme Duration</label>
                                <p>
                                  {typeof scheme.schemeId === 'object' ? 
                                    scheme.schemeId.duration : 
                                    'N/A'} years
                                </p>
                              </div>
                            </div>
                            
                            <div className="scheme-row">
                              <div className="scheme-info">
                                <label>Start Date</label>
                                <p>{scheme.appliedAt ? new Date(scheme.appliedAt).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div className="scheme-info">
                                <label>Maturity Date</label>
                                <p>
                                  {scheme.appliedAt && typeof scheme.schemeId === 'object' && scheme.schemeId.duration ? 
                                    new Date(new Date(scheme.appliedAt).setFullYear(
                                      new Date(scheme.appliedAt).getFullYear() + scheme.schemeId.duration
                                    )).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {scheme.adminNote && (
                              <div className="admin-notes">
                                <label>Admin Notes</label>
                                <p>{scheme.adminNote}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-schemes">No pension schemes applied</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;