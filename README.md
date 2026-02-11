#  EduManage – Academic Project Management System

EduManage is a robust, full-stack web application designed to streamline **academic project management** for professors and students. It offers secure authentication, full project lifecycle management, and a reliable cloud-based infrastructure.

---

##  Overview

EduManage helps professors efficiently manage student projects while ensuring data integrity and secure access. Built with modern web technologies, it delivers performance, scalability, and a clean user experience.

---

##  Tech Stack

### Frontend

* **React.js**
* **Tailwind CSS**
* **Vercel** (Deployment)

### Backend

* **Python (Flask)**
* **Gunicorn**
* **Render** (Deployment)

### Database

* **PostgreSQL (Supabase)**

### Authentication

* **Supabase Auth (Google OAuth)**

---

## ✨ Key Features

*  **Secure Authentication**
  Google Login integrated via Supabase Auth (restricted to professors).

*  **Full CRUD Operations**
  Create, Read, Update, and Delete academic projects seamlessly.

*  **Data Integrity**
  Strict type casting for student semester and year ensures database consistency.

*  **Cloud-Ready Infrastructure**
  Fully deployed using IPv4-compatible Supabase Session Pooler for reliable connectivity.

---

##  Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=your_supabase_pooler_url_with_ssl
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend (`.env`)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

##  Deployment

### Backend (Render)

* Connected to the GitHub repository
* **Build Command**:

  ```bash
  pip install -r requirements.txt
  ```
* **Start Command**:

  ```bash
  gunicorn app:app
  ```
* Uses **Supabase IPv4 Session Pooler** to ensure compatibility with Render

### Frontend (Vercel)

* Connected to the GitHub repository
* Environment variable `REACT_APP_API_URL` configured to point to the Render backend URL

---


### Clone the Repository

```bash
git clone https://github.com/Ayush136-devops/EduManage.git
cd Edumanage
```

###  Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### 3️ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

##  Future Enhancements

* Role-based access (Students + Professors)
* Project file uploads
* Project progress tracking
* Admin dashboard & analytics

---

##  Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---


💡 *EduManage simplifies academic project workflows with security, performance, and scalability at its core.*
