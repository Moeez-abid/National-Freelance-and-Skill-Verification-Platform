# NFASVP Module 3 Testing

## Backend Unit/API Tests

Run:

```powershell
npm.cmd test --prefix backend
```

Generate HTML report:

```powershell
npm.cmd run test:report --prefix backend
```

Report:

```text
backend/jest-report-final.html
```

Generate coverage report:

```powershell
npm.cmd run test:coverage --prefix backend
```

Coverage report:

```text
backend/coverage/lcov-report/index.html
```

Current verified result:

```text
6 test suites passed
45 tests passed
0 failed
Coverage summary: 32.20% statements, 31.54% branches, 28.28% functions, 34.86% lines
```

## Frontend End-to-End Tests

Requires PostgreSQL seeded and the backend/frontend available. The Playwright config can reuse an existing dev server, or start one with `npm.cmd run dev`.

Run:

```powershell
npm.cmd run test:e2e
```

Open HTML report:

```powershell
npm.cmd run test:e2e:report
```

Report:

```text
playwright-report/index.html
```

Current verified result:

```text
10 E2E tests passed
0 failed
```

Covered E2E flows:

- client dashboard changes per selected seeded user
- gig marketplace search returns services
- freelancer creates a gig in the UI and a client can find it from another account
- client opens a gig detail page from the marketplace
- freelancer project search filters visible projects
- client creates a job in the UI and a freelancer can find it from another account
- global search returns both gig and job result sections
- notifications open target screens and mark as read
- proposal status tabs show pending and accepted proposals
- complete cross-user flow: publish gig, verify from client, post job, verify from freelancer, submit proposal, accept bid, verify project for both users
