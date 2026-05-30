-- =============================================================================
-- SEED PART 2: bids, gigs, pricing tiers, portfolio samples, gig skills
-- Run AFTER seed_part1.sql
-- UUID scheme:
--   Bids:             00000005-0000-0000-0000-0000000000XX
--   Gigs:             00000006-0000-0000-0000-0000000000XX
--   Gig price tiers:  00000007-0000-0000-0000-0000000000XX
--   Portfolio samples:00000008-0000-0000-0000-0000000000XX
--   Gig skills:       00000009-0000-0000-0000-0000000000XX
-- =============================================================================

-- ── BIDS ──────────────────────────────────────────────────────────────────────
INSERT INTO bids (id, job_id, freelancer_id, bid_amount, bid_type, duration_label, cover_letter, status) VALUES

  ('00000005-0000-0000-0000-000000000001',
   '00000003-0000-0000-0000-000000000001',
   'b2000001-0000-0000-0000-000000000001',
   120000,'fixed_price','10 weeks',
   'I have built 6 production-grade e-commerce platforms using Next.js 14, Stripe, and PostgreSQL. My last project achieved a 98 Lighthouse score and 40% increase in conversion. Happy to share case studies.',
   'pending'),

  ('00000005-0000-0000-0000-000000000002',
   '00000003-0000-0000-0000-000000000001',
   'b2000001-0000-0000-0000-000000000002',
   95000,'fixed_price','8 weeks',
   'Full-stack developer with 5 years of experience. Specialise in Next.js and Node.js. I can start immediately and deliver a fully tested, deployment-ready platform within your budget.',
   'pending'),

  ('00000005-0000-0000-0000-000000000003',
   '00000003-0000-0000-0000-000000000001',
   'b2000001-0000-0000-0000-000000000003',
   140000,'fixed_price','12 weeks',
   'Senior engineer with 8+ years in e-commerce. I will deliver a scalable platform with CI/CD, comprehensive test coverage, and 6 months of post-launch support included.',
   'pending'),

  ('00000005-0000-0000-0000-000000000004',
   '00000003-0000-0000-0000-000000000002',
   'b2000001-0000-0000-0000-000000000004',
   75000,'fixed_price','6 weeks',
   'Flutter expert who has shipped 12 apps to both stores. I have built a similar order management system for a café chain. Can implement real-time features using Firebase and custom push notifications.',
   'accepted'),

  ('00000005-0000-0000-0000-000000000005',
   '00000003-0000-0000-0000-000000000002',
   'b2000001-0000-0000-0000-000000000001',
   68000,'fixed_price','5 weeks',
   'Cross-platform mobile specialist. My Flutter apps consistently achieve 4.8+ star ratings. I can integrate with any kitchen display API and implement an offline-first architecture.',
   'rejected'),

  ('00000005-0000-0000-0000-000000000006',
   '00000003-0000-0000-0000-000000000003',
   'b2000001-0000-0000-0000-000000000005',
   2800,'hourly','Ongoing',
   'SEO content strategist with a portfolio of 200+ published articles ranking on page 1. I use Ahrefs and Surfer SEO for every piece. Will provide keyword strategy alongside each article.',
   'pending'),

  ('00000005-0000-0000-0000-000000000007',
   '00000003-0000-0000-0000-000000000003',
   'b2000001-0000-0000-0000-000000000006',
   2500,'hourly','Ongoing',
   'Former SaaS marketing manager turned freelance writer. Deep understanding of B2B SaaS audiences. Delivered 300% organic traffic growth for a project management tool similar to yours.',
   'pending'),

  ('00000005-0000-0000-0000-000000000008',
   '00000003-0000-0000-0000-000000000004',
   'b2000001-0000-0000-0000-000000000003',
   55000,'fixed_price','3 weeks',
   'Data analyst with 4 years of Power BI and Python experience. I have connected BI dashboards to Salesforce, HubSpot, and custom CRMs. Will include full documentation and a recorded training session.',
   'pending'),

  ('00000005-0000-0000-0000-000000000009',
   '00000003-0000-0000-0000-000000000005',
   'b2000001-0000-0000-0000-000000000002',
   22000,'fixed_price','10 days',
   'Brand designer with 7 years of experience working with tech startups. I deliver complete brand systems with unlimited revisions until you are 100% satisfied.',
   'pending'),

  ('00000005-0000-0000-0000-00000000000a',
   '00000003-0000-0000-0000-000000000005',
   'b2000001-0000-0000-0000-000000000005',
   18000,'fixed_price','7 days',
   'Creative director with strong startup portfolio. My process starts with a discovery workshop to understand your vision before touching any design tools. Deliverables in AI, PDF, and PNG formats.',
   'pending'),

  ('00000005-0000-0000-0000-00000000000b',
   '00000003-0000-0000-0000-000000000008',
   'b2000001-0000-0000-0000-000000000001',
   90000,'fixed_price','5 weeks',
   'Senior React developer experienced in healthcare applications. Familiar with HIPAA-compliant UI patterns and role-based access control. Have consumed Laravel REST APIs in multiple projects.',
   'pending'),

  ('00000005-0000-0000-0000-00000000000c',
   '00000003-0000-0000-0000-000000000008',
   'b2000001-0000-0000-0000-000000000006',
   105000,'fixed_price','6 weeks',
   'Full-stack developer with a healthcare domain background. I will build a pixel-perfect, accessible dashboard with comprehensive unit tests and Storybook component documentation.',
   'withdrawn')
