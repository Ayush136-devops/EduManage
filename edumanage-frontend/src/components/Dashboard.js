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
      const response = await apiFetch('/get_projects');
      const data = await response.json();
      const projectsArray = Array.isArray(data) ? data : data.projects || [];
      setProjects(projectsArray);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (projectData) => {
    try {
      const response = await apiFetch('/add_project', {
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
      console.log('DEBUG payload missing Project ID:', { projectData, editingProject });
      return;
    }

    try {
      const response = await apiFetch('/update_project', {
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
      const response = await apiFetch('/delete_project', {
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
    if (s === 'completed') {
      return { bg: '#ecfdf5', text: '#065f46', label: 'Completed' };
    }
    if (s === 'ongoing') {
      return { bg: '#fffbeb', text: '#78350f', label: 'Ongoing' };
    }
    if (s === 'pending') {
      return { bg: '#fef2f2', text: '#7f1d1d', label: 'Pending' };
    }
    if (s === 'on-hold') {
      return { bg: '#f3e8ff', text: '#581c87', label: 'On Hold' };
    }
    return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
  };

  // Search for Browse tab
  const filteredBrowseProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p['Project Title: '] || '').toLowerCase().includes(q) ||
      (p['Project Domain: '] || '').toLowerCase().includes(q) ||
      (p['Subject: '] || '').toLowerCase().includes(q) ||
      (p['Guide Name: '] || '').toLowerCase().includes(q)
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
              <p className="header-subtitle">
                Manage and track all your projects in one place.
              </p>
            </div>
          </div>
          <div className="header-right">
            <button onClick={onLogout} className="logout-btn">
              
              ➜] Sign Out
            </button>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{error}</span>
            <button
              className="alert-close"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{successMessage}</span>
          </div>
        )}

        {/* Main content */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Stats */}
            <section className="stats-section">
              <p className="section-label">Overview</p>
              <div className="stats-grid">
                <StatCard
                  label="Total Projects"
                  value={stats.total}
                  icon="📊"
                  color="#2563eb"
                />
                <StatCard
                  label="Ongoing"
                  value={stats.ongoing}
                  icon="⏳"
                  color="#f59e0b"
                  percentage={
                    stats.total ? ((stats.ongoing / stats.total) * 100).toFixed(0) : null
                  }
                />
                <StatCard
                  label="Completed"
                  value={stats.completed}
                  icon="✅"
                  color="#10b981"
                  percentage={
                    stats.total ? ((stats.completed / stats.total) * 100).toFixed(0) : null
                  }
                />
                <StatCard
                  label="Pending"
                  value={stats.pending}
                  icon="⏱"
                  color="#ef4444"
                  percentage={
                    stats.total ? ((stats.pending / stats.total) * 100).toFixed(0) : null
                  }
                />
              </div>
            </section>

            {/* All projects list */}
            <section className="projects-section">
              <div className="section-header-with-btn">
                <div className="section-header-left">
                  <h2 className="section-title">All Projects</h2>
                  <span className="project-count">{projects.length} total</span>
                </div>
                <button
                  className="add-project-btn"
                  onClick={() => {
                    setEditingProject(null);
                    setShowProjectForm(true);
                  }}
                >
                  <span className="btn-icon">+</span>
                  Create New Project
                </button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner" />
                  <p>Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <h3>No projects yet</h3>
                  <p>Start by creating your first project.</p>
                  <button
                    className="empty-state-btn"
                    onClick={() => setShowProjectForm(true)}
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project, index) => {
                    const statusInfo = getStatusColor(project['Status']);
                    return (
                      <div key={index} className="project-card">
                        <div className="project-card-header">
                          <h3 className="project-title">
                            {project['Project Title'] || 'Untitled Project'}
                          </h3>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.text,
                              borderColor: statusInfo.text,
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="project-card-body">
                          <p className="project-domain">
                            {project['Project Domain'] || 'Domain not set'}
                          </p>
                          <div className="project-meta">
                            <div className="meta-item">
                              <span className="meta-label">Subject: </span>
                              <span className="meta-value">
                                {project['Subject'] || 'N/A'}
                              </span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Guide: </span>
                              <span className="meta-value">
                                {project['Guide Name'] || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="project-card-footer">
                          <button
                            className="btn-action btn-view"
                            onClick={() => setSelectedProject(project)}
                          >
                            View
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditProject(project)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteProject(project)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <Analytics projects={projects} loading={loading} />
          </div>
        )}

        {activeTab === 'myprojects' && (
          <div className="dashboard-content">
            <section className="projects-section">
              <div className="section-header-with-btn">
                <div className="section-header-left">
                  <h2 className="section-title">My Projects</h2>
                  <span className="project-count">{projects.length} total</span>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner" />
                  <p>Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <h3>No projects assigned</h3>
                  <p>Projects assigned to you will appear here.</p>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project, index) => (
                    <div key={index} className="project-card">
                      <div className="project-card-header">
                        <h3 className="project-title">
                          {project['Project Title'] || 'Untitled Project'}
                        </h3>
                      </div>
                      <div className="project-card-body">
                        <p className="project-domain">
                          {project['Project Domain'] || 'Domain not set'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="dashboard-content">
            <section className="projects-section">
              <div className="section-header-with-btn">
                <div className="section-header-left">
                  <div>
                    <h2 className="section-title">Browse Projects</h2>
                    <p className="section-subtitle">
                      {filteredBrowseProjects.length} of {projects.length} projects
                    </p>
                  </div>
                </div>
                <div className="browse-search">
                  <input
                    type="text"
                    className="browse-search-input"
                    placeholder="Search                                      🔍 "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner" />
                  <p>Loading projects...</p>
                </div>
              ) : filteredBrowseProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No projects match your search</h3>
                  <p>Try a different keyword or clear the search.</p>
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredBrowseProjects.map((project, index) => {
                    const statusInfo = getStatusColor(project['Status']);
                    return (
                      <div key={index} className="project-card">
                        <div className="project-card-header">
                          <h3 className="project-title">
                            {project['Project Title'] || 'Untitled Project'}
                          </h3>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.text,
                              borderColor: statusInfo.text,
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="project-card-body">
                          <p className="project-domain">
                            {project['Project Domain'] || 'Domain not set'}
                          </p>
                          <div className="project-meta">
                            <div className="meta-item">
                              <span className="meta-label">Subject: </span>
                              <span className="meta-value">
                                {project['Subject'] || 'N/A'}
                              </span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Guide: </span>
                              <span className="meta-value">
                                {project['Guide Name'] || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="project-card-footer">
                          <button
                            className="btn-action btn-view"
                            onClick={() => setSelectedProject(project)}
                          >
                            View
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditProject(project)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteProject(project)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          >
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <ProjectForm
                onSubmit={editingProject ? handleUpdateProject : handleAddProject}
                onClose={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
                editingProject={editingProject}
              />
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedProject(null)}
          >
            <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-content">
                  <h2>{selectedProject['Project Title'] || 'Project Details'}</h2>
                  <p className="modal-subtitle">
                    {selectedProject['Project Domain'] || 'Domain not set'}
                  </p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <DetailItem
                    label="Subject"
                    value={selectedProject['Subject']}
                  />
                  <DetailItem
                    label="Status"
                    value={selectedProject['Status']}
                  />
                  <DetailItem
                    label="Year"
                    value={selectedProject['Student Year']}
                  />
                  <DetailItem
                    label="Department"
                    value={selectedProject['Student Department']}
                  />
                  <DetailItem
                    label="Guide"
                    value={selectedProject['Guide Name']}
                  />
                  <DetailItem
                    label="Students"
                    value={selectedProject['Student Names']}
                  />
                  <DetailItem
                    label="Emails"
                    value={selectedProject['Student Emails']}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, percentage }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color, color }}>
      <div className="stat-content">
        <div className="stat-icon">{icon}</div>
        <div className="stat-text">
          <p className="stat-label">{label}</p>
          <h3 className="stat-value">{value}</h3>
          {percentage !== null && percentage !== undefined && (
            <p className="stat-percentage">{percentage}%</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || 'N/A'}</span>
    </div>
  );
}
