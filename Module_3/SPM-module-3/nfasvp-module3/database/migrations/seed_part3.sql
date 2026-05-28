-- =============================================================================
-- SEED PART 3: projects, milestones, git repos, notifications log
-- Run AFTER seed_part1.sql AND seed_part2.sql
-- UUID scheme:
--   Projects:     0000000a-0000-0000-0000-0000000000XX
--   Milestones:   0000000b-0000-0000-0000-0000000000XX
--   Git repos:    0000000c-0000-0000-0000-0000000000XX
--   Notif log:    0000000d-0000-0000-0000-0000000000XX
-- =============================================================================

-- ── PROJECTS ──────────────────────────────────────────────────────────────────
INSERT INTO projects (id, job_id, bid_id, client_id, freelancer_id, title, total_amount, project_type, status, started_at, deadline_at) VALUES
  ('0000000a-0000-0000-0000-000000000001',
   '00000003-0000-0000-0000-000000000002',
   '00000005-0000-0000-0000-000000000004',
   'a1000001-0000-0000-0000-000000000002',
   'b2000001-0000-0000-0000-000000000004',
   'Restaurant Order Management Mobile App',
   75000,'fixed_price','active',
   NOW() - INTERVAL '18 days',
   NOW() + INTERVAL '24 days')
ON CONFLICT (id) DO NOTHING;

-- ── PROJECT MILESTONES ────────────────────────────────────────────────────────
INSERT INTO project_milestones (id, project_id, title, description, amount, due_date, status, sort_order, submitted_at, approved_at) VALUES
  ('0000000b-0000-0000-0000-000000000001',
   '0000000a-0000-0000-0000-000000000001',
   'UI Design & Architecture',
   'Complete all screen wireframes, Figma prototypes, and finalise the app architecture and database schema.',
   20000,
   (CURRENT_DATE - INTERVAL '5 days')::DATE,
   'approved',1,
   NOW() - INTERVAL '7 days',
   NOW() - INTERVAL '5 days'),

  ('0000000b-0000-0000-0000-000000000002',
   '0000000a-0000-0000-0000-000000000001',
   'Core Features Development',
   'Implement order placement flow, real-time order tracking, and kitchen display system integration.',
   35000,
   (CURRENT_DATE + INTERVAL '10 days')::DATE,
   'in_progress',2,NULL,NULL),

  ('0000000b-0000-0000-0000-000000000003',
   '0000000a-0000-0000-0000-000000000001',
   'Push Notifications & Loyalty Programme',
   'Integrate Firebase Cloud Messaging, build loyalty points system, and implement user profile management.',
   12000,
   (CURRENT_DATE + INTERVAL '20 days')::DATE,
   'pending',3,NULL,NULL),

  ('0000000b-0000-0000-0000-000000000004',
   '0000000a-0000-0000-0000-000000000001',
   'Testing, QA & Store Deployment',
   'Full QA cycle, bug fixes, performance optimisation, and deployment to Google Play Store and Apple App Store.',
   8000,
   (CURRENT_DATE + INTERVAL '28 days')::DATE,
   'pending',4,NULL,NULL)
ON CONFLICT (id) DO NOTHING;

-- ── PROJECT GIT REPOS ─────────────────────────────────────────────────────────
INSERT INTO project_git_repos (id, project_id, repo_url, provider, branch, is_private, linked_by) VALUES
  ('0000000c-0000-0000-0000-000000000001',
   '0000000a-0000-0000-0000-000000000001',
   'https://github.com/gigmarket-dev/restaurant-app-module3',
   'github','main',true,
   'b2000001-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- ── NOTIFICATIONS LOG ─────────────────────────────────────────────────────────
INSERT INTO marketplace_notifications_log
  (id, event_type, triggered_by, recipient_id, entity_type, entity_id, payload, module6_sent) VALUES

  ('0000000d-0000-0000-0000-000000000001','bid_submitted',
   'b2000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001',
   'bid','00000005-0000-0000-0000-000000000001',
   '{"message":"New bid received on your job","bid_amount":120000}',true),

  ('0000000d-0000-0000-0000-000000000002','bid_submitted',
   'b2000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000002',
   'bid','00000005-0000-0000-0000-000000000004',
   '{"message":"New bid received on your job","bid_amount":75000}',true),

  ('0000000d-0000-0000-0000-000000000003','bid_accepted',
   'a1000001-0000-0000-0000-000000000002','b2000001-0000-0000-0000-000000000004',
   'bid','00000005-0000-0000-0000-000000000004',
   '{"message":"Your bid was accepted! Project has started.","project_id":"0000000a-0000-0000-0000-000000000001"}',true),

  ('0000000d-0000-0000-0000-000000000004','bid_rejected',
   'a1000001-0000-0000-0000-000000000002','b2000001-0000-0000-0000-000000000001',
   'bid','00000005-0000-0000-0000-000000000005',
   '{"message":"Your bid was not selected for this project."}',true),

  ('0000000d-0000-0000-0000-000000000005','project_started',
   'a1000001-0000-0000-0000-000000000002','b2000001-0000-0000-0000-000000000004',
   'project','0000000a-0000-0000-0000-000000000001',
   '{"message":"Project has officially started.","total_amount":75000}',true),

  ('0000000d-0000-0000-0000-000000000006','milestone_approved',
   'a1000001-0000-0000-0000-000000000002','b2000001-0000-0000-0000-000000000004',
   'milestone','0000000b-0000-0000-0000-000000000001',
   '{"message":"Milestone approved: UI Design & Architecture","amount":20000}',true),

  ('0000000d-0000-0000-0000-000000000007','gig_published',
   'b2000001-0000-0000-0000-000000000001','b2000001-0000-0000-0000-000000000001',
   'gig','00000006-0000-0000-0000-000000000001',
   '{"message":"Your gig is now live on the marketplace."}',true),

  ('0000000d-0000-0000-0000-000000000008','job_posted',
   'a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001',
   'job','00000003-0000-0000-0000-000000000001',
   '{"message":"Your job has been posted and is now accepting bids."}',true)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- UUID REFERENCE CARD
-- =============================================================================
-- Categories:  00000001-...-00000000000{1-9}
-- Tags:        00000002-...-0000000000{01-0f}
-- Jobs:        00000003-...-00000000000{1-8}
-- Job Skills:  00000004-...-0000000000{01-0f}
-- Bids:        00000005-...-0000000000{01-0c}
-- Gigs:        00000006-...-00000000000{1-7}
-- Gig Tiers:   00000007-...-0000000000{01-12}
-- Portfolios:  00000008-...-00000000000{1-9}
-- Gig Skills:  00000009-...-0000000000{01-0d}
-- Projects:    0000000a-...-000000000001
-- Milestones:  0000000b-...-00000000000{1-4}
-- Git Repos:   0000000c-...-000000000001
-- Notif Log:   0000000d-...-00000000000{1-8}
-- Clients:     a1000001-...-00000000000{1-5}
-- Freelancers: b2000001-...-00000000000{1-6}
-- =============================================================================
