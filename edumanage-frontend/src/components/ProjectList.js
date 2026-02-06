import React from 'react';

export default function ProjectList({ projects, onViewProject, onEditProject, onDeleteProject }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📁</div>
        <h3>No projects found</h3>
        <p>Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project, index) => {
        const id = project['Project ID'] || `row-${index}`;
        return (
          <div key={`${id}-${index}`} className="project-card">
            <div className="project-header">
              <h3>{project['Project Title'] || 'N/A'}</h3>
              <span className={`status-badge ${(project['Status'] || '').toLowerCase()}`}>
                {project['Status'] || 'N/A'}
              </span>
            </div>

            <div className="project-info">
              <div className="info-row">
                <strong>Domain:</strong> {project['Project Domain'] || 'N/A'}
              </div>
              <div className="info-row">
                <strong>Subject:</strong> {project['Subject'] || 'N/A'}
              </div>
              <div className="info-row">
                <strong>Year:</strong> {project['Student Year'] || 'N/A'}
              </div>
              <div className="info-row">
                <strong>Guide:</strong> {project['Guide Name'] || 'N/A'}
              </div>
            </div>

            <div className="project-actions">
              <button onClick={() => onViewProject(project)} className="view-btn">
                View
              </button>
              {onEditProject && (
                <button
                  onClick={() => onEditProject(project)}
                  className="edit-btn"
                  style={{ background: '#3b82f6', color: 'white', marginLeft: 4 }}
                >
                  Edit
                </button>
              )}
              {onDeleteProject && (
                <button
                  onClick={() => onDeleteProject(project)}
                  className="delete-btn"
                  style={{ background: '#ef4444', color: 'white', marginLeft: 4 }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