ON CONFLICT (id) DO NOTHING;

-- ── GIGS ──────────────────────────────────────────────────────────────────────
INSERT INTO gigs (id, freelancer_id, category_id, title, description, status, orders_count, avg_rating, review_count, is_featured) VALUES

  ('00000006-0000-0000-0000-000000000001',
   'b2000001-0000-0000-0000-000000000001',
   '00000001-0000-0000-0000-000000000001',
   'I will build a high-performance React web application for your business',
   'Are you looking to scale your business with a lightning-fast web application? I specialise in building SEO-friendly, high-performance apps using React, Next.js, and Node.js. My approach focuses on user experience, conversion rates, and clean maintainable code. Every project includes full source files, deployment assistance, and 30 days of post-launch support.',
   'live',12,4.90,124,true),

  ('00000006-0000-0000-0000-000000000002',
   'b2000001-0000-0000-0000-000000000002',
   '00000001-0000-0000-0000-000000000002',
   'I will create a unique brand identity and logo for your startup',
   'Stand out from the crowd with a memorable brand identity. I deliver fully custom logos, colour palettes, typography guides, and brand usage guidelines. My designs are vector-based and print-ready. Process: discovery call, 3 concepts, revisions, final delivery.',
   'live',4,4.80,87,false),

  ('00000006-0000-0000-0000-000000000003',
   'b2000001-0000-0000-0000-000000000005',
   '00000001-0000-0000-0000-000000000003',
   'I will write SEO-optimised blog posts and articles for your website',
   'Boost your search rankings with expertly crafted, keyword-rich content. Each article is researched with professional SEO tools, written for your target audience, and optimised for featured snippets. Includes meta description, internal linking suggestions, and a plagiarism report.',
   'live',0,0.00,0,false),

  ('00000006-0000-0000-0000-000000000004',
   'b2000001-0000-0000-0000-000000000004',
   '00000001-0000-0000-0000-000000000004',
   'I will develop a responsive mobile app using Flutter',
   'Get a polished cross-platform mobile app that runs natively on iOS and Android from a single codebase. I specialise in Flutter with Firebase, REST API integration, push notifications, and App Store/Play Store deployment. Clean architecture and full test coverage.',
   'live',7,4.90,203,true),

  ('00000006-0000-0000-0000-000000000005',
   'b2000001-0000-0000-0000-000000000003',
   '00000001-0000-0000-0000-000000000005',
   'I will create data visualisations and analytics dashboards',
   'Transform your raw data into clear, interactive dashboards. I work with Python (Pandas, Matplotlib, Seaborn), Power BI, and Tableau. Deliverables include automated refresh, drill-through reports, and a recorded walkthrough video.',
   'live',9,4.60,41,false),

  ('00000006-0000-0000-0000-000000000006',
   'b2000001-0000-0000-0000-000000000006',
   '00000001-0000-0000-0000-000000000006',
   'I will produce and edit professional promotional videos',
   'High-quality video editing for product launches, corporate promos, social media reels, and YouTube content. I use Adobe Premiere Pro and After Effects. Colour grading, motion graphics, subtitles, and background music licensing all included.',
   'live',15,4.80,93,false),

  ('00000006-0000-0000-0000-000000000007',
   'b2000001-0000-0000-0000-000000000001',
   '00000001-0000-0000-0000-000000000001',
   'I will build and customise your WordPress website',
   'Professional WordPress websites built to your exact requirements. Includes theme customisation, plugin setup, on-page SEO, contact forms, Google Analytics integration, and basic speed optimisation. E-commerce (WooCommerce) available in higher tiers.',
   'draft',0,0.00,0,false)
ON CONFLICT (id) DO NOTHING;

-- ── GIG PRICING TIERS ─────────────────────────────────────────────────────────
INSERT INTO gig_pricing_tiers (id, gig_id, tier, package_name, description, price, delivery_days, revisions, deliverables) VALUES
  -- Gig 1 React web app
  ('00000007-0000-0000-0000-000000000001','00000006-0000-0000-0000-000000000001','basic',   'Starter',   'Single landing page, up to 5 sections, contact form',5000,3, '1',        ARRAY['Responsive design','Source files','Basic SEO setup']),
  ('00000007-0000-0000-0000-000000000002','00000006-0000-0000-0000-000000000001','standard','Business',  'Up to 10 pages with e-commerce integration',         10000,5, '3',        ARRAY['Everything in Starter','E-commerce integration','3 revisions','Performance optimisation']),
  ('00000007-0000-0000-0000-000000000003','00000006-0000-0000-0000-000000000001','premium', 'Enterprise','Full-scale solution with admin dashboard',           18000,10,'Unlimited',ARRAY['Everything in Business','Admin dashboard','Unlimited revisions','Priority support']),
  -- Gig 2 Brand identity
  ('00000007-0000-0000-0000-000000000004','00000006-0000-0000-0000-000000000002','basic',   'Essential', 'Primary logo in 3 formats',                           3500,5, '2',        ARRAY['Logo (AI, PNG, SVG)','2 concepts','Commercial licence']),
  ('00000007-0000-0000-0000-000000000005','00000006-0000-0000-0000-000000000002','standard','Brand Kit', 'Logo + colour palette + typography guide',            7000,7, '5',        ARRAY['Everything in Essential','Colour palette','Typography guide','Stationery']),
  ('00000007-0000-0000-0000-000000000006','00000006-0000-0000-0000-000000000002','premium', 'Full Identity','Complete brand guidelines document',              12000,14,'Unlimited',ARRAY['Everything in Brand Kit','Brand guidelines PDF','Social media kit','Unlimited revisions']),
  -- Gig 3 SEO content
  ('00000007-0000-0000-0000-000000000007','00000006-0000-0000-0000-000000000003','basic',   'Starter Post','800-word SEO blog post',                            2000,2, '1',        ARRAY['800-word article','Meta description','Plagiarism report']),
  ('00000007-0000-0000-0000-000000000008','00000006-0000-0000-0000-000000000003','standard','Pro Post',   '1500-word in-depth article with keyword research',   3500,3, '2',        ARRAY['1500-word article','Keyword research','Internal linking map','2 revisions']),
  ('00000007-0000-0000-0000-000000000009','00000006-0000-0000-0000-000000000003','premium', 'Authority',  '2500-word pillar content with custom images',         5500,5, 'Unlimited',ARRAY['2500-word article','Custom graphics','Schema markup','Unlimited revisions']),
  -- Gig 4 Flutter app
  ('00000007-0000-0000-0000-00000000000a','00000006-0000-0000-0000-000000000004','basic',   'MVP',        'Simple app with 5 screens and basic API integration', 12000,10,'1',        ARRAY['5 screens','REST API integration','Android APK','Basic testing']),
  ('00000007-0000-0000-0000-00000000000b','00000006-0000-0000-0000-000000000004','standard','Full App',   'Up to 15 screens with Firebase and push notifications',25000,21,'3',       ARRAY['15 screens','Firebase auth','Push notifications','Play Store deployment']),
  ('00000007-0000-0000-0000-00000000000c','00000006-0000-0000-0000-000000000004','premium', 'Complete',   'Full-featured app for both stores with payments',     45000,35,'Unlimited',ARRAY['Unlimited screens','Payment gateway','Both stores','Source code','1 month support']),
  -- Gig 5 Data dashboards
  ('00000007-0000-0000-0000-00000000000d','00000006-0000-0000-0000-000000000005','basic',   'Starter',    '3 interactive charts from CSV/Excel data',             8000,7, '2',        ARRAY['3 charts','PDF export','Basic filtering','Walkthrough video']),
  ('00000007-0000-0000-0000-00000000000e','00000006-0000-0000-0000-000000000005','standard','Analytics',  'Full Power BI report with live DB connection',         18000,14,'5',        ARRAY['Full Power BI report','Live DB connection','Auto refresh','DAX measures']),
  ('00000007-0000-0000-0000-00000000000f','00000006-0000-0000-0000-000000000005','premium', 'Enterprise', 'Python pipeline + multi-page Power BI report',        35000,21,'Unlimited',ARRAY['Python ETL pipeline','Multi-page report','Row-level security','Training session']),
  -- Gig 6 Video editing
  ('00000007-0000-0000-0000-000000000010','00000006-0000-0000-0000-000000000006','basic',   'Quick Edit', 'Up to 5 min video, basic cuts and music',              6500,4, '2',        ARRAY['5-min edited video','Background music','Subtitles','2 revisions']),
  ('00000007-0000-0000-0000-000000000011','00000006-0000-0000-0000-000000000006','standard','Promo Pack', '3-min promo + 3 social media clips',                  15000,7, '4',        ARRAY['3-min promo','3 social clips','Colour grading','Motion graphics']),
  ('00000007-0000-0000-0000-000000000012','00000006-0000-0000-0000-000000000006','premium', 'Full Prod',  'Full event highlight + 5 social clips + Reels',       28000,10,'Unlimited',ARRAY['Full highlight reel','5 social clips','Reels format','Thumbnail design'])
ON CONFLICT (id) DO NOTHING;

-- ── GIG PORTFOLIO SAMPLES ─────────────────────────────────────────────────────
INSERT INTO gig_portfolio_samples (id, gig_id, title, file_url, file_type, sort_order) VALUES
  ('00000008-0000-0000-0000-000000000001','00000006-0000-0000-0000-000000000001','E-commerce Dashboard','https://placehold.co/800x600/E8F4FD/1D4ED8?text=E-Commerce+Dashboard','image/png',1),
  ('00000008-0000-0000-0000-000000000002','00000006-0000-0000-0000-000000000001','SaaS Landing Page',   'https://placehold.co/800x600/EFF6FF/1E40AF?text=SaaS+Landing+Page', 'image/png',2),
  ('00000008-0000-0000-0000-000000000003','00000006-0000-0000-0000-000000000001','Admin Portal',        'https://placehold.co/800x600/F0F9FF/0369A1?text=Admin+Portal',       'image/png',3),
  ('00000008-0000-0000-0000-000000000004','00000006-0000-0000-0000-000000000002','Tech Logo Concept',   'https://placehold.co/800x600/FEF3C7/92400E?text=Logo+Concept+A',     'image/png',1),
  ('00000008-0000-0000-0000-000000000005','00000006-0000-0000-0000-000000000002','Brand Guideline',     'https://placehold.co/800x600/FFFBEB/B45309?text=Brand+Guideline',    'image/png',2),
  ('00000008-0000-0000-0000-000000000006','00000006-0000-0000-0000-000000000004','Restaurant App UI',   'https://placehold.co/800x600/FDF2F8/86198F?text=Restaurant+App+UI',  'image/png',1),
  ('00000008-0000-0000-0000-000000000007','00000006-0000-0000-0000-000000000004','Loyalty Programme',   'https://placehold.co/800x600/F5F3FF/6D28D9?text=Loyalty+Programme',  'image/png',2),
  ('00000008-0000-0000-0000-000000000008','00000006-0000-0000-0000-000000000005','Sales Dashboard',     'https://placehold.co/800x600/F0FDF4/166534?text=Sales+Dashboard',    'image/png',1),
  ('00000008-0000-0000-0000-000000000009','00000006-0000-0000-0000-000000000006','Product Reel',        'https://placehold.co/800x600/FFF7ED/9A3412?text=Product+Reel',       'image/png',1)
ON CONFLICT (id) DO NOTHING;

-- ── GIG REQUIRED SKILLS ───────────────────────────────────────────────────────
INSERT INTO gig_required_skills (id, gig_id, tag_id) VALUES
  ('00000009-0000-0000-0000-000000000001','00000006-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000001'),
  ('00000009-0000-0000-0000-000000000002','00000006-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000003'),
  ('00000009-0000-0000-0000-000000000003','00000006-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000002'),
  ('00000009-0000-0000-0000-000000000004','00000006-0000-0000-0000-000000000002','00000002-0000-0000-0000-000000000005'),
  ('00000009-0000-0000-0000-000000000005','00000006-0000-0000-0000-000000000002','00000002-0000-0000-0000-000000000009'),
  ('00000009-0000-0000-0000-000000000006','00000006-0000-0000-0000-000000000003','00000002-0000-0000-0000-000000000008'),
  ('00000009-0000-0000-0000-000000000007','00000006-0000-0000-0000-000000000003','00000002-0000-0000-0000-00000000000f'),
  ('00000009-0000-0000-0000-000000000008','00000006-0000-0000-0000-000000000004','00000002-0000-0000-0000-000000000006'),
  ('00000009-0000-0000-0000-000000000009','00000006-0000-0000-0000-000000000004','00000002-0000-0000-0000-00000000000e'),
  ('00000009-0000-0000-0000-00000000000a','00000006-0000-0000-0000-000000000005','00000002-0000-0000-0000-000000000004'),
  ('00000009-0000-0000-0000-00000000000b','00000006-0000-0000-0000-000000000005','00000002-0000-0000-0000-00000000000a'),
  ('00000009-0000-0000-0000-00000000000c','00000006-0000-0000-0000-000000000007','00000002-0000-0000-0000-000000000007'),
  ('00000009-0000-0000-0000-00000000000d','00000006-0000-0000-0000-000000000007','00000002-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;
