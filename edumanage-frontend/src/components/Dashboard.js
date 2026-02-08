/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProjectForm from './ProjectForm';
import Analytics from './analytics';
import './Dashboard.css';
import { apiFetch } from '../api';

export default function Dashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load projects once on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      // UPDATED: Added /api/ prefix to match backend
      const response = await apiFetch('/api/get_projects');
      const data = await response.json();
      const projectsArray = Array.isArray(data) ? data : data.projects || [];
      setProjects(projectsArray);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (projectData) => {
    try {
      // UPDATED: Added /api/ prefix
      const response = await apiFetch('/api/add_project', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setShowProjectForm(false);
        setEditingProject(null);
        setSuccessMessage('Project created successfully!');
        loadProjects();
      } else {
        setError(data.message || 'Failed to add project.');
      }
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Network error while adding project.');
    }
  }; 

  const handleEditProject = (project) => {
    const withId = {
      ...project,
      'Project ID': project['Project ID'] || project.id || project.projectId || '',
    };
    setEditingProject(withId);
    setShowProjectForm(true);
  };

  const handleUpdateProject = async (projectData) => {
    const payload = {
      ...projectData,
      'Project ID': projectData['Project ID'] || editingProject?.['Project ID'] || '',
    };

    if (!payload['Project ID']) {
      alert('No Project ID specified for update.');
      return;
    }

    try {
      // UPDATED: Added /api/ prefix
      const response = await apiFetch('/api/update_project', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setShowProjectForm(false);
        setEditingProject(null);
        setSuccessMessage('Project updated successfully!');
        loadProjects();
      } else {
        setError(data.message || 'Failed to update project.');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Network error while updating project.');
    }
  };

  const handleDeleteProject = async (project) => {
    const projectName = project['Project Title'] || 'Project';
    if (!confirm(`Delete "${projectName}"? This cannot be undone.`)) return;

    try {
      // UPDATED: Added /api/ prefix
      const response = await apiFetch('/api/delete_project', {
        method: 'POST',
        body: JSON.stringify({ 'Project ID': project['Project ID'] }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMessage('Project deleted successfully!');
        loadProjects();
      } else {
        setError(data.message || 'Failed to delete project.');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Network error while deleting project.');
    }
  };

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => (p['Status'] || '').toLowerCase() === 'ongoing').length,
    completed: projects.filter(p => (p['Status'] || '').toLowerCase() === 'completed').length,
    pending: projects.filter(p => (p['Status'] || '').toLowerCase() === 'pending').length,
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return { bg: '#ecfdf5', text: '#065f46', label: 'Completed' };
    if (s === 'ongoing') return { bg: '#fffbeb', text: '#78350f', label: 'Ongoing' };
    if (s === 'pending') return { bg: '#fef2f2', text: '#7f1d1d', label: 'Pending' };
    return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
  };

  // UPDATED: Cleaned up the search keys to match the database exactly
  const filteredBrowseProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p['Project Title'] || '').toLowerCase().includes(q) ||
      (p['Project Domain'] || '').toLowerCase().includes(q) ||
      (p['Subject'] || '').toLowerCase().includes(q) ||
      (p['Guide Name'] || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateProject={() => {
          setEditingProject(null);
          setShowProjectForm(true);
        }}
      />

      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-text">
              <h1>
                Welcome back, <span className="user-name">{user?.name || 'Professor'}</span>
              </h1>
              <p className="header-subtitle">Manage and track all your projects in one place.</p>
            </div>
          </div>
          <div className="header-right">
            <button onClick={onLogout} className="logout-btn">Sign Out</button>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{error}</span>
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{successMessage}</span>
          </div>
        )}

        {/* Dynamic Tab Content */}
        {activeTab === 'dashboard' && renderMainDashboard()}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <Analytics projects={projects} loading={loading} />
          </div>
        )}
        {activeTab === 'browse' && renderBrowseTab()}

        {/* Modals */}
        {showProjectForm && (
          <div className="modal-overlay" onClick={() => setShowProjectForm(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <ProjectForm
                onSubmit={editingProject ? handleUpdateProject : handleAddProject}
                onClose={() => setShowProjectForm(false)}
                editingProject={editingProject}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to keep main return clean
  function renderMainDashboard() {
    return (
      <div className="dashboard-content">
        <section className="stats-section">
          <div className="stats-grid">
            <StatCard label="Total Projects" value={stats.total} color="#2563eb" />
            <StatCard label="Ongoing" value={stats.ongoing} color="#f59e0b" 
              percentage={stats.total ? ((stats.ongoing / stats.total) * 100).toFixed(0) : 0} />
            <StatCard label="Completed" value={stats.completed} color="#10b981" 
              percentage={stats.total ? ((stats.completed / stats.total) * 100).toFixed(0) : 0} />
          </div>

          <div className="projects-grid">
            {loading ? <div className="spinner" /> : projects.map((p, i) => renderProjectCard(p, i))}
          </div>
        </section>
      </div>
    );
  }

  function renderProjectCard(project, index) {
    const statusInfo = getStatusColor(project['Status']);
    return (
      <div key={index} className="project-card">
        <div className="project-card-header">
          <h3>{project['Project Title']}</h3>
          <span className="status-badge" style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
            {statusInfo.label}
          </span>
        </div>
        <div className="project-card-body">
          <p>{project['Project Domain']}</p>
          <small>Guide: {project['Guide Name']}</small>
        </div>
        <div className="project-card-footer">
          <button className="btn-action btn-edit" onClick={() => handleEditProject(project)}>Edit</button>
          <button className="btn-action btn-delete" onClick={() => handleDeleteProject(project)}>Delete</button>
        </div>
      </div>
    );
  }

  function renderBrowseTab() {
     return (
        <div className="dashboard-content">
            <div className="browse-search">
                <input 
                  type="text" 
                  placeholder="Search by Title, Domain, or Guide..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="projects-grid">
                {filteredBrowseProjects.map((p, i) => renderProjectCard(p, i))}
            </div>
        </div>
     );
  }
}

function StatCard({ label, value, color, icon, percentage }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        {percentage > 0 && <span className="stat-percentage">{percentage}% of total</span>}
      </div>
    </div>
  );
}