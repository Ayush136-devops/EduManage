import React from 'react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, onCreateProject }) {
  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', icon: 'chart', label: 'Analysis' },
    { id: 'myprojects', icon: 'folder', label: 'My Projects' },
    { id: 'browse', icon: 'search', label: 'Browse Projects' },
  ];

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="10" height="10" fill="#3b82f6" rx="2" />
            <rect x="18" y="4" width="10" height="10" fill="#3b82f6" rx="2" />
            <rect x="4" y="18" width="10" height="10" fill="#3b82f6" rx="2" />
            <rect x="18" y="18" width="10" height="10" fill="#3b82f6" rx="2" />
          </svg>
          <div>
            <h2 className="sidebar-title">EduManage</h2>
            <p className="sidebar-subtitle">Project Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="nav-section-label">Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <span className={`nav-icon icon-${item.icon}`}>
                <IconComponent icon={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Create Project Button */}
        <div className="nav-section nav-actions">
          <button className="create-btn" onClick={onCreateProject}>
            <span className="create-icon">+</span>
            <span className="create-label">Create Project</span>
          </button>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <p className="footer-text">© 2025 EduManage</p>
      </div>
    </div>
  );
}

// Icon Component
function IconComponent({ icon }) {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
      </svg>
    ),
    folder: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  };

  return icons[icon] || null;
}
