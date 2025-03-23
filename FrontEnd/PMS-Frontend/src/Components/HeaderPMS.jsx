import { useNavigate } from 'react-router-dom';

const HeaderPMS = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      padding: '10px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => navigate(userRole === 'admin' ? '/admin/home' : '/home')}>
            Pension Management System
          </h1>
        </div>
        
        {token && (
          <nav>
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: '20px'
            }}>
              <li>
                <button 
                  onClick={() => navigate(userRole === 'admin' ? '/admin/home' : '/home')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate(userRole === 'admin' ? '/admin/profile' : '/profile')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Profile
                </button>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '5px 10px',
                    borderRadius: '4px'
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default HeaderPMS;