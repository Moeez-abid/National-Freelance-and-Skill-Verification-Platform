# Module 4 — Matching & Recommendation (Frontend Only)

## Goal
Build the **frontend module** for the Matching & Recommendation feature of the National Freelance & Skill Verification Platform. **No backend** — uses local dummy data only. Designed to be plugged into the larger system later.

---

## Scope

### In Scope (this build)
- Frontend pages and components for Module 4
- Dummy data (freelancers, projects, skills, trending skills)
- Matching logic implemented client-side over the dummy data so the UI feels real
- Two user perspectives via a simple role switcher in the navbar:
  - **Freelancer view** — "Recommended Jobs" + "Trending Skills to Learn"
  - **Client view** — "Top Matched Freelancers" for a selected project
- Match score calculation (skill overlap %) and budget/rate alignment filter
- Skill gap analysis with a "Learn this skill" CTA (stubbed — would link to Module 2)

### Out of Scope
- No real backend, no database, no APIs
- No authentication
- No real Module 1 / Module 2 / Module 3 integration (only stub navigation)
- No ML / generative AI

---

## Step-by-Step Build Plan

### Step 1 — Project Setup
- Create a single React + Vite frontend artifact (`module-4`)
- Tailwind + shadcn-style UI components (already pre-wired in the scaffold)
- Mount everything at root `/` so the preview pane shows it immediately

### Step 2 — Dummy Data Layer (`src/data/`)
- `skills.ts` — master list of skill tags (e.g. React, Node.js, Figma, Python, AWS, ...)
- `freelancers.ts` — ~12 freelancers with: `id`, `name`, `title`, `avatar`, `skills[]`, `hourlyRate`, `rating`, `completedProjects`, `location`, `bio`
- `projects.ts` — ~8 projects with: `id`, `title`, `description`, `client`, `requiredSkills[]`, `maxBudget`, `duration`, `postedAt`
- `trendingSkills.ts` — derived from project frequency (top in-demand skills)

### Step 3 — Matching Engine (`src/lib/matching.ts`)
Pure functions, no side effects:
- `calculateMatchScore(freelancerSkills, requiredSkills)` → `{ percentage, matched[], missing[] }`
- `isBudgetAligned(hourlyRate, maxBudget)` → boolean (down-rank if rate exceeds budget by >10%)
- `rankFreelancersForProject(project, freelancers)` → ranked list with score + budget flag
- `recommendProjectsForFreelancer(freelancer, projects)` → ranked list with score + missing skills
- `getTrendingSkills(projects, freelancerSkills?)` → top N skills the freelancer doesn't already have

### Step 4 — Layout & Navigation
- Top navbar with platform logo, primary nav links (Dashboard, Find Work / Find Talent, Skills), and a **Role Switcher** (Freelancer ⇄ Client) for demo purposes
- Persistent layout wrapper with consistent styling

### Step 5 — Freelancer View Pages
- **`/recommended-jobs`** (default for Freelancer)
  - Active freelancer profile card (the "logged in" demo freelancer)
  - Grid of recommended project cards, each with:
    - Match % badge (color coded)
    - Matched skills chips + missing skills chips
    - Budget vs rate indicator
    - "View Details" + "Learn missing skill" CTA
  - Sort/filter (by match %, by budget)
- **`/trending-skills`**
  - Top trending skills with demand counts
  - Highlight skills the freelancer doesn't have yet
  - "Learn on Module 2" CTA (stubbed)

### Step 6 — Client View Pages
- **`/top-matches`** (default for Client)
  - Project selector (dropdown of demo projects)
  - Project summary card
  - Ranked freelancer cards with:
    - Match % badge
    - Matched / missing skills
    - Rate vs budget alignment indicator
    - Profile snippet + "View Profile" CTA
  - Filter: hide budget-misaligned freelancers

### Step 7 — Shared Components (`src/components/`)
- `MatchScoreBadge` — circular % badge with color tier (green / amber / red)
- `SkillChip` — skill tag with variants (matched, missing, neutral)
- `FreelancerCard` — used in client view
- `ProjectCard` — used in freelancer view
- `BudgetIndicator` — rate vs budget visualization
- `RoleSwitcher` — toggles freelancer/client demo mode (uses React context)
- `EmptyState` — for filtered-empty lists

### Step 8 — Polish
- Loading skeletons (simulated brief delay so it feels real)
- Empty / no-match states
- Tooltips explaining match score logic
- Responsive layout (mobile-friendly cards)

### Step 9 — Present
- Open the preview pane so you can click around the demo

---

## Demo Flow (what you'll be able to do)
1. Land on the app — defaults to **Freelancer view**
2. See your profile + recommended jobs ranked by match %
3. Click "Trending Skills" — see what's hot in the market
4. Switch role to **Client** in the navbar
5. Pick a project — see the ranked list of best-matched freelancers
6. See budget alignment flags and skill gaps clearly

---

## Mapping to SRS Requirements
| SRS Req | Where it lives in the UI |
|---|---|
| REQ-1 (skill overlap %) | `calculateMatchScore` + Match badge on every card |
| REQ-2 (ranked list per project) | Client view `/top-matches` |
| REQ-3 (rate vs budget check) | `isBudgetAligned` + `BudgetIndicator` |
| REQ-4 (down-rank over-budget) | Sorting + visual flag in client view |
| REQ-5 (identify missing tags ≥70%) | Missing-skill chips on project cards |
| REQ-6 (notify learn skill) | "Learn this skill" CTA → Module 2 stub |
| REQ-7 (aggregate trending) | `getTrendingSkills` from project frequency |
| REQ-8 (display trending) | `/trending-skills` page |
