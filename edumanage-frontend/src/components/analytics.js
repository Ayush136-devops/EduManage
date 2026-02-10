import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import './analytics.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

function groupBy(arr, key) {
  return arr.reduce((acc, obj) => {
    const value = obj[key] || 'N/A';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export default function Analytics({ projects = [], loading = false }) {
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterGuide, setFilterGuide] = useState('All');
  const [sortBy, setSortBy] = useState('Project Title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Extract unique values
  const uniqueDomains = useMemo(
    () => ['All', ...new Set(projects.map((p) => p['Project Domain'] || p['Domain'] || p.domain).filter(Boolean))],
    [projects]
  );
  const uniqueStatuses = useMemo(
    () => ['All', ...new Set(projects.map((p) => p['Status'] || p.status).filter(Boolean))],
    [projects]
  );
  const uniqueYears = useMemo(
    () => ['All', ...new Set(projects.map((p) => p['Student Year'] || p.year).filter(Boolean))],
    [projects]
  );
  const uniqueGuides = useMemo(
    () => ['All', ...new Set(projects.map((p) => p['Guide Name'] || p.guide).filter(Boolean))].sort(),
    [projects]
  );

  // Filter and sort
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((p) => {
      const domain = p['Project Domain'] || p['Domain'] || p.domain || '';
      const status = p['Status'] || p.status || '';
      const year = p['Student Year'] || p.year || '';
      const guide = p['Guide Name'] || p.guide || '';

      const matchDomain = filterDomain === 'All' || domain === filterDomain;
      const matchStatus = filterStatus === 'All' || status === filterStatus;
      const matchYear = filterYear === 'All' || year === filterYear;
      const matchGuide = filterGuide === 'All' || guide === filterGuide;
      
      return matchDomain && matchStatus && matchYear && matchGuide;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy] || a[sortBy.toLowerCase()] || '';
      let bVal = b[sortBy] || b[sortBy.toLowerCase()] || '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, filterDomain, filterStatus, filterYear, filterGuide, sortBy, sortOrder]);

  // Statistics
  const domainCounts = useMemo(() => groupBy(filteredProjects, 'Project Domain'), [filteredProjects]);
  const statusCounts = useMemo(() => groupBy(filteredProjects, 'Status'), [filteredProjects]);
  const yearCounts = useMemo(() => groupBy(filteredProjects, 'Student Year'), [filteredProjects]);
  const guideCounts = useMemo(() => groupBy(filteredProjects, 'Guide Name'), [filteredProjects]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 }, padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.y || context.parsed}`;
          },
        },
      },
    },
  };

  // Prepare chart data
  const domainChartData = {
    labels: Object.keys(domainCounts).filter(d => d !== 'N/A'),
    datasets: [
      {
        label: 'Projects',
        data: Object.keys(domainCounts)
          .filter(d => d !== 'N/A')
          .map(d => domainCounts[d]),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(statusCounts).filter(s => s !== 'N/A'),
    datasets: [
      {
        label: 'Projects',
        data: Object.keys(statusCounts)
          .filter(s => s !== 'N/A')
          .map(s => statusCounts[s]),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const yearChartData = {
    labels: Object.keys(yearCounts)
      .filter(y => y !== 'N/A')
      .sort(),
    datasets: [
      {
        label: 'Projects',
        data: Object.keys(yearCounts)
          .filter(y => y !== 'N/A')
          .sort()
          .map(y => yearCounts[y]),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const guideChartData = {
    labels: Object.keys(guideCounts)
      .filter(g => g !== 'N/A')
      .sort()
      .slice(0, 10),
    datasets: [
      {
        label: 'Projects Guided',
        data: Object.keys(guideCounts)
          .filter(g => g !== 'N/A')
          .sort()
          .slice(0, 10)
          .map(g => guideCounts[g]),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="analytics-section">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="analytics-section">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#dc2626' }}>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>No project data available</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: '#64748b' }}>Go to Dashboard to create or load projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      <h1 className="section-title">Project Analysis Dashboard</h1>

      {/* FILTER SECTION AT TOP */}
      <div className="filter-section">
        <h2 className="filter-title">Filter & Sort Projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="filter-group">
            <label className="filter-label">Domain</label>
            <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="select">
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select">
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="select">
              {uniqueYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Guide</label>
            <select value={filterGuide} onChange={(e) => setFilterGuide(e.target.value)} className="select">
              {uniqueGuides.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
              <option value="Project Title">Title</option>
              <option value="Project Domain">Domain</option>
              <option value="Status">Status</option>
              <option value="Student Year">Year</option>
              <option value="Guide Name">Guide</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="select">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <p style={{ margin: '0', fontSize: '12px', color: '#94a3b8' }}>Showing {filteredProjects.length} of {projects.length} projects</p>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card-analytics" style={{ borderLeftColor: '#3b82f6' }}>
          <p className="stat-label">Total Projects</p>
          <h3 className="stat-value">{filteredProjects.length}</h3>
        </div>
        <div className="stat-card-analytics" style={{ borderLeftColor: '#8b5cf6' }}>
          <p className="stat-label">Active Guides</p>
          <h3 className="stat-value">{Object.keys(guideCounts).filter(g => g !== 'N/A').length}</h3>
        </div>
        <div className="stat-card-analytics" style={{ borderLeftColor: '#f59e0b' }}>
          <p className="stat-label">Project Domains</p>
          <h3 className="stat-value">{Object.keys(domainCounts).filter(d => d !== 'N/A').length}</h3>
        </div>
        <div className="stat-card-analytics" style={{ borderLeftColor: '#10b981' }}>
          <p className="stat-label">Status Types</p>
          <h3 className="stat-value">{Object.keys(statusCounts).filter(s => s !== 'N/A').length}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Visualizations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Pie Chart - Domain Distribution */}
          <div className="chart-box">
            <h3 className="chart-title">Projects by Domain</h3>
            <div className="chart-canvas">
              <Pie data={domainChartData} options={chartOptions} />
            </div>
          </div>

          {/* Doughnut Chart - Status Distribution */}
          <div className="chart-box">
            <h3 className="chart-title">Project Status Distribution</h3>
            <div className="chart-canvas">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Line Chart - Projects by Year */}
          <div className="chart-box" style={{ gridColumn: 'span 2' }}>
            <h3 className="chart-title">Projects Over Years</h3>
            <div className="chart-canvas">
              <Line data={yearChartData} options={chartOptions} />
            </div>
          </div>

          {/* Bar Chart - Top Guides */}
          <div className="chart-box" style={{ gridColumn: 'span 2' }}>
            <h3 className="chart-title">Top 10 Guides by Projects</h3>
            <div className="chart-canvas">
              <Bar data={guideChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Display */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Data Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="stats-box">
            <h3 className="stats-box-title">Projects by Domain</h3>
            <div className="stats-box-content">
              {Object.entries(domainCounts)
                .filter(([key]) => key !== 'N/A')
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => (
                  <StatItem key={key} label={key} count={count} max={Math.max(...Object.values(domainCounts).filter(v => v !== 0))} />
                ))}
            </div>
          </div>
          <div className="stats-box">
            <h3 className="stats-box-title">Projects by Status</h3>
            <div className="stats-box-content">
              {Object.entries(statusCounts)
                .filter(([key]) => key !== 'N/A')
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => (
                  <StatItem key={key} label={key} count={count} max={Math.max(...Object.values(statusCounts).filter(v => v !== 0))} />
                ))}
            </div>
          </div>
          <div className="stats-box">
            <h3 className="stats-box-title">Projects by Year</h3>
            <div className="stats-box-content">
              {Object.entries(yearCounts)
                .filter(([key]) => key !== 'N/A')
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => (
                  <StatItem key={key} label={key} count={count} max={Math.max(...Object.values(yearCounts).filter(v => v !== 0))} />
                ))}
            </div>
          </div>
          <div className="stats-box">
            <h3 className="stats-box-title">Projects by Guide (Top 15)</h3>
            <div className="stats-box-content">
              {Object.entries(guideCounts)
                .filter(([key]) => key !== 'N/A')
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .map(([key, count]) => (
                  <StatItem key={key} label={key} count={count} max={Math.max(...Object.values(guideCounts).filter(v => v !== 0))} />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-section">
        <h2 className="table-title">Project List ({filteredProjects.length})</h2>
        <div className="table-container">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-header-cell">Project Title</th>
                <th className="table-header-cell">Domain</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Year</th>
                <th className="table-header-cell">Guide</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.slice(0, 50).map((project, index) => (
                <tr key={index}>
                  <td className="table-cell">{project['Project Title'] || project.title || 'N/A'}</td>
                  <td className="table-cell">{project['Project Domain'] || project['Domain'] || project.domain || 'N/A'}</td>
                  <td className="table-cell">
                    <span className={`status-badge status-${(project['Status'] || project.status || '').toLowerCase()}`}>
                      {project['Status'] || project.status || 'N/A'}
                    </span>
                  </td>
                  <td className="table-cell">{project['Student Year'] || project.year || 'N/A'}</td>
                  <td className="table-cell">{project['Guide Name'] || project.guide || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProjects.length > 50 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '16px', fontSize: '14px' }}>
            Showing 50 of {filteredProjects.length} projects
          </p>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, count, max }) {
  const percentage = (count / max) * 100;
  return (
    <div className="stats-item">
      <span className="stats-label">{label}</span>
      <div className="stats-bar-container">
        <div className="stats-bar">
          <div className="stats-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="stats-value">{count}</span>
      </div>
    </div>
  );
}
