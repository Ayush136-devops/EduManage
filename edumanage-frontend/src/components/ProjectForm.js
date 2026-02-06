import React, { useState, useEffect } from 'react';

const initialProjectData = {
  'Project Title': '',
  'Project ID': '',
  'Project Domain': '',
  'Subject': '',
  'MajorMinor': '',
  'Publication Type': '',
  'Status': '',
  'Student Names': '',
  'Student Emails': '',
  'Student Phones': '',
  'Student Roll Numbers': '',
  'Student PRNs': '',
  'Student Division': '',
  'Student Semester': '',
  'Student Year': '',
  'Student Department': '',
  'Guide Name': '',
  'Guide ID': '',
  'Guide Department': '',
  'Guide Email': ''
};

export default function ProjectForm({ onSubmit, onClose, editingProject }) {
  const [formData, setFormData] = useState(initialProjectData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProject) {
      const normalized = { ...initialProjectData };
      Object.keys(initialProjectData).forEach((key) => {
        normalized[key] = editingProject[key] ?? '';
      });
      setFormData(normalized);
    } else {
      setFormData(initialProjectData);
    }
  }, [editingProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ?? ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData['Project ID']) {
      alert('Project ID is required.');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <>
      <div className="modal-header">
        <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              name="Project Title"
              value={formData['Project Title']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Project ID *</label>
            <input
              type="text"
              name="Project ID"
              value={formData['Project ID']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Project Domain *</label>
            <input
              type="text"
              name="Project Domain"
              value={formData['Project Domain']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="Subject"
              value={formData['Subject']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Major/Minor</label>
            <input
              type="text"
              name="MajorMinor"
              value={formData['MajorMinor']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Publication Type</label>
            <input
              type="text"
              name="Publication Type"
              value={formData['Publication Type']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              name="Status"
              value={formData['Status']}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label>Student Year *</label>
            <input
              type="number"
              name="Student Year"
              value={formData['Student Year']}
              onChange={handleChange}
              min="1"
              max="4"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Student Names *</label>
            <textarea
              name="Student Names"
              value={formData['Student Names']}
              onChange={handleChange}
              placeholder="Enter student names separated by commas"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Student Emails *</label>
            <textarea
              name="Student Emails"
              value={formData['Student Emails']}
              onChange={handleChange}
              placeholder="Enter student emails separated by commas"
              required
            />
          </div>

          <div className="form-group">
            <label>Student Phones</label>
            <textarea
              name="Student Phones"
              value={formData['Student Phones']}
              onChange={handleChange}
              placeholder="Enter phone numbers separated by commas"
            />
          </div>

          <div className="form-group">
            <label>Student Roll Numbers</label>
            <textarea
              name="Student Roll Numbers"
              value={formData['Student Roll Numbers']}
              onChange={handleChange}
              placeholder="Enter roll numbers separated by commas"
            />
          </div>

          <div className="form-group">
            <label>Student PRNs</label>
            <textarea
              name="Student PRNs"
              value={formData['Student PRNs']}
              onChange={handleChange}
              placeholder="Enter PRNs separated by commas"
            />
          </div>

          <div className="form-group">
            <label>Student Division</label>
            <input
              type="text"
              name="Student Division"
              value={formData['Student Division']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Student Semester</label>
            <input
              type="text"
              name="Student Semester"
              value={formData['Student Semester']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Student Department *</label>
            <input
              type="text"
              name="Student Department"
              value={formData['Student Department']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Guide Name *</label>
            <input
              type="text"
              name="Guide Name"
              value={formData['Guide Name']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Guide ID</label>
            <input
              type="text"
              name="Guide ID"
              value={formData['Guide ID']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Guide Department</label>
            <input
              type="text"
              name="Guide Department"
              value={formData['Guide Department']}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Guide Email</label>
            <input
              type="email"
              name="Guide Email"
              value={formData['Guide Email']}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading
              ? (editingProject ? 'Updating...' : 'Adding...')
              : (editingProject ? 'Update Project' : 'Add Project')}
          </button>
        </div>
      </form>
    </>
  );
}
