-- Example schema (adjust types as needed)

CREATE TABLE professors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE projects (
  "Project ID" TEXT PRIMARY KEY,
  "Project Title" TEXT,
  "Project Domain" TEXT,
  "Subject" TEXT,
  "MajorMinor" TEXT,
  "Publication Type" TEXT,
  "Status" TEXT,
  "Student Names" TEXT,
  "Student Emails" TEXT,
  "Student Phones" TEXT,
  "Student Roll Numbers" TEXT,
  "Student PRNs" TEXT,
  "Student Division" TEXT,
  "Student Semester" TEXT,
  "Student Year" TEXT,
  "Student Department" TEXT,
  "Guide Name" TEXT,
  "Guide ID" TEXT,
  "Guide Department" TEXT,
  "Guide Email" TEXT
);

CREATE TABLE project_files (
  id SERIAL PRIMARY KEY,
  project_id TEXT REFERENCES projects("Project ID") ON DELETE CASCADE,
  file_name TEXT,
  file_type TEXT,
  file_path TEXT
);
