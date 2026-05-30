# Communication & Notifications Module
### National Freelance and Job Verification Platform

---

## Overview

The **Communication & Notification Module** is a core component of the National Freelance and Skill Verification Platform. It enables secure, real-time interaction between freelancers and clients, ensuring efficient collaboration throughout project lifecycles.

This module centralizes all communication within the platform, reducing reliance on external tools and improving transparency, productivity, and user experience.

---

## Features

- **Real-time Messaging** — Instant one-to-one communication between freelancers and clients via WebSockets
- **Group Chats** — Team-based communication supporting multiple users with admin controls
- **File Sharing** — Upload, send, and download images, videos, and documents within conversations
- **Notifications System** — Real-time alerts for messages, group activity, meetings, and file uploads with read/unread tracking
- **Meeting Integration** — Generate and share meeting links via Daily.co API
- **Message History** — Persistent encrypted storage and retrieval of all conversations
- **Media Gallery** — View all shared files per conversation in one place
- **Dark Mode** — Full light/dark theme support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | NestJS (Node.js) |
| Database | PostgreSQL 16 |
| Real-time | Socket.IO (WebSockets) |
| File Storage | Local disk (Multer) |
| Meeting API | Daily.co |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (production) |

---

## Project Structure

```
SPM_Project/
├── docker-compose.yml        # Orchestrates all services
├── .env                      # Root env vars for Docker (never commit)
├── docs/                      # All neccessary documents
├── sql/                      # PostgreSQL schema + seed files
├── prototype/                # Figma prototype flow video
├── backend/                  # NestJS API + WebSocket gateway
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── uploads               # Sample files and image
│   ├── test                  # Test cases when building module
│   └── src/
│       └── app/
│       ├── chat/             # Messaging, rooms, gateway
│       └── common/           # For encryption
│       └── db/               # For database connectiom
│       ├── media/            # File upload handling
│       ├── meeting/          # Daily.co integration
│       ├── notifications/    # Alerts system
│       └── users/            # User/contact management
│       └── main.ts            
└── Frontend/                 # React + Vite SPA
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── public/
    └── src/
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js v22+](https://nodejs.org/) (for local development only)
- [Git](https://git-scm.com/)

---

## Getting Started with Docker (Recommended)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/communication-module.git
cd communication-module
```

### 2. Set up environment files

Create a root `.env` file:
```bash
cp .env.example .env
```

Fill in the values in `.env`:
```env
# Database
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=db_name

# Backend
DATABASE_URL=postgresql://postgres:yourpassword@postgres:5432/db_name
BASE_URL=http://localhost:3006
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
DAILY_API_KEY=your_daily_api_key
DAILY_DOMAIN=your-domain.daily.co
FRONTEND_URL=http://localhost

# Frontend (baked in at build time)
VITE_BACKEND_URL=http://localhost:3006
VITE_SOCKET_URL=http://localhost:3006
```

Also create `backend/.env` and `Frontend/.env` for local development (see `.env.example`).

### 3. Build and run
```bash
docker compose up --build
```

### 4. Access the app
| Service | URL |
|---|---|
| Frontend | http://localhost |
| Frontend | http://localhost:5006 |
| Backend API | http://localhost:3006 |
| PostgreSQL | localhost:5432 |

---

## Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3006` (Docker frontend available at `http://localhost:5006`).

---

## Stopping the App

```bash
docker compose down
```

To also delete the database volume (full reset):
```bash
docker compose down
docker volume rm spm_project_postgres_data
```

---

## Team

Module 6 — Communication & Notifications  
Nisha Zafran — Tanees Fatima — Amna Shahzad — Haifa Yousaf  
FAST National University — Semester 6 SPM Project
