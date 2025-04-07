import { useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi';

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
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '15px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer'
          }} 
          onClick={() => navigate(userRole === 'admin' ? '/admin/home' : '/home')}
        >
          <div style={{
            backgroundColor: '#3498db',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>PMS</span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            background: 'linear-gradient(90deg, #3498db, #2ecc71)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
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
              gap: '15px',
              alignItems: 'center'
            }}>
              <li>
                <button 
                  onClick={() => navigate(userRole === 'admin' ? '/admin/home' : '/home')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <FiHome size={18} />
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
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <FiUser size={18} />
                  Profile
                </button>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <FiLogOut size={18} />
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