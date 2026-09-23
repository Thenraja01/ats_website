# HireMind AI — Intelligent Applicant Tracking System

[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20MongoDB%20%7C%20Ollama-informational)]()

**HireMind AI** is a full-stack, AI-powered Applicant Tracking System (ATS) designed to streamline recruitment workflows. It leverages Large Language Models (LLMs) for intelligent resume parsing, candidate matching, and job analysis — all orchestrated through a modern, responsive web interface.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Backend Overview](#backend-overview)
- [Frontend Overview](#frontend-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

HireMind AI transforms the traditional hiring process by integrating AI-driven resume analysis, intelligent candidate screening, and automated job matching into a single unified platform. Recruiters can post jobs, review AI-analyzed candidate profiles, and manage the entire pipeline — while candidates benefit from a polished application experience, resume builder, and career guidance powered by AI.

The system is built as a **final-year academic project** demonstrating full-stack development, database design, AI/ML integration, and DevOps practices.

---

## ✨ Key Features

### 🔐 Authentication & User Management
- **Role-based access control** (Candidate / Recruiter / Admin / Super Admin)
- **JWT-based authentication** with access & refresh tokens
- **OTP verification** via email for secure registration and password reset
- **Secure password hashing** using bcrypt/passlib

### 👤 Candidate Features
- **Resume Upload & Parsing** — Upload PDF/DOCX resumes; auto-extracted by AI
- **Resume Builder** — Interactive, template-based resume creation tool
- **Career Vault** — Centralized storage and management of all career documents
- **Career Advisor** — AI-powered career guidance and profile recommendations
- **Candidate Dashboard** — Track applications, view analytics, and manage profile
- **Job Applications** — Browse and apply to jobs with one-click

### 🏢 Recruiter Features
- **Recruiter Dashboard** — Overview of candidates, applications, and pipeline
- **Job Posting & Management** — Create and manage job listings
- **JD Analyzer** — AI-powered job description analysis and optimization
- **Candidate Matching** — Intelligent candidate-job matching based on AI analysis
- **Applicant Tracking** — Manage candidates through pipeline stages
- **Document Management** — Review and organize candidate documents

### 📊 Admin & System Features
- **Admin Dashboard** — Full system oversight, user management, and analytics
- **User Management** — CRUD operations for all user roles
- **Notifications System** — Real-time email and in-app notifications
- **Analytics & Reporting** — Recharts-based dashboards for data visualization

### 🤖 AI & Intelligence
- **LLM-Powered Resume Analysis** — Deep analysis of resumes using local LLMs via Ollama
- **RAG Pipeline** — Retrieval-Augmented Generation for contextual answers
- **Intelligence Module** — AI-driven insights on candidates, jobs, and trends
- **ChromaDB Vector Store** — Embedding-based search for semantic resume matching
- **LangChain Integration** — Orchestrated AI pipelines for analysis and matching

### 🎓 Career & Learning
- **Career Profile** — Detailed career path visualization
- **Career Vault** — Secure document storage with versioning
- **Career Advisor** — Personalized career recommendations
- **Onboarding Wizard** — Step-by-step guided setup for new users

### 📝 Interview & Assessment
- **Interview Hub** — Schedule and manage interviews
- **ATS Simulator** — Practice mock ATS screening scenarios
- **Interview Questions** — AI-generated interview preparation materials

### 💬 Real-Time Communication
- **WebSocket Support** — Real-time notifications and chat via Socket.IO
- **Live Updates** — Instant application status updates

### 🌐 Additional Features
- **PWA Support** — Progressive Web App capabilities for offline use
- **Dark/Light Theme** — Theme switching with Tailwind CSS
- **Responsive Design** — Fully responsive across all device sizes
- **File Storage** — MinIO-based S3-compatible object storage
- **Docker Deployment** — Fully containerized with Docker Compose

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    HireMind AI Platform                   │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│   FRONTEND   │         BACKEND (FastAPI)                 │
│  (React +    │     ┌─────────────────────────────┐       │
│   Vite +     │     │  - Auth & User Management   │       │
│   TypeScript)│     │  - Resume Analysis Engine   │       │
│              │     │  - Job & Candidate Mgmt     │       │
│  - React     │     │  - RAG Pipeline (LangChain) │       │
│  - Redux     │     │  - WebSocket Server         │       │
│  - Tailwind  │     │  - REST + WS API            │       │
│  - TanStack  │     └──────────┬──────────────────┘       │
│    Query     │                │                          │
│  - Socket.IO │        ┌───────┴────────┐                 │
│              │        │                │                 │
├──────────────┼────────┴────────────────┘─────────────────┤
│              │                                           │
│   INFRASTRUCTURE SERVICES                             │
│  ┌─────────┐ ┌─────────┐ ┌──────────────────────┐      │
│  │MongoDB  │ │ Ollama  │ │     MinIO            │      │
│  │(Database│ │(Local   │ │ (S3 File Storage)    │      │
│  │  +      │ │  LLM)   │ │                      │      │
│  │ChromaDB)│ │         │ │                      │      │
│  └─────────┘ └─────────┘ └──────────────────────┘      │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### Data Flow
1. **User** interacts with the **React frontend** (Vite-powered SPA)
2. **Frontend** sends API requests to **FastAPI backend** (REST + WebSocket)
3. **Backend** processes requests using business logic and routes to:
   - **MongoDB** for persistent data storage
   - **Ollama** for LLM-powered AI analysis (resume parsing, matching, insights)
   - **MinIO** for file uploads (resumes, documents, images)
4. **ChromaDB** stores embeddings for semantic search and RAG pipeline
5. **Real-time** updates pushed via **Socket.IO** WebSocket connections

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Core UI library |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Redux Toolkit** | Global state management |
| **TanStack Query** | Server state management & caching |
| **React Router v6** | Client-side routing |
| **Socket.IO Client** | Real-time communication |
| **Framer Motion** | Animations & transitions |
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization |
| **jsPDF & html2canvas** | PDF generation from resume |
| **vite-plugin-pwa** | PWA support |
| **Zustand** | Lightweight state management |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Modern async web framework |
| **Python 3.10+** | Backend runtime |
| **Motor + PyMongo** | Async MongoDB driver |
| **Beanie** | MongoDB ODM |
| **LangChain** | AI pipeline orchestration |
| **Ollama** | Local LLM inference engine |
| **ChromaDB** | Vector database for embeddings |
| **python-jose** | JWT token handling |
| **bcrypt/passlib** | Password hashing |
| **pdfplumber & python-docx** | Resume file parsing |
| **Socket.IO** | Real-time WebSocket server |
| **Pydantic** | Data validation & settings |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Multi-container orchestration |
| **MongoDB** | Primary database |
| **Ollama** | Local LLM engine (Llama, Mistral, etc.) |
| **MinIO** | S3-compatible object storage |
| **pnpm** | Frontend package manager |
| **pip** | Python package management |

---

## 📂 Project Structure

```
ats-frontend/
│
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/                    # API route modules
│   │   │   ├── auth_router.py      # Authentication endpoints
│   │   │   ├── otp_router.py       # OTP verification
│   │   │   ├── user_router.py      # User CRUD operations
│   │   │   ├── resume_router.py    # Resume upload & parsing
│   │   │   ├── rag_router.py       # RAG pipeline endpoints
│   │   │   ├── candidate_routes.py # Candidate management
│   │   │   ├── recruiter_routes.py # Recruiter management
│   │   │   ├── admin_router.py     # Admin system controls
│   │   │   ├── public_router.py    # Public/landing pages
│   │   │   ├── career_router.py    # Career features
│   │   │   ├── resume_studio_router.py # Resume builder
│   │   │   ├── interview_router.py # Interview management
│   │   │   ├── documents_router.py # Document management
│   │   │   ├── notifications_router.py # Notification system
│   │   │   ├── intelligence_router.py # AI intelligence
│   │   │   └── ws_router.py        # WebSocket connections
│   │   ├── core/                   # Core configurations
│   │   │   ├── config.py           # App settings & env vars
│   │   │   ├── database.py         # DB connection & init
│   │   │   ├── security.py         # Security utilities
│   │   │   └── roles.py            # Role definitions
│   │   ├── models/                 # MongoDB data models
│   │   │   ├── user_model.py
│   │   │   ├── resume_model.py
│   │   │   ├── resume_version_model.py
│   │   │   ├── application_model.py
│   │   │   ├── analysis_model.py
│   │   │   ├── job_model.py
│   │   │   ├── interview_model.py
│   │   │   ├── document_model.py
│   │   │   ├── career_model.py
│   │   │   ├── notification_model.py
│   │   │   ├── organization_model.py
│   │   │   ├── otp_model.py
│   │   │   ├── upload_model.py
│   │   │   └── __init__.py
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── crud/                   # Database CRUD operations
│   │   ├── services/               # Business logic services
│   │   │   ├── ats_service.py
│   │   │   ├── email_service.py
│   │   │   ├── interview_service.py
│   │   │   ├── match_service.py
│   │   │   ├── tailor_service.py
│   │   │   ├── job_insights_service.py
│   │   │   └── ...
│   │   ├── utils/                  # Utility functions
│   │   ├── parsers/                # File parsers (resume, etc.)
│   │   └── main.py                 # App factory entry point
│   ├── data/                       # Data files
│   ├── uploads/                    # Uploaded files
│   ├── logs/                       # Application logs
│   ├── tests/                      # Test suite
│   ├── venv/                       # Python virtual environment
│   ├── requirements.txt            # Python dependencies
│   ├── .env / .env.example         # Environment configuration
│   └── main.py                     # Server entry point
│
├── frontend/                       # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── layout/             # Layout components (Navbar, Footer, Sidebar)
│   │   │   ├── ui/                 # Base UI components (buttons, inputs)
│   │   │   ├── workspace/          # Workspace-specific components
│   │   │   ├── builder/            # Resume builder components
│   │   │   ├── legal/              # Legal page components
│   │   │   └── ...
│   │   ├── pages/                  # Page-level components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CareerVault.jsx
│   │   │   ├── CareerProfile.jsx
│   │   │   ├── CareerAdvisor.jsx
│   │   │   ├── ResumeBuilder.jsx
│   │   │   ├── InterviewHub.jsx
│   │   │   ├── JdAnalyzer.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobApplications.jsx
│   │   │   ├── AtsResult.jsx
│   │   │   ├── AtsSimulator.jsx
│   │   │   ├── OnboardingWizard.jsx
│   │   │   └── ...
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── store/                  # Redux/Zustand state slices
│   │   ├── services/               # API service layer
│   │   ├── constants/              # App constants & theme config
│   │   ├── utils/                  # Helper utilities
│   │   ├── lib/                    # Library configurations
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── App.jsx                 # Main app component with routing
│   │   ├── App.css                 # Global styles
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Base CSS
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML template
│   ├── package.json                # Node dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind config
│   └── components.json             # Radix UI component config
│
├── docker-compose.yml              # Multi-container orchestration
├── README.md                       # This file
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **pnpm**
- **Python** 3.10+ and **pip**
- **Docker** & **Docker Compose** (for infrastructure services)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Thenraja01/ats_website.git
cd ats_website
```

### 2. Set Up Infrastructure (Docker)
```bash
docker-compose up -d
```
This starts:
- **MongoDB** on port `27017`
- **Ollama** (LLM engine) on port `11434`
- **MinIO** (file storage) on ports `9000` (API) and `9001` (console)

Access MinIO Console: `http://localhost:9001` (admin/minioadmin)

### 3. Install & Configure Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

### 4. Install & Configure Frontend
```bash
cd frontend
pnpm install
cp .env.example .env
# Edit .env with your API URL and configuration
```

### 5. Run the Application

**Start Backend:**
```bash
cd backend
python main.py
```
Server runs at `http://localhost:8000`

**Start Frontend:**
```bash
cd frontend
pnpm dev
```
App runs at `http://localhost:3000` (or configured port)

### 6. Run Tests
```bash
# Backend tests
cd backend
pytest tests/
```

---

## 🐳 Docker Setup

The project uses `docker-compose.yml` for orchestrating three core infrastructure services:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **MongoDB** | `mongo:latest` | `27017:27017` | Primary database |
| **Ollama** | `ollama/ollama:latest` | `11434:11434` | Local LLM inference |
| **MinIO** | `minio/minio:latest` | `9000:9000`, `9001:9001` | S3-compatible file storage |

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

> **Note:** You'll need to install and pull LLM models in Ollama separately:
> ```bash
> docker exec -it hiremind-ollama ollama pull llama3
> docker exec -it hiremind-ollama ollama pull mistral
> ```

---

## 🔌 API Endpoints

All API routes are prefixed with `/api/v1` unless otherwise noted.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get tokens |
| POST | `/api/v1/auth/logout` | Logout and invalidate tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/otp/send` | Send OTP for verification |
| POST | `/api/v1/otp/verify` | Verify OTP |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get current user profile |
| PUT | `/api/v1/users/profile` | Update user profile |
| GET | `/api/v1/users/all` | Get all users (Admin) |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/resume/upload` | Upload a resume file |
| GET | `/api/v1/resume/my` | Get user's resumes |
| DELETE | `/api/v1/resume/{id}` | Delete a resume |
| POST | `/api/v1/resume/analyze` | AI-powered resume analysis |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List all jobs |
| POST | `/api/v1/jobs` | Create a new job |
| GET | `/api/v1/jobs/{id}` | Get job details |
| PUT | `/api/v1/jobs/{id}` | Update a job |
| DELETE | `/api/v1/jobs/{id}` | Delete a job |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/applications` | Apply for a job |
| GET | `/api/v1/applications/my` | Get user's applications |
| GET | `/api/v1/applications/job/{id}` | Get applications for a job |

### Career
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/career/profile` | Get career profile |
| POST | `/api/v1/career/advisor` | Get AI career advice |
| GET | `/api/v1/career/vault` | Browse career vault |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/interview/schedule` | Schedule an interview |
| GET | `/api/v1/interview/my` | Get upcoming interviews |
| POST | `/api/v1/interview/questions` | Get AI interview questions |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | Get all users |
| GET | `/api/v1/admin/analytics` | System analytics |
| POST | `/api/v1/admin/roles` | Manage user roles |

### Real-Time (WebSocket)
| Event | Description |
|-------|-------------|
| `connect` | Establish WebSocket connection |
| `notification` | Receive real-time notifications |
| `chat_message` | Send/receive chat messages |

> **Health Check:** `GET /api/v1/health`

---

## 📜 Available Scripts

### Frontend (in `/frontend`)
```bash
pnpm dev        # Start development server with HMR
pnpm build      # Build for production
pnpm preview    # Preview production build locally
pnpm lint       # Run ESLint
pnpm type-check # Run TypeScript type checking
```

### Backend (in `/backend`)
```bash
python main.py  # Start the FastAPI server with uvicorn
pytest tests/   # Run the test suite
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
PROJECT_NAME=HireMind AI Backend
VERSION=1.0.0
DATABASE_URL=mongodb://localhost:27017/hiremind_ai
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Raja MG** — [GitHub Profile](https://github.com/Thenraja01)

---

## 🙏 Acknowledgments

- Built with ❤️ as a final-year academic project
- Powered by **OpenAI/Llama** via **Ollama**
- Icons by **Lucide**
- Styled with **Tailwind CSS**
- UI Components by **Radix UI**
