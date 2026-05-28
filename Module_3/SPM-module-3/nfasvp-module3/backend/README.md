# Module 3 – Project & Gig Marketplace

## Overview
Module 3 serves as the central hub for the National Freelance & Skill Verification Platform (NFASVP). It is responsible for managing the entire lifecycle of job postings and freelancer gigs, orchestrating bid submissions, and establishing project contracts upon bid acceptance. It acts as the bridge connecting clients to freelancers.

## Architecture
Module 3 is built using a strict 4-Layer Architecture designed for scalability and maintainability:

```
[ HTTP Requests ]
      │
      ▼
┌───────────────────────────────────────────────┐
│              Presentation Layer               │
│  (Express.js Routers, Validations, Auth)      │
└──────────────────────┬────────────────────────┘
                       │
      ▼
┌───────────────────────────────────────────────┐
│                Application Layer              │
│  (Business Logic, Services, State Machines)   │
└─────────┬───────────────────────────┬─────────┘
          │                           │
          ▼                           ▼
┌───────────────────┐       ┌───────────────────┐
│ Data Access Layer │       │ Integration Layer │
│  (Repositories)   │       │  (Axios Clients)  │
└─────────┬─────────┘       └─────────┬─────────┘
          │                           │
          ▼                           ▼
    [ Supabase DB ]             [ Other Modules ]
```

## Tech Stack
- **Runtime:** Node.js v20+
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL (via Supabase JS v2)
- **Security:** `helmet`, `express-rate-limit`, `cors`, DOMPurify logic
- **Testing:** Jest + Supertest

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Configure Environment:**
   Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Database Migration
1. Open your Supabase project dashboard.
2. Navigate to the SQL Editor.
3. Open the file located at `../../supabase/migrations/module3_schema.sql`.
4. Run the complete script to generate tables, policies, functions, and triggers.

## API Endpoints Summary

| Domain | Method | Endpoint | Description | Auth |
|---|---|---|---|---|
| Health | GET | `/api/v1/health` | Service health check | None |
| Jobs | POST | `/api/v1/jobs` | Post a new job | Client |
| Jobs | GET | `/api/v1/jobs` | Dashboard jobs list | Client |
| Jobs | PUT | `/api/v1/jobs/:id` | Edit an open job | Client |
| Bids | POST | `/api/v1/bids` | Submit proposal for job | Freelancer |
| Bids | PUT | `/api/v1/bids/:id/withdraw` | Retract a bid | Freelancer |
| Bids | POST | `/api/v1/bids/:jobId/accept/:bidId` | Accept bid & start contract | Client |
| Gigs | POST | `/api/v1/gigs` | Publish a gig package | Freelancer |
| Gigs | GET | `/api/v1/gigs` | List dashboard gigs | Freelancer |
| Projects | GET | `/api/v1/projects` | View ongoing projects | Both |
| Projects | GET | `/api/v1/projects/:id` | View specific project | Both |
| Search | GET | `/api/v1/search/jobs` | Search jobs via FTS | Open |
| Search | GET | `/api/v1/search/gigs` | Search gigs via FTS | Open |
| Internal | GET | `/api/v1/internal/module4/jobs` | Batch sync jobs for AI | M4 Key |

## Inter-Module Integration

| Module | Direction | Purpose | Protocol |
|---|---|---|---|
| Module 1 (Auth) | Inbound | JWT validation | Secret Key Decode |
| Module 4 (AI) | Inbound | Pulling jobs/gigs for matching | REST (M4 API Key) |
| Module 6 (Comm) | Outbound | Sending bid acceptance notifications | REST (M6 API Key) |
| Module 7 (Escrow)| Outbound | Initiating escrow contracts | REST (M7 API Key) |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Bypass RLS for backend |
| `PORT` | No | Server port (default: 4003) |
| `MODULE1_JWT_SECRET` | Yes | Token decoding secret |
| `MODULE4_API_KEY` | Yes | Key for M4 to access our endpoints |
| `MODULE6_BASE_URL` | Yes | URL for M6 communication |
| `MODULE7_BASE_URL` | Yes | URL for M7 payment setup |
