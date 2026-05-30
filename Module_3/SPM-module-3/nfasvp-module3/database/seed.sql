-- =============================================================================
-- Module 3: Project & Gig Marketplace — Seed Data
-- =============================================================================
-- Populates the database with realistic sample data for local development.
--
-- HOW TO RUN:
--   docker exec nfasvp-postgres psql -U postgres -d nfasvp_module3 -f /docker-entrypoint-initdb.d/seed.sql
--   OR via the run command used below.
--
-- USER IDs (from Module 1 / Auth — simulated fixed UUIDs):
--   Clients:     c0000001..c0000003
--   Freelancers: f0000001..f0000004
-- =============================================================================

-- ─── FAKE USER IDs (Module 1 simulated) ───────────────────────────────────────
-- client_1  = 'c1000000-0000-0000-0000-000000000001'
-- client_2  = 'c1000000-0000-0000-0000-000000000002'
-- client_3  = 'c1000000-0000-0000-0000-000000000003'
-- free_1    = 'f1000000-0000-0000-0000-000000000001'
-- free_2    = 'f1000000-0000-0000-0000-000000000002'
-- free_3    = 'f1000000-0000-0000-0000-000000000003'
-- free_4    = 'f1000000-0000-0000-0000-000000000004'

-- =============================================================================
-- 1. CATEGORIES
-- =============================================================================

INSERT INTO marketplace_categories (id, name, slug, description, is_active, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000001', 'Web Development',      'web-development',      'Frontend, backend and full-stack web projects',    true, 1),
  ('00000001-0000-0000-0000-000000000002', 'Mobile Development',   'mobile-development',   'iOS, Android and cross-platform mobile apps',      true, 2),
  ('00000001-0000-0000-0000-000000000003', 'UI/UX Design',         'ui-ux-design',         'User interface and user experience design',         true, 3),
  ('00000001-0000-0000-0000-000000000004', 'Data Science & AI',    'data-science-ai',      'Machine learning, data analysis and AI solutions', true, 4),
  ('00000001-0000-0000-0000-000000000005', 'DevOps & Cloud',       'devops-cloud',         'CI/CD, cloud infrastructure and automation',        true, 5),
  ('00000001-0000-0000-0000-000000000006', 'Cybersecurity',        'cybersecurity',        'Penetration testing, audits and security reviews', true, 6),
  ('00000001-0000-0000-0000-000000000007', 'Content Writing',      'content-writing',      'Blog posts, copywriting and technical writing',     true, 7),
  ('00000001-0000-0000-0000-000000000008', 'Graphic Design',       'graphic-design',       'Logos, branding, illustrations and print design',  true, 8)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. TAGS
-- =============================================================================

INSERT INTO marketplace_tags (id, name, slug, category_id, is_verified, usage_count) VALUES
  ('00000002-0000-0000-0000-000000000001', 'React',           'react',           '00000001-0000-0000-0000-000000000001', true,  120),
  ('00000002-0000-0000-0000-000000000002', 'Node.js',         'nodejs',          '00000001-0000-0000-0000-000000000001', true,  98),
  ('00000002-0000-0000-0000-000000000003', 'PostgreSQL',      'postgresql',      '00000001-0000-0000-0000-000000000001', true,  75),
  ('00000002-0000-0000-0000-000000000004', 'TypeScript',      'typescript',      '00000001-0000-0000-0000-000000000001', true,  88),
  ('00000002-0000-0000-0000-000000000005', 'Python',          'python',          '00000001-0000-0000-0000-000000000004', true,  145),
  ('00000002-0000-0000-0000-000000000006', 'Machine Learning','machine-learning','00000001-0000-0000-0000-000000000004', true,  67),
  ('00000002-0000-0000-0000-000000000007', 'Flutter',         'flutter',         '00000001-0000-0000-0000-000000000002', true,  54),
  ('00000002-0000-0000-0000-000000000008', 'React Native',    'react-native',    '00000001-0000-0000-0000-000000000002', true,  61),
  ('00000002-0000-0000-0000-000000000009', 'Figma',           'figma',           '00000001-0000-0000-0000-000000000003', true,  80),
  ('00000002-0000-0000-0000-000000000010', 'Docker',          'docker',          '00000001-0000-0000-0000-000000000005', true,  55),
  ('00000002-0000-0000-0000-000000000011', 'AWS',             'aws',             '00000001-0000-0000-0000-000000000005', true,  72),
  ('00000002-0000-0000-0000-000000000012', 'Kubernetes',      'kubernetes',      '00000001-0000-0000-0000-000000000005', true,  41),
  ('00000002-0000-0000-0000-000000000013', 'TailwindCSS',     'tailwindcss',     '00000001-0000-0000-0000-000000000001', true,  66),
  ('00000002-0000-0000-0000-000000000014', 'Vue.js',          'vuejs',           '00000001-0000-0000-0000-000000000001', true,  49),
  ('00000002-0000-0000-0000-000000000015', 'Django',          'django',          '00000001-0000-0000-0000-000000000001', true,  43),
  ('00000002-0000-0000-0000-000000000016', 'iOS (Swift)',     'swift',           '00000001-0000-0000-0000-000000000002', true,  38),
  ('00000002-0000-0000-0000-000000000017', 'Cybersecurity',   'cybersecurity',   '00000001-0000-0000-0000-000000000006', true,  29),
  ('00000002-0000-0000-0000-000000000018', 'SEO Writing',     'seo-writing',     '00000001-0000-0000-0000-000000000007', true,  35),
  ('00000002-0000-0000-0000-000000000019', 'Logo Design',     'logo-design',     '00000001-0000-0000-0000-000000000008', true,  58),
  ('00000002-0000-0000-0000-000000000020', 'Data Analysis',   'data-analysis',   '00000001-0000-0000-0000-000000000004', true,  62)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 3. JOBS
-- =============================================================================

INSERT INTO jobs (
  id, client_id, title, description, category_id,
  project_type, budget_min, budget_max, duration_label,
  experience_level, status, bids_count, is_verified, expires_at
) VALUES

  -- Job 1: Full-stack web app (OPEN)
  (
    '00000003-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Build a Full-Stack E-Commerce Platform with React & Node.js',
    'We need an experienced full-stack developer to build a complete e-commerce platform. The platform should include product listings, shopping cart, user authentication, payment gateway integration (Stripe), and an admin dashboard. Must be responsive and mobile-friendly.',
    '00000001-0000-0000-0000-000000000001',
    'fixed_price', 1500.00, 3000.00, '4-6 weeks',
    'expert', 'open', 3, true,
    NOW() + INTERVAL '30 days'
  ),

  -- Job 2: Mobile App (OPEN)
  (
    '00000003-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'Cross-Platform Fitness Tracking App in Flutter',
    'Looking for a Flutter developer to build a fitness tracking mobile app for iOS and Android. Features include: workout logging, progress charts, integration with health APIs (Google Fit / Apple HealthKit), push notifications, and a social feed for sharing achievements.',
    '00000001-0000-0000-0000-000000000002',
    'fixed_price', 2000.00, 4000.00, '6-8 weeks',
    'intermediate', 'open', 2, true,
    NOW() + INTERVAL '25 days'
  ),

  -- Job 3: UI/UX (OPEN)
  (
    '00000003-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000003',
    'UI/UX Design for a SaaS Project Management Tool',
    'We are building a SaaS tool for project management and need a UI/UX designer to create wireframes and high-fidelity Figma prototypes. The design should be clean, modern, and intuitive. Deliverables: user research, information architecture, wireframes, Figma design system, and interactive prototype.',
    '00000001-0000-0000-0000-000000000003',
    'fixed_price', 800.00, 1500.00, '3-4 weeks',
    'intermediate', 'open', 1, true,
    NOW() + INTERVAL '20 days'
  ),

  -- Job 4: Data Science (OPEN)
  (
    '00000003-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'Machine Learning Model for Customer Churn Prediction',
    'We need a data scientist to build and deploy a machine learning model to predict customer churn for our SaaS business. You will be provided with 2 years of historical data. Expected deliverables: EDA report, trained model (scikit-learn or PyTorch), REST API endpoint, and accuracy report.',
    '00000001-0000-0000-0000-000000000004',
    'fixed_price', 1200.00, 2500.00, '3-5 weeks',
    'expert', 'open', 4, true,
    NOW() + INTERVAL '15 days'
  ),

  -- Job 5: DevOps (OPEN)
  (
    '00000003-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000002',
    'Set Up CI/CD Pipeline and AWS Infrastructure for Node.js App',
    'We have a Node.js backend and React frontend that need a proper DevOps setup. Requirements: Docker containerization, Terraform for AWS infrastructure, GitHub Actions CI/CD pipeline, auto-scaling with ECS, RDS PostgreSQL setup, CloudFront CDN, and monitoring with CloudWatch.',
    '00000001-0000-0000-0000-000000000005',
    'hourly', 40.00, 80.00, '2-3 weeks',
    'expert', 'open', 2, false,
    NOW() + INTERVAL '18 days'
  ),

  -- Job 6: Web Dev (IN PROGRESS — bid accepted, project created)
  (
    '00000003-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000003',
    'WordPress Blog Migration to Next.js with Headless CMS',
    'Migrate an existing WordPress blog (200+ posts) to a Next.js frontend with Contentful as headless CMS. Must preserve all URLs, SEO metadata, images, and categories. Performance target: Lighthouse score above 90.',
    '00000001-0000-0000-0000-000000000001',
    'fixed_price', 700.00, 1200.00, '2-3 weeks',
    'intermediate', 'in_progress', 5, true,
    NOW() + INTERVAL '10 days'
  ),

  -- Job 7: Content Writing (OPEN)
  (
    '00000003-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000001',
    'Technical Blog Writer for SaaS Development Topics (10 Articles)',
    'We need a skilled technical writer to produce 10 in-depth blog articles (1500-2500 words each) on topics like API design, microservices, cloud architecture, and developer productivity tools. SEO-optimised with keyword research provided.',
    '00000001-0000-0000-0000-000000000007',
    'fixed_price', 400.00, 800.00, '3 weeks',
    'intermediate', 'open', 0, false,
    NOW() + INTERVAL '21 days'
  ),

  -- Job 8: Mobile (OPEN)
  (
    '00000003-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000002',
    'React Native Food Delivery App (Uber Eats Clone)',
    'Build a food delivery app similar to Uber Eats using React Native. Must include: restaurant listings, menu browsing, cart management, real-time order tracking with Google Maps, push notifications, and payment integration.',
    '00000001-0000-0000-0000-000000000002',
    'fixed_price', 3000.00, 6000.00, '8-12 weeks',
    'expert', 'open', 1, true,
    NOW() + INTERVAL '35 days'
  ),

  -- Job 9: Graphic Design (OPEN)
  (
    '00000003-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000003',
    'Brand Identity Design for a FinTech Startup',
    'Our FinTech startup needs a complete brand identity package including: logo (multiple formats), color palette, typography guide, business card design, social media templates, and a brand guidelines PDF document.',
    '00000001-0000-0000-0000-000000000008',
    'fixed_price', 500.00, 1000.00, '2 weeks',
    'intermediate', 'open', 2, false,
    NOW() + INTERVAL '14 days'
  ),

  -- Job 10: Cybersecurity (OPEN)
  (
    '00000003-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000001',
    'Web Application Penetration Testing & Security Audit',
    'We need a certified cybersecurity professional to conduct a full penetration test on our web application and REST APIs. Deliverables: vulnerability assessment report, proof-of-concept exploits, CVSS scores, and a remediation roadmap.',
    '00000001-0000-0000-0000-000000000006',
    'fixed_price', 1000.00, 2000.00, '1-2 weeks',
    'expert', 'open', 1, true,
    NOW() + INTERVAL '12 days'
  )

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. JOB REQUIRED SKILLS
-- =============================================================================

INSERT INTO job_required_skills (job_id, tag_id, level) VALUES
  -- Job 1: React, Node.js, PostgreSQL, TypeScript
  ('00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001', 'expert'),
  ('00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000002', 'expert'),
  ('00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000003', 'intermediate'),
  ('00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000004', 'intermediate'),
  -- Job 2: Flutter
  ('00000003-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000007', 'expert'),
  -- Job 3: Figma
  ('00000003-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000009', 'expert'),
  -- Job 4: Python, ML, Data Analysis
  ('00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000005', 'expert'),
  ('00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000006', 'expert'),
  ('00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000020', 'intermediate'),
  -- Job 5: Docker, AWS, Kubernetes
  ('00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000010', 'expert'),
  ('00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000011', 'expert'),
  ('00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000012', 'intermediate'),
  -- Job 6: React, Node.js
  ('00000003-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000001', 'intermediate'),
  ('00000003-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000002', 'intermediate'),
  -- Job 7: SEO Writing
  ('00000003-0000-0000-0000-000000000007', '00000002-0000-0000-0000-000000000018', 'expert'),
  -- Job 8: React Native
  ('00000003-0000-0000-0000-000000000008', '00000002-0000-0000-0000-000000000008', 'expert'),
  -- Job 9: Logo Design
  ('00000003-0000-0000-0000-000000000009', '00000002-0000-0000-0000-000000000019', 'expert'),
  -- Job 10: Cybersecurity
  ('00000003-0000-0000-0000-000000000010', '00000002-0000-0000-0000-000000000017', 'expert')
ON CONFLICT (job_id, tag_id) DO NOTHING;

-- =============================================================================
-- 5. GIGS
-- =============================================================================

INSERT INTO gigs (
  id, freelancer_id, category_id, title, description,
  status, orders_count, avg_rating, review_count, is_featured
) VALUES

  -- Gig 1: React Dev
  (
    '00000004-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'I will build your React.js web application with modern UI',
    'Professional React.js developer with 5+ years of experience. I specialize in building fast, scalable, and beautiful web apps. Services include component development, state management (Redux/Zustand), API integration, performance optimization, and deployment.',
    'live', 24, 4.90, 18, true
  ),

  -- Gig 2: Full Stack
  (
    '00000004-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'I will develop a full stack MERN application for your business',
    'End-to-end full stack development using MongoDB, Express, React, and Node.js. I deliver clean, well-documented code with proper authentication, REST APIs, and database design. Perfect for startups and small businesses.',
    'live', 12, 4.75, 9, false
  ),

  -- Gig 3: Flutter App
  (
    '00000004-0000-0000-0000-000000000003',
    'f1000000-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000002',
    'I will create a stunning Flutter mobile app for iOS and Android',
    'Expert Flutter developer delivering beautiful, performant cross-platform mobile applications. Includes Firebase integration, state management (Bloc/Provider), custom animations, and App Store/Play Store deployment support.',
    'live', 31, 4.95, 26, true
  ),

  -- Gig 4: UI/UX Design
  (
    '00000004-0000-0000-0000-000000000004',
    'f1000000-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000003',
    'I will design a modern UI/UX prototype in Figma',
    'UI/UX designer with 6 years of experience creating user-centered digital products. I deliver wireframes, high-fidelity designs, interactive prototypes, and design systems. Specialised in SaaS, fintech, and e-commerce products.',
    'live', 47, 4.85, 39, true
  ),

  -- Gig 5: Python ML
  (
    '00000004-0000-0000-0000-000000000005',
    'f1000000-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000004',
    'I will build and deploy a machine learning model in Python',
    'Data scientist specializing in supervised and unsupervised machine learning models. I work with scikit-learn, TensorFlow, and PyTorch. Deliverables include EDA, model training, evaluation metrics, and FastAPI deployment.',
    'live', 19, 4.80, 14, false
  ),

  -- Gig 6: DevOps / Docker
  (
    '00000004-0000-0000-0000-000000000006',
    'f1000000-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000005',
    'I will set up Docker, CI/CD and cloud infrastructure for your app',
    'DevOps engineer with expertise in Docker, Kubernetes, GitHub Actions, and AWS/GCP. I help teams automate deployment pipelines, containerize applications, and set up scalable cloud infrastructure with proper monitoring.',
    'live', 8, 4.70, 6, false
  ),

  -- Gig 7: Logo Design
  (
    '00000004-0000-0000-0000-000000000007',
    'f1000000-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000008',
    'I will design a professional logo and brand identity for your business',
    'Creative graphic designer delivering unique, memorable logos and complete brand identity packages. Every design includes unlimited revisions, vector files (AI, EPS, SVG), PNG/JPG exports, and a brand guide PDF.',
    'live', 62, 4.92, 55, true
  ),

  -- Gig 8: React Native (paused)
  (
    '00000004-0000-0000-0000-000000000008',
    'f1000000-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000002',
    'I will build a React Native app with Redux and Firebase',
    'Full-featured React Native mobile apps with real-time database, authentication, push notifications, and in-app purchases. Experienced with complex navigation flows and native module integration.',
    'paused', 5, 4.60, 4, false
  ),

  -- Gig 9: Data Analysis
  (
    '00000004-0000-0000-0000-000000000009',
    'f1000000-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000004',
    'I will perform data analysis and create stunning dashboards',
    'Data analyst offering in-depth analysis using Python (Pandas, Matplotlib, Seaborn) and BI tools (Power BI, Tableau). I turn raw data into actionable insights with clear visualizations and executive-ready reports.',
    'live', 27, 4.88, 22, false
  ),

  -- Gig 10: Content Writing
  (
    '00000004-0000-0000-0000-000000000010',
    'f1000000-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000007',
    'I will write SEO-optimized technical articles and blog posts',
    'Technical writer and content strategist with expertise in software development, cloud computing, and SaaS topics. I deliver well-researched, SEO-optimized long-form articles that rank on Google and engage developer audiences.',
    'live', 38, 4.78, 31, false
  )

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. GIG PRICING TIERS
-- =============================================================================

INSERT INTO gig_pricing_tiers (gig_id, tier, package_name, description, price, delivery_days, revisions, deliverables) VALUES

  -- Gig 1: React Dev
  ('00000004-0000-0000-0000-000000000001', 'basic',    'Starter',     'Up to 3 React components with styling',          150.00, 3,  '2', ARRAY['Source code', 'README']),
  ('00000004-0000-0000-0000-000000000001', 'standard', 'Professional','Full page with up to 8 components + routing',     350.00, 7,  '4', ARRAY['Source code', 'README', 'Deployment guide']),
  ('00000004-0000-0000-0000-000000000001', 'premium',  'Enterprise',  'Complete React app with auth, API, state mgmt',   700.00, 14, '6', ARRAY['Source code', 'README', 'Deployment guide', 'Unit tests']),

  -- Gig 2: Full Stack MERN
  ('00000004-0000-0000-0000-000000000002', 'basic',    'Basic API',   '3 REST API endpoints + React frontend page',     300.00, 5,  '2', ARRAY['Source code', 'API docs']),
  ('00000004-0000-0000-0000-000000000002', 'standard', 'Full Stack',  'Complete MERN app with auth and CRUD',            600.00, 10, '3', ARRAY['Source code', 'API docs', 'Deployment']),
  ('00000004-0000-0000-0000-000000000002', 'premium',  'SaaS Ready',  'Multi-tenant MERN app with payments & dashboard', 1200.00,21, '5', ARRAY['Source code', 'API docs', 'Deployment', 'Tests', 'CI/CD']),

  -- Gig 3: Flutter
  ('00000004-0000-0000-0000-000000000003', 'basic',    'Single Screen', 'One Flutter screen with navigation',            200.00, 3,  '3', ARRAY['Flutter source code', 'APK']),
  ('00000004-0000-0000-0000-000000000003', 'standard', 'App Module',    '5-screen Flutter app with Firebase',            500.00, 10, '5', ARRAY['Flutter source code', 'APK', 'IPA']),
  ('00000004-0000-0000-0000-000000000003', 'premium',  'Full App',      'Complete Flutter app with backend + stores',    1000.00, 21, '7', ARRAY['Source code', 'APK', 'IPA', 'Store submission']),

  -- Gig 4: UI/UX Design
  ('00000004-0000-0000-0000-000000000004', 'basic',    'Wireframes',    '5 wireframe screens in Figma',                  150.00, 3,  '3', ARRAY['Figma file', 'PDF export']),
  ('00000004-0000-0000-0000-000000000004', 'standard', 'UI Design',     '10 high-fidelity screens + design system',      350.00, 7,  '5', ARRAY['Figma file', 'PDF export', 'Component library']),
  ('00000004-0000-0000-0000-000000000004', 'premium',  'Full UX',       'Complete UX research + 20 screens + prototype', 700.00, 14, 'unlimited', ARRAY['Figma file', 'Prototype', 'User research', 'Brand guide']),

  -- Gig 5: ML Model
  ('00000004-0000-0000-0000-000000000005', 'basic',    'EDA Report',    'Exploratory data analysis + report',            200.00, 5,  '1', ARRAY['Jupyter notebook', 'PDF report']),
  ('00000004-0000-0000-0000-000000000005', 'standard', 'ML Model',      'Trained model + evaluation metrics',             500.00, 10, '2', ARRAY['Jupyter notebook', 'Trained model', 'Report']),
  ('00000004-0000-0000-0000-000000000005', 'premium',  'Production ML', 'Model + FastAPI endpoint + Docker deployment',   900.00, 18, '3', ARRAY['Source code', 'Model', 'API', 'Docker', 'Report']),

  -- Gig 7: Logo Design
  ('00000004-0000-0000-0000-000000000007', 'basic',    'Simple Logo',   '1 logo concept, 2 revisions',                    80.00, 2,  '2', ARRAY['PNG', 'JPG']),
  ('00000004-0000-0000-0000-000000000007', 'standard', 'Brand Package', '3 logo concepts + brand colors + typography',   200.00, 5,  '5', ARRAY['PNG', 'JPG', 'SVG', 'AI', 'Brand guide']),
  ('00000004-0000-0000-0000-000000000007', 'premium',  'Full Identity', 'Logo + full brand identity + stationery',        400.00, 10, 'unlimited', ARRAY['All formats', 'Brand guide', 'Business card', 'Letterhead']),

  -- Gig 9: Data Analysis
  ('00000004-0000-0000-0000-000000000009', 'basic',    'Quick Analysis', 'Data cleaning + basic stats report',            100.00, 3,  '1', ARRAY['Excel/CSV', 'PDF report']),
  ('00000004-0000-0000-0000-000000000009', 'standard', 'Dashboard',     'Interactive Power BI / Tableau dashboard',       250.00, 7,  '3', ARRAY['Dashboard file', 'PDF', 'Data file']),
  ('00000004-0000-0000-0000-000000000009', 'premium',  'Full Analytics', 'Full analysis + predictive model + dashboard',  500.00, 14, '5', ARRAY['Dashboard', 'Model', 'Code', 'Report']),

  -- Gig 10: Content Writing
  ('00000004-0000-0000-0000-000000000010', 'basic',    '1 Article',     '1 SEO article up to 1500 words',                  60.00, 3,  '1', ARRAY['Word doc', 'SEO checklist']),
  ('00000004-0000-0000-0000-000000000010', 'standard', '3 Articles',    '3 articles up to 2000 words each',               160.00, 7,  '2', ARRAY['Word docs', 'SEO reports', 'Meta descriptions']),
  ('00000004-0000-0000-0000-000000000010', 'premium',  '10 Articles',   '10 articles + keyword research + content plan',  450.00, 21, '3', ARRAY['Word docs', 'SEO reports', 'Content calendar', 'Keyword research'])

ON CONFLICT (gig_id, tier) DO NOTHING;

-- =============================================================================
-- 7. GIG REQUIRED SKILLS
-- =============================================================================

INSERT INTO gig_required_skills (gig_id, tag_id) VALUES
  ('00000004-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001'), -- React
  ('00000004-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000004'), -- TypeScript
  ('00000004-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000013'), -- TailwindCSS
  ('00000004-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001'), -- React
  ('00000004-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000002'), -- Node.js
  ('00000004-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000003'), -- PostgreSQL
  ('00000004-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000007'), -- Flutter
  ('00000004-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000009'), -- Figma
  ('00000004-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000005'), -- Python
  ('00000004-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000006'), -- ML
  ('00000004-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000010'), -- Docker
  ('00000004-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000011'), -- AWS
  ('00000004-0000-0000-0000-000000000007', '00000002-0000-0000-0000-000000000019'), -- Logo Design
  ('00000004-0000-0000-0000-000000000008', '00000002-0000-0000-0000-000000000008'), -- React Native
  ('00000004-0000-0000-0000-000000000009', '00000002-0000-0000-0000-000000000005'), -- Python
  ('00000004-0000-0000-0000-000000000009', '00000002-0000-0000-0000-000000000020'), -- Data Analysis
  ('00000004-0000-0000-0000-000000000010', '00000002-0000-0000-0000-000000000018')  -- SEO Writing
ON CONFLICT (gig_id, tag_id) DO NOTHING;

-- =============================================================================
-- 8. BIDS (on open jobs)
-- =============================================================================

INSERT INTO bids (
  id, job_id, freelancer_id, bid_amount, bid_type,
  duration_label, cover_letter, status, milestones
) VALUES

  -- Bids on Job 1 (Full-Stack E-Commerce)
  (
    '00000005-0000-0000-0000-000000000001',
    '00000003-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    2200.00, 'fixed_price', '5 weeks',
    'I have built 10+ e-commerce platforms using React and Node.js with Stripe integration. I can deliver a fully functional platform with an admin dashboard, product management, and seamless checkout. I will use PostgreSQL for the database and deploy on AWS.',
    'pending',
    '[{"title":"Setup & Auth","amount":400},{"title":"Product & Cart","amount":700},{"title":"Payment & Checkout","amount":600},{"title":"Admin Dashboard & Deployment","amount":500}]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000002',
    '00000003-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000002',
    1900.00, 'fixed_price', '4 weeks',
    'Full-stack developer with React, Node.js and TypeScript expertise. I have a ready-made e-commerce boilerplate that I can customise to your needs, saving significant development time. Stripe integration is something I have done in 5 previous projects.',
    'pending',
    '[]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000003',
    '00000003-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000003',
    2800.00, 'fixed_price', '6 weeks',
    'Senior full-stack engineer with 8 years of experience. I will build a production-ready e-commerce platform with full test coverage, CI/CD pipeline, and comprehensive documentation. My previous work includes platforms handling 10k+ daily users.',
    'pending',
    '[{"title":"Phase 1 - Foundation","amount":800},{"title":"Phase 2 - Core Features","amount":1200},{"title":"Phase 3 - Testing & Launch","amount":800}]'::jsonb
  ),

  -- Bids on Job 2 (Flutter Fitness App)
  (
    '00000005-0000-0000-0000-000000000004',
    '00000003-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000002',
    3200.00, 'fixed_price', '7 weeks',
    'Flutter expert with 4 years of experience building health and fitness apps. I have previously built a similar workout tracking app with Google Fit and Apple HealthKit integrations. I use Bloc for state management and Firebase for real-time sync.',
    'pending',
    '[]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000005',
    '00000003-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000004',
    2500.00, 'fixed_price', '6 weeks',
    'Mobile developer specializing in Flutter and Firebase. I can deliver a clean, performant fitness app with smooth animations, offline support, and proper health API integration. I have deployed 15+ apps to both stores.',
    'pending',
    '[{"title":"UI & Navigation","amount":600},{"title":"Workout Logging & Charts","amount":900},{"title":"Health API & Social Feed","amount":700},{"title":"Testing & Deployment","amount":300}]'::jsonb
  ),

  -- Bid on Job 3 (UI/UX Design)
  (
    '00000005-0000-0000-0000-000000000006',
    '00000003-0000-0000-0000-000000000003',
    'f1000000-0000-0000-0000-000000000003',
    1200.00, 'fixed_price', '3 weeks',
    'UI/UX designer specializing in SaaS products with 6 years of experience. I will conduct user research, create an information architecture, build a component-based design system in Figma, and deliver an interactive prototype. I have designed for B2B SaaS tools used by 50k+ users.',
    'pending',
    '[{"title":"Research & Wireframes","amount":350},{"title":"Visual Design & Components","amount":500},{"title":"Prototype & Handoff","amount":350}]'::jsonb
  ),

  -- Bids on Job 4 (ML Churn Prediction)
  (
    '00000005-0000-0000-0000-000000000007',
    '00000003-0000-0000-0000-000000000004',
    'f1000000-0000-0000-0000-000000000004',
    1800.00, 'fixed_price', '4 weeks',
    'Data scientist with PhD in Machine Learning. I have built multiple churn prediction models for SaaS businesses achieving 85-92% accuracy. I will use XGBoost/LightGBM with proper cross-validation and deploy the model via FastAPI. Full EDA and feature engineering included.',
    'pending',
    '[{"title":"EDA & Feature Engineering","amount":400},{"title":"Model Training & Tuning","amount":700},{"title":"API Deployment & Report","amount":700}]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000004',
    'f1000000-0000-0000-0000-000000000001',
    2200.00, 'fixed_price', '5 weeks',
    'Machine learning engineer with experience deploying production ML systems. I will build an ensemble model combining XGBoost and neural network approaches, with a full MLflow experiment tracking setup and REST API deployment on AWS Lambda.',
    'pending',
    '[]'::jsonb
  ),

  -- Bids on Job 5 (DevOps AWS)
  (
    '00000005-0000-0000-0000-000000000009',
    '00000003-0000-0000-0000-000000000005',
    'f1000000-0000-0000-0000-000000000001',
    60.00, 'hourly', '2-3 weeks',
    'AWS certified DevOps engineer with 5 years of experience. I will set up a complete Infrastructure as Code solution using Terraform, containerize your app with Docker, and build a full CI/CD pipeline with GitHub Actions. Estimated 80-100 hours total.',
    'pending',
    '[]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000010',
    '00000003-0000-0000-0000-000000000005',
    'f1000000-0000-0000-0000-000000000004',
    55.00, 'hourly', '3 weeks',
    'DevOps consultant with AWS Solutions Architect certification. I will implement a production-grade infrastructure with auto-scaling, load balancing, RDS with read replicas, and a comprehensive monitoring/alerting stack.',
    'pending',
    '[]'::jsonb
  ),

  -- Accepted bid on Job 6 (already in_progress)
  (
    '00000005-0000-0000-0000-000000000011',
    '00000003-0000-0000-0000-000000000006',
    'f1000000-0000-0000-0000-000000000002',
    950.00, 'fixed_price', '2.5 weeks',
    'Next.js specialist with experience migrating WordPress sites to headless CMS setups. I have done 8 similar migrations preserving all SEO and content. I will use Contentful, set up redirects properly, and ensure your Lighthouse score exceeds 90.',
    'accepted',
    '[{"title":"Content Migration","amount":350},{"title":"Next.js Frontend","amount":400},{"title":"SEO & Performance","amount":200}]'::jsonb
  ),

  -- Bid on Job 8 (React Native Food App)
  (
    '00000005-0000-0000-0000-000000000012',
    '00000003-0000-0000-0000-000000000008',
    'f1000000-0000-0000-0000-000000000002',
    4500.00, 'fixed_price', '10 weeks',
    'React Native developer with experience building marketplace apps. I have built 3 food delivery apps including real-time order tracking with Google Maps, Stripe payment integration, and push notifications. I can deliver a complete, App Store-ready product.',
    'pending',
    '[{"title":"Auth & Restaurant Listings","amount":900},{"title":"Menu & Cart","amount":1000},{"title":"Order Tracking & Maps","amount":1200},{"title":"Payments & Notifications","amount":900},{"title":"Testing & Launch","amount":500}]'::jsonb
  ),

  -- Bids on Job 9 (Brand Identity)
  (
    '00000005-0000-0000-0000-000000000013',
    '00000003-0000-0000-0000-000000000009',
    'f1000000-0000-0000-0000-000000000003',
    750.00, 'fixed_price', '12 days',
    'Brand identity designer with 8 years of experience working with FinTech and startup clients. I understand the trust and professionalism required in financial branding. I will deliver 3 unique logo concepts and a comprehensive brand guide.',
    'pending',
    '[{"title":"Logo Concepts & Selection","amount":300},{"title":"Brand Identity System","amount":300},{"title":"Final Deliverables","amount":150}]'::jsonb
  ),
  (
    '00000005-0000-0000-0000-000000000014',
    '00000003-0000-0000-0000-000000000009',
    'f1000000-0000-0000-0000-000000000004',
    600.00, 'fixed_price', '10 days',
    'Graphic designer specializing in modern, minimalist branding for tech companies. My designs are clean, versatile, and work across all mediums. Previous FinTech clients include 3 funded startups.',
    'pending',
    '[]'::jsonb
  ),

  -- Bid on Job 10 (Penetration Testing)
  (
    '00000005-0000-0000-0000-000000000015',
    '00000003-0000-0000-0000-000000000010',
    'f1000000-0000-0000-0000-000000000004',
    1500.00, 'fixed_price', '10 days',
    'OSCP-certified penetration tester with 6 years of experience. I conduct thorough web application and API security assessments using OWASP methodology. Deliverables include an executive summary, detailed technical report with CVSS scores, and a remediation roadmap.',
    'pending',
    '[{"title":"Reconnaissance & Scanning","amount":300},{"title":"Exploitation & Testing","amount":700},{"title":"Report & Remediation Plan","amount":500}]'::jsonb
  )

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 9. PROJECT (for the in_progress job)
-- =============================================================================

INSERT INTO projects (
  id, job_id, bid_id, client_id, freelancer_id,
  title, total_amount, project_type, status,
  started_at, deadline_at
) VALUES (
  '00000006-0000-0000-0000-000000000001',
  '00000003-0000-0000-0000-000000000006',
  '00000005-0000-0000-0000-000000000011',
  'c1000000-0000-0000-0000-000000000003',
  'f1000000-0000-0000-0000-000000000002',
  'WordPress Blog Migration to Next.js with Headless CMS',
  950.00, 'fixed_price', 'active',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. PROJECT MILESTONES
-- =============================================================================

INSERT INTO project_milestones (
  id, project_id, title, description, amount, due_date, status, sort_order
) VALUES
  (
    '00000007-0000-0000-0000-000000000001',
    '00000006-0000-0000-0000-000000000001',
    'Content Migration',
    'Export all 200+ WordPress posts and import into Contentful CMS with proper categories and metadata',
    350.00,
    (NOW() + INTERVAL '5 days')::date,
    'in_progress', 1
  ),
  (
    '00000007-0000-0000-0000-000000000002',
    '00000006-0000-0000-0000-000000000001',
    'Next.js Frontend Development',
    'Build the Next.js frontend with all pages, dynamic routes, and Contentful API integration',
    400.00,
    (NOW() + INTERVAL '12 days')::date,
    'pending', 2
  ),
  (
    '00000007-0000-0000-0000-000000000003',
    '00000006-0000-0000-0000-000000000001',
    'SEO, Performance & Deployment',
    'Set up redirects, meta tags, sitemaps, and deploy to Vercel with Lighthouse score > 90',
    200.00,
    (NOW() + INTERVAL '17 days')::date,
    'pending', 3
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION SUMMARY
-- =============================================================================

SELECT
  'categories'       AS table_name, COUNT(*) AS rows FROM marketplace_categories
UNION ALL SELECT 'tags',            COUNT(*) FROM marketplace_tags
UNION ALL SELECT 'jobs',            COUNT(*) FROM jobs
UNION ALL SELECT 'job_skills',      COUNT(*) FROM job_required_skills
UNION ALL SELECT 'gigs',            COUNT(*) FROM gigs
UNION ALL SELECT 'gig_tiers',       COUNT(*) FROM gig_pricing_tiers
UNION ALL SELECT 'gig_skills',      COUNT(*) FROM gig_required_skills
UNION ALL SELECT 'bids',            COUNT(*) FROM bids
UNION ALL SELECT 'projects',        COUNT(*) FROM projects
UNION ALL SELECT 'milestones',      COUNT(*) FROM project_milestones;
