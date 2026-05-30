# NFASVP Module 3 – Project & Gig Marketplace

This is the Project & Gig Marketplace module for the National Freelance & Skill Verification Platform (NFASVP).

## 🚀 Getting Started (Docker)

To run this module on any PC with Docker installed, follow these steps:

### 1. Prerequisites
- Docker and Docker Compose installed.
- Access to a Supabase project (for database and storage).

### 2. Environment Setup
Create `.env` files for both frontend and backend by copying the provided templates:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit the `.env` files and fill in your Supabase credentials and other configuration.

### 3. Run with Docker Compose
From the root of this module, run:

```bash
docker-compose up --build
```

This will:
1. Build the backend and frontend images.
2. Start the backend service on `http://localhost:4003`.
3. Start the frontend service on `http://localhost:5173`.
4. The frontend is configured to proxy API requests to the backend container automatically.

### 4. Verify Services
- **Backend Health Check:** [http://localhost:4003/api/v1/health](http://localhost:4003/api/v1/health)
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)

## 🛠 Manual Development
If you prefer to run services manually:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🏗 Architecture
- **Backend:** Node.js + Express + Supabase
- **Frontend:** React + Vite
- **Orchestration:** Docker Compose
