import React from 'react';

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <div style={{
      backgroundColor: 'var(--card-background)',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '150px',
      textAlign: 'center',
      border: `1px solid ${color || '#e0e0e0'}`,
    }}>
      <div style={{
        fontSize: '24px',
        color: color || 'var(--primary-color)',
        marginBottom: '10px',
      }}>
        {icon}
      </div>
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>{title}</h3>
      <p style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
        color: color || 'var(--primary-color)',
      }}>
        {value}
      </p>
    </div>
  );
};

export default DashboardCard;