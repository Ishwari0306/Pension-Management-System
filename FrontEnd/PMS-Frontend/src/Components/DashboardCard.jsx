import React from 'react';

const DashboardCard = ({ title, value, icon, color, trend, trendType }) => {
  // Default color if none provided
  const cardColor = color || '#1976D2';
  
  // Determine trend styling based on type
  const getTrendStyle = () => {
    switch(trendType) {
      case 'positive':
        return { color: '#4CAF50' };
      case 'warning':
        return { color: '#FF9800' };
      case 'negative':
        return { color: '#F44336' };
      default:
        return { color: '#757575' };
    }
  };


  const renderIcon = () => {
    if (icon) return icon; // If custom icon is passed
    
    switch(title) {
      case 'Total Employees':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={cardColor}>
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
      case 'Pending Approvals':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={cardColor}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={cardColor}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z"/>
          </svg>
        );
    }
  };

  return (
    <div className="dashboard-card" style={{ '--card-color': cardColor }}>
      <div className="card-icon">
        {renderIcon()}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
        {trend && (
          <span className="card-trend" style={getTrendStyle()}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;