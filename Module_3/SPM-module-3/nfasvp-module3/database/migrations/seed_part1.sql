-- =============================================================================
-- SEED PART 1: categories, tags, jobs, job_required_skills
-- UUID scheme (all hex-valid):
--   Categories:       00000001-0000-0000-0000-0000000000XX
--   Tags:             00000002-0000-0000-0000-0000000000XX
--   Jobs:             00000003-0000-0000-0000-0000000000XX
--   Job skills:       00000004-0000-0000-0000-0000000000XX
--   Clients:          a1000001-0000-0000-0000-0000000000XX
--   Freelancers:      b2000001-0000-0000-0000-0000000000XX
-- =============================================================================

-- ── CATEGORIES ────────────────────────────────────────────────────────────────
INSERT INTO marketplace_categories (id, name, slug, description, sort_order, is_active) VALUES
  ('00000001-0000-0000-0000-000000000001','Web Development',   'web-development',   'Front-end, back-end and full-stack web projects', 1, true),
  ('00000001-0000-0000-0000-000000000002','Graphic Design',    'graphic-design',    'Logos, branding, UI/UX design',                   2, true),
  ('00000001-0000-0000-0000-000000000003','Content Writing',   'content-writing',   'Blog posts, copywriting, SEO content',             3, true),
  ('00000001-0000-0000-0000-000000000004','Mobile Apps',       'mobile-apps',       'iOS, Android and cross-platform apps',             4, true),
  ('00000001-0000-0000-0000-000000000005','Data & Analytics',  'data-analytics',    'Data science, dashboards and BI reporting',        5, true),
  ('00000001-0000-0000-0000-000000000006','Video & Animation', 'video-animation',   'Video editing, motion graphics and animation',     6, true),
  ('00000001-0000-0000-0000-000000000007','Digital Marketing', 'digital-marketing', 'SEO, social media, PPC campaigns',                7, true),
  ('00000001-0000-0000-0000-000000000008','Music & Audio',     'music-audio',       'Voice overs, music production, sound design',      8, true),
  ('00000001-0000-0000-0000-000000000009','Translation',       'translation',       'Document and website translation services',        9, true)
ON CONFLICT (id) DO NOTHING;

-- ── TAGS ──────────────────────────────────────────────────────────────────────
INSERT INTO marketplace_tags (id, name, slug, category_id, is_verified, usage_count) VALUES
  ('00000002-0000-0000-0000-000000000001','React',        'react',        '00000001-0000-0000-0000-000000000001', true,  45),
  ('00000002-0000-0000-0000-000000000002','Node.js',      'nodejs',       '00000001-0000-0000-0000-000000000001', true,  38),
  ('00000002-0000-0000-0000-000000000003','Next.js',      'nextjs',       '00000001-0000-0000-0000-000000000001', true,  29),
  ('00000002-0000-0000-0000-000000000004','Python',       'python',       '00000001-0000-0000-0000-000000000005', true,  52),
  ('00000002-0000-0000-0000-000000000005','Figma',        'figma',        '00000001-0000-0000-0000-000000000002', true,  33),
  ('00000002-0000-0000-0000-000000000006','Flutter',      'flutter',      '00000001-0000-0000-0000-000000000004', true,  27),
  ('00000002-0000-0000-0000-000000000007','WordPress',    'wordpress',    '00000001-0000-0000-0000-000000000001', false, 41),
  ('00000002-0000-0000-0000-000000000008','SEO',          'seo',          '00000001-0000-0000-0000-000000000007', true,  36),
  ('00000002-0000-0000-0000-000000000009','Logo Design',  'logo-design',  '00000001-0000-0000-0000-000000000002', true,  30),
  ('00000002-0000-0000-0000-00000000000a','PowerBI',      'powerbi',      '00000001-0000-0000-0000-000000000005', true,  18),
  ('00000002-0000-0000-0000-00000000000b','Tailwind CSS', 'tailwind-css', '00000001-0000-0000-0000-000000000001', true,  22),
  ('00000002-0000-0000-0000-00000000000c','Vue.js',       'vuejs',        '00000001-0000-0000-0000-000000000001', false, 15),
  ('00000002-0000-0000-0000-00000000000d','MongoDB',      'mongodb',      '00000001-0000-0000-0000-000000000001', true,  20),
  ('00000002-0000-0000-0000-00000000000e','Dart',         'dart',         '00000001-0000-0000-0000-000000000004', false, 12),
  ('00000002-0000-0000-0000-00000000000f','Copywriting',  'copywriting',  '00000001-0000-0000-0000-000000000003', true,  24)
ON CONFLICT (id) DO NOTHING;

-- ── JOBS ──────────────────────────────────────────────────────────────────────
INSERT INTO jobs (id, client_id, title, description, category_id, project_type, budget_min, budget_max, duration_label, experience_level, status, bids_count, is_verified) VALUES

  ('00000003-0000-0000-0000-000000000001',
   'a1000001-0000-0000-0000-000000000001',
   'Build a Full-Stack E-commerce Platform with Next.js',
   'We need an experienced full-stack developer to build a modern e-commerce platform. The platform should include a product catalogue, shopping cart, Stripe payment integration, and an admin dashboard. Must be SEO optimised and fully responsive.',
   '00000001-0000-0000-0000-000000000001','fixed_price',80000,150000,'2-3 months','expert','open',8,true),

  ('00000003-0000-0000-0000-000000000002',
   'a1000001-0000-0000-0000-000000000002',
   'Mobile App for Restaurant Order Management (Flutter)',
   'Looking for a Flutter developer to build a cross-platform mobile app for our restaurant chain. Features: real-time order tracking, push notifications, kitchen display system integration, and a customer loyalty programme.',
   '00000001-0000-0000-0000-000000000004','fixed_price',60000,100000,'6-8 weeks','intermediate','open',5,true),

  ('00000003-0000-0000-0000-000000000003',
   'a1000001-0000-0000-0000-000000000003',
   'SEO Content Writer for SaaS Blog (10 Articles/Month)',
   'We are a growing SaaS startup looking for a skilled SEO content writer. You will produce 10 high-quality, keyword-optimised blog articles per month covering topics in productivity, project management and remote work.',
   '00000001-0000-0000-0000-000000000003','hourly',2000,3500,'Ongoing','intermediate','open',12,false),

  ('00000003-0000-0000-0000-000000000004',
   'a1000001-0000-0000-0000-000000000001',
   'Data Dashboard with Python & Power BI for Sales Team',
   'Our sales team needs an interactive Power BI dashboard connected to our CRM. Requires data cleaning in Python, DAX measures, automated refresh, and PDF export. Training session for 5 team members required after delivery.',
   '00000001-0000-0000-0000-000000000005','fixed_price',40000,70000,'3-4 weeks','expert','open',3,true),

  ('00000003-0000-0000-0000-000000000005',
   'a1000001-0000-0000-0000-000000000004',
   'Brand Identity & Logo Design for Tech Startup',
   'Early-stage tech startup seeking a talented designer to create a complete brand identity package: primary logo, colour palette, typography guide, business card, and letterhead. We want a modern, minimalist feel.',
   '00000001-0000-0000-0000-000000000002','fixed_price',15000,30000,'1-2 weeks','intermediate','open',7,false),

  ('00000003-0000-0000-0000-000000000006',
   'a1000001-0000-0000-0000-000000000005',
   'WordPress Website for Law Firm with SEO Setup',
   'We need a professional WordPress website for our law firm. Includes 8 service pages, blog, contact form, Google Maps integration, and on-page SEO setup. Must follow legal industry best practices.',
   '00000001-0000-0000-0000-000000000001','fixed_price',25000,45000,'2-3 weeks','intermediate','open',6,true),

  ('00000003-0000-0000-0000-000000000007',
   'a1000001-0000-0000-0000-000000000002',
   'Promotional Video Editing for Product Launch',
   'We have raw footage (approx 4 hours) from our product launch event. Need a skilled video editor to produce a 3-minute highlight reel and 5 social media clips. Brand guidelines and assets provided.',
   '00000001-0000-0000-0000-000000000006','fixed_price',20000,35000,'1 week','intermediate','in_progress',0,false),

  ('00000003-0000-0000-0000-000000000008',
   'a1000001-0000-0000-0000-000000000003',
   'React Dashboard for Hospital Management System',
   'Looking for a React developer to build an admin dashboard for our hospital management system. Includes patient records, appointment scheduling, billing summary, and role-based access control. API already built in Laravel.',
   '00000001-0000-0000-0000-000000000001','fixed_price',70000,120000,'6 weeks','expert','open',4,true)
ON CONFLICT (id) DO NOTHING;

-- ── JOB REQUIRED SKILLS ───────────────────────────────────────────────────────
INSERT INTO job_required_skills (id, job_id, tag_id, level) VALUES
  ('00000004-0000-0000-0000-000000000001','00000003-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000003','expert'),
  ('00000004-0000-0000-0000-000000000002','00000003-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000002','expert'),
  ('00000004-0000-0000-0000-000000000003','00000003-0000-0000-0000-000000000001','00000002-0000-0000-0000-00000000000d','intermediate'),
  ('00000004-0000-0000-0000-000000000004','00000003-0000-0000-0000-000000000002','00000002-0000-0000-0000-000000000006','expert'),
  ('00000004-0000-0000-0000-000000000005','00000003-0000-0000-0000-000000000002','00000002-0000-0000-0000-00000000000e','intermediate'),
  ('00000004-0000-0000-0000-000000000006','00000003-0000-0000-0000-000000000003','00000002-0000-0000-0000-000000000008','expert'),
  ('00000004-0000-0000-0000-000000000007','00000003-0000-0000-0000-000000000003','00000002-0000-0000-0000-00000000000f','intermediate'),
  ('00000004-0000-0000-0000-000000000008','00000003-0000-0000-0000-000000000004','00000002-0000-0000-0000-000000000004','expert'),
  ('00000004-0000-0000-0000-000000000009','00000003-0000-0000-0000-000000000004','00000002-0000-0000-0000-00000000000a','expert'),
  ('00000004-0000-0000-0000-00000000000a','00000003-0000-0000-0000-000000000005','00000002-0000-0000-0000-000000000005','expert'),
  ('00000004-0000-0000-0000-00000000000b','00000003-0000-0000-0000-000000000005','00000002-0000-0000-0000-000000000009','expert'),
  ('00000004-0000-0000-0000-00000000000c','00000003-0000-0000-0000-000000000006','00000002-0000-0000-0000-000000000007','intermediate'),
  ('00000004-0000-0000-0000-00000000000d','00000003-0000-0000-0000-000000000006','00000002-0000-0000-0000-000000000008','intermediate'),
  ('00000004-0000-0000-0000-00000000000e','00000003-0000-0000-0000-000000000008','00000002-0000-0000-0000-000000000001','expert'),
  ('00000004-0000-0000-0000-00000000000f','00000003-0000-0000-0000-000000000008','00000002-0000-0000-0000-00000000000b','intermediate')
ON CONFLICT (id) DO NOTHING;
