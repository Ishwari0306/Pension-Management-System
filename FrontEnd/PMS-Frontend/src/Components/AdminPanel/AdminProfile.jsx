import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';

const AdminProfile = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/PMS/admin/profile', {
          headers: {
            'token': token,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [navigate]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Company Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <h2>{companyData?.name}</h2>
        </div>
        
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Total Employees</span>
            <span className="detail-value">{companyData?.totalEmployees}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Active Schemes</span>
            <span className="detail-value">{companyData?.activeSchemes}</span>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <span>Company Since</span>
              <span>2015</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <span>Location</span>
              <span>Pune, India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;