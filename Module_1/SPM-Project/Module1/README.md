# Nexus Professional — Module 1 (User Profile & Auth)

This repository contains the complete implementation of **Module 1** for the Nexus Professional platform.

## 🚀 Overview
Module 1 handles the core identity layer of the platform, including user registration, authentication, professional profiles, skill management, portfolios, work history, certifications, and reviews.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, PostgreSQL, Multer (Uploads), JWT (Auth), Bcrypt (Security).
- **Frontend**: React 19, Vite, Tailwind CSS v3, Axios, React Router 7.
- **Design**: "Editorial Engine" protocol with premium dark/light mode support.

## 📦 Key Features
- **Premium UI**: Stunning bento-grid dashboard and animated auth pages.
- **Identity Trust**: Integrated verification request flow and verified badges.
- **Skill Matrix**: Dynamic management of professional skills with level tracking.
- **Career Timeline**: Chronological work history and resume-style public profiles.
- **Dockerized**: Full containerization support for local development and staging.

## ⚙️ Setup Instructions

The easiest way to run the project is using **Docker Desktop**.

### 1. Prerequisite
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Launch the Application
Navigate to the `Module1` directory and run:
```bash
docker-compose up --build
```
This single command will:
- Spin up a **PostgreSQL** database.
- Initialize the schema and tables automatically.
- Start the **Node.js Backend** on port `5001`.
- Start the **React Frontend** on port `3000`.

### 3. Access the Platform
Once the containers are running, open your browser to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)

---

### Manual Setup (Alternative)
If you prefer not to use Docker:

**1. Database**: Install PostgreSQL and run `Module1/database/schema.sql` and `triggers.sql`.
**2. Backend**: `cd Module1/backend && npm install && npm start`.
**3. Frontend**: `cd Module1/frontend && npm install && npm run dev`.

## 🎨 Design System
The project follows the Nexus Pro tokens:
- **Primary**: #001736
- **Accent**: #89f5e7
- **Surface**: #f9f9ff (Light) | #00132e (Dark)
- **Typography**: Manrope (Headlines) & Inter (Body)
