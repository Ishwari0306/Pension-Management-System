import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Company Profile</h1>
      <div>
        <p><strong>Company Name:</strong> {companyData?.name}</p>
        <p><strong>Total Employees:</strong> {companyData?.totalEmployees}</p>
        <p><strong>Active Pension Schemes:</strong> {companyData?.activeSchemes}</p>
      </div>
    </div>
  );
};

export default AdminProfile;