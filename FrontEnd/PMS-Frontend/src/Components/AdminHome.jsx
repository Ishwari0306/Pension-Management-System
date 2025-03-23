import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';

const AdminHome = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
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

      // Refresh the employee list
      const updatedEmployees = employees.map((emp) => {
        if (emp._id === employeeId) {
          return {
            ...emp,
            appliedSchemes: emp.appliedSchemes.map((scheme) =>
              scheme.schemeId._id === schemeId ? { ...scheme, status, adminNote } : scheme
            ),
          };
        }
        return emp;
      });
      setEmployees(updatedEmployees);

      alert('Application updated successfully!');
    } catch (err) {
      console.error('Error managing application:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        <DashboardCard title="Total Employees" value={employees.length} icon="👥" color="#3498db" />
        <DashboardCard
          title="Pending Approvals"
          value={employees.reduce((count, emp) => count + emp.appliedSchemes.filter(scheme => scheme.status === 'Pending').length, 0)}
          icon="⏳"
          color="#e67e22"
        />
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Employee List</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Applied Schemes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>
                  <ul>
                    {emp.appliedSchemes.map((scheme) => (
                      <li key={scheme._id}>
                        <h4>{scheme.schemeId.name}</h4>
                        <p>Investment: ₹{scheme.investmentAmount}</p>
                        <p>Status: {scheme.status}</p>
                        {scheme.status === 'Pending' && (
                          <div>
                            <input
                              type="text"
                              placeholder="Admin Note"
                              id={`adminNote-${scheme.schemeId._id}`}
                            />
                            <button
                              onClick={() =>
                                handleManageApplication(
                                  emp._id,
                                  scheme.schemeId._id,
                                  'Accepted',
                                  document.getElementById(`adminNote-${scheme.schemeId._id}`).value
                                )
                              }
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleManageApplication(
                                  emp._id,
                                  scheme.schemeId._id,
                                  'Rejected',
                                  document.getElementById(`adminNote-${scheme.schemeId._id}`).value
                                )
                              }
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHome;