# Docker Integration & Architecture Guide

This document provides a comprehensive overview of the application's containerized architecture, database initialization sequence, and backend-frontend integration. This guide is intended for the integration and DevOps teams to understand how the system is wired together and how to troubleshoot common issues.

## 1. System Architecture Overview

The application is deployed using Docker Compose and consists of two primary services:
* **`app`**: A Node.js (Express v5) backend that serves **both** the API endpoints and the static compiled frontend assets on a single port (`5004`).
* **`db`**: A PostgreSQL 15 database that automatically initializes its schema and seeds data upon first startup.

### Unified Frontend & Backend (Port 5004)
To simplify deployment, the frontend (React) and backend (Express) are served from the same container. 
* **API Routes**: Available under `http://localhost:5004/api/*`
* **Frontend**: Available at the root `http://localhost:5004/`

During the Docker build (`pnpm run build`), the frontend codebase (`artifacts/module-4`) is compiled into static assets located in `artifacts/module-4/dist/public`. The Express server then serves these static assets.

## 2. Environment Variables & Security

**Important:** Hardcoding database credentials in `docker-compose.yml` is a security vulnerability. We have mitigated this by using environment variable interpolation.

* **`.env`**: Contains the actual secrets (e.g., `POSTGRES_USER`, `POSTGRES_PASSWORD`). This file is ignored by Git and Docker (via `.dockerignore`).
* **`.env.example`**: A template file committed to version control to guide new developers on which environment variables are required.

Docker Compose automatically reads the `.env` file and passes the credentials into both the `db` and `app` containers. The application does **not** rely on `node --env-file=...` when running in Docker, as Compose injects the variables directly.

## 3. Database Initialization & Seeding

The PostgreSQL container is configured to automatically run SQL scripts on its first startup. This ensures the database is fully structured and seeded without manual intervention.

In `docker-compose.yml`, the scripts are mounted to `/docker-entrypoint-initdb.d/` with numerical prefixes to guarantee alphabetical execution order:
1. `01_SPM_Centralized_Db.sql`: Creates all tables, types, and indexes.
2. `02_SPM_Seed_Data.sql`: Inserts the default seed data into the newly created tables.

> [!WARNING]
> If the database volume (`postgres_data`) already exists, PostgreSQL will skip the initialization scripts. If you modify the SQL schema or seed data, you must wipe the existing volume (`docker-compose down -v`) to trigger a fresh initialization.

## 4. Express 5 Routing (Important for SPAs)

The backend uses **Express v5**, which utilizes `path-to-regexp` v8. This introduced a breaking change regarding wildcard routing.

Previously, Single Page Applications (SPAs) handled client-side routing fallback using `app.get('*', ...)` to serve `index.html`. In Express 5, an unnamed `*` wildcard will throw a `PathError`. 

**The Fix:**
We utilize a generic fallback middleware `app.use((req, res) => { ... })` instead of `.get()`. This safely catches any unmatched routes (like React Router paths) and serves `index.html` without triggering regex parser errors.

```typescript
// Serve static frontend assets
app.use(express.static(path.resolve(process.cwd(), "../../artifacts/module-4/dist/public")));

// SPA Fallback for client-side routing
app.use((req, res) => {
  res.sendFile(path.resolve(process.cwd(), "../../artifacts/module-4/dist/public/index.html"));
});
```

## 5. Build Optimizations & PNPM

### The `.dockerignore` Context
A `.dockerignore` file is implemented to prevent the host machine's `node_modules` and `dist` folders from being copied into the Docker image during the `COPY . .` step. This drastically reduces the Docker build context size and speeds up the build process.

### PNPM TTY Issue
When running `pnpm install` inside Docker, PNPM may attempt to clear existing or mismatched `node_modules`. Because Docker builds run without an interactive terminal (TTY), this previously caused `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. 

To prevent this, the `Dockerfile` sets `ENV CI="true"`, which forces PNPM into automated mode and bypasses confirmation prompts.
