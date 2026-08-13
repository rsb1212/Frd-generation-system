import React, { useState, useEffect } from 'react';
import './Header.css';

function Header() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon">📄</div>
          <div className="logo-text">
            <h1>FRD Generator</h1>
            <p>Automated Functional Requirements Documentation</p>
          </div>
        </div>

        <div className="header-status">
          <div className={`status-indicator ${apiStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {apiStatus === 'connected' && 'API Connected'}
              {apiStatus === 'checking' && 'Checking...'}
              {apiStatus === 'disconnected' && 'Offline'}
              {apiStatus === 'error' && 'Connection Error'}
            </span>
          </div>

          <div className="header-info">
            <span className="version">v1.0.0</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <ul className="nav-links">
          <li><a href="#documentation">Documentation</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#support">Support</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
