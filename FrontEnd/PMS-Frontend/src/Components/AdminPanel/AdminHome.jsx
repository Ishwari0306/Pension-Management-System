import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';

const AdminHome = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/PMS/admin/employees', {
          headers: {
            'token': token,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [navigate]);

  const handleManageApplication = async (employeeId, schemeId, status, adminNote) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/PMS/admin/manage-pension-application', {
        method: 'POST',
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          schemeId,
          status,
          adminNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to manage application');
      }

      const data=await response.json();

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp._id === data.employee._id ? data.employee : emp
        )
      );
      
      // Show success feedback
      alert(`Application ${status.toLowerCase()} successfully!`);
      
    } catch (err) {
      console.error('Error managing application:', err);
    }
  };

  const toggleEmployeeExpansion = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p>{employees.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e1' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffa000">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p>{employees.reduce((count, emp) => count + emp.appliedSchemes.filter(scheme => scheme.status === 'Pending').length, 0)}</p>
          </div>
        </div>
      </div>

      <div className="employee-section">
        <h2>Pending Scheme Applications</h2>
        {employees.filter(emp => emp.appliedSchemes.some(s => s.status === 'Pending')).length === 0 ? (
          <div className="no-pending-applications">
            <p>No pending applications at this time.</p>
          </div>
        ) : (
          <div className="employee-list">
            {employees
              .filter(emp => emp.appliedSchemes.some(s => s.status === 'Pending'))
              .map((emp) => (
                <div key={emp._id} className="employee-card">
                  <div 
                    className="employee-summary"
                    onClick={() => toggleEmployeeExpansion(emp._id)}
                  >
                    <div className="employee-info">
                      <span className="employee-name">{emp.name}</span>
                      <span className="employee-email">{emp.email}</span>
                    </div>
                    <div className="employee-status">
                      <span className="status-badge pending">
                        {emp.appliedSchemes.filter(s => s.status === 'Pending').length} Pending
                      </span>
                    </div>
                    <div className="expand-icon">
                      {expandedEmployee === emp._id ? '▼' : '▶'}
                    </div>
                  </div>

                  {expandedEmployee === emp._id && (
                    <div className="scheme-details">
                      {emp.appliedSchemes
                        .filter(scheme => scheme.status === 'Pending')
                        .map((scheme) => (
                          <div key={scheme._id} className="scheme-card">
                            <div className="scheme-header">
                              <div>
                                <h3>{scheme.schemeId?.name || 'Unknown Scheme'}</h3>
                                <div className="scheme-meta">
                                  <span>Applied: {formatDate(scheme.appliedAt)}</span>
                                </div>
                              </div>
                              <span className="status-tag pending">Pending</span>
                            </div>
                            <div className="scheme-body">
                              <div className="scheme-row">
                                <div className="scheme-info">
                                  <label>Investment Amount</label>
                                  <p>₹{scheme.investmentAmount?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="scheme-info">
                                  <label>Scheme Duration</label>
                                  <p>{scheme.schemeId?.duration || 'N/A'} years</p>
                                </div>
                              </div>
                              <div className="scheme-row">
                                <div className="scheme-info">
                                  <label>Interest Rate</label>
                                  <p>{scheme.schemeId?.interestRate || 'N/A'}%</p>
                                </div>
                                <div className="scheme-info">
                                  <label>Scheme Type</label>
                                  <p>{scheme.schemeId?.isGovernmentScheme ? 'Government' : 'Private'}</p>
                                </div>
                              </div>
                              
                              {scheme.schemeId?.description && (
                                <div className="scheme-description">
                                  <label>Scheme Description</label>
                                  <p>{scheme.schemeId.description}</p>
                                </div>
                              )}
                              
                              <div className="scheme-actions">
                                <textarea
                                  className="admin-note-input"
                                  placeholder="Add approval notes or comments..."
                                  id={`adminNote-${scheme.schemeId._id}`}
                                />
                                <div className="action-buttons">
                                  <button 
                                    className="accept-btn"
                                    onClick={() =>
                                      handleManageApplication(
                                        emp._id,
                                        scheme.schemeId._id,
                                        'Accepted',
                                        document.getElementById(`adminNote-${scheme.schemeId._id}`).value
                                      )
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="decline-btn"
                                    onClick={() =>
                                      handleManageApplication(
                                        emp._id,
                                        scheme.schemeId._id,
                                        'Rejected',
                                        document.getElementById(`adminNote-${scheme.schemeId._id}`).value
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;