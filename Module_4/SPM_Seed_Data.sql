-- ===================================================================
-- DUMMY DATA SEED SCRIPT
-- ===================================================================

-- 1. Categories
INSERT INTO marketplace_categories (name, slug, description) VALUES 
  ('Development & IT', 'development-it', 'Software development and IT services'),
  ('Design & Creative', 'design-creative', 'Design, UI/UX, and creative services')
ON CONFLICT (name) DO NOTHING;

-- 2. Dummy Client
WITH inserted_client AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('client@example.com', 'dummyhash', 'Nexus', 'Finance', 'client', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
SELECT id FROM inserted_client;

-- 3. Freelancers & Profiles
WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('alex.rivera@example.com', 'dummyhash', 'Alex', 'Rivera', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'Senior Full-Stack Engineer', 'Building robust, scalable web applications with a focus on clean code and performance. 8+ years of experience.', 'Austin, TX', 85, 4.9, '{"React","Node.js","TypeScript","AWS","PostgreSQL"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('samira.jones@example.com', 'dummyhash', 'Samira', 'Jones', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'UI/UX Designer', 'Crafting beautiful and intuitive digital experiences. Specializing in mobile apps and SaaS dashboards.', 'London, UK', 65, 4.8, '{"Figma","Adobe XD","Tailwind"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('david.chen@example.com', 'dummyhash', 'David', 'Chen', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'DevOps & Cloud Architect', 'Helping startups scale their infrastructure efficiently and securely. Kubernetes expert.', 'Toronto, UK', 110, 5, '{"AWS","Docker","Kubernetes","Go"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('elena.rodriguez@example.com', 'dummyhash', 'Elena', 'Rodriguez', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'Mobile App Developer', 'Passionate about creating fluid, cross-platform mobile experiences that feel native.', 'Madrid, ES', 75, 4.7, '{"Flutter","Swift","Kotlin","React"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('michael.chang@example.com', 'dummyhash', 'Michael', 'Chang', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'Backend Python Engineer', 'Data-driven backend engineer. I love designing APIs and optimizing database queries.', 'Berlin, DE', 80, 4.6, '{"Python","Django","PostgreSQL","Docker","Redis"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

WITH inserted_user AS (
  INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
  VALUES ('priya.patel@example.com', 'dummyhash', 'Priya', 'Patel', 'freelancer', true)
  ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
  RETURNING id
)
INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
SELECT id, 'Data Scientist', 'Transforming raw data into actionable insights through predictive modeling and ML.', 'San Francisco, CA', 95, 4.9, '{"Python","TensorFlow","Pandas","SQL"}'
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;

-- 4. Jobs & Skills
WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'Build a FinTech Dashboard', 'We are looking for an experienced full-stack developer to build a modern, high-performance financial dashboard. Must be comfortable with real-time data and complex state management.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    72, 90, '2024-01-17T10:00:00.000Z', 'open', '2023-10-25T10:00:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('React') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Build a FinTech Dashboard' AND s.skill_name = 'React'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('TypeScript') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Build a FinTech Dashboard' AND s.skill_name = 'TypeScript'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Tailwind') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Build a FinTech Dashboard' AND s.skill_name = 'Tailwind'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Node.js') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Build a FinTech Dashboard' AND s.skill_name = 'Node.js'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'E-Commerce App Redesign', 'Seeking a talented UI/UX designer to completely overhaul our mobile app experience. We want a clean, minimalist design that improves conversion rates.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Design & Creative' LIMIT 1),
    56, 70, '2023-12-07T14:30:00.000Z', 'open', '2023-10-26T14:30:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('Figma') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'E-Commerce App Redesign' AND s.skill_name = 'Figma'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Adobe XD') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'E-Commerce App Redesign' AND s.skill_name = 'Adobe XD'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'Migrate to Kubernetes', 'Need a DevOps expert to help us migrate our legacy monolith to a microservices architecture on AWS EKS.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    96, 120, '2023-12-19T09:15:00.000Z', 'open', '2023-10-24T09:15:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('AWS') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Migrate to Kubernetes' AND s.skill_name = 'AWS'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Docker') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Migrate to Kubernetes' AND s.skill_name = 'Docker'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Kubernetes') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Migrate to Kubernetes' AND s.skill_name = 'Kubernetes'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Go') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Migrate to Kubernetes' AND s.skill_name = 'Go'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'Cross-Platform Delivery App', 'Looking for a mobile developer to build a cross-platform food delivery app from scratch. Needs to handle real-time geolocation.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    52, 65, '2024-02-16T11:45:00.000Z', 'open', '2023-10-27T11:45:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('Flutter') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Cross-Platform Delivery App' AND s.skill_name = 'Flutter'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Node.js') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Cross-Platform Delivery App' AND s.skill_name = 'Node.js'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('MongoDB') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Cross-Platform Delivery App' AND s.skill_name = 'MongoDB'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'AI Recommendation Engine', 'We need a data scientist to build a personalized recommendation model for our media streaming platform.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    80, 100, '2023-12-31T08:00:00.000Z', 'open', '2023-10-22T08:00:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('Python') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'AI Recommendation Engine' AND s.skill_name = 'Python'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('TensorFlow') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'AI Recommendation Engine' AND s.skill_name = 'TensorFlow'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Pandas') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'AI Recommendation Engine' AND s.skill_name = 'Pandas'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('PostgreSQL') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'AI Recommendation Engine' AND s.skill_name = 'PostgreSQL'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'Enterprise SaaS Backend', 'Developing a complex enterprise CRM. Need a solid backend architect to build secure, scalable APIs.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    68, 85, '2024-04-13T16:20:00.000Z', 'open', '2023-10-28T16:20:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('Python') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Enterprise SaaS Backend' AND s.skill_name = 'Python'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Django') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Enterprise SaaS Backend' AND s.skill_name = 'Django'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('PostgreSQL') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Enterprise SaaS Backend' AND s.skill_name = 'PostgreSQL'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('AWS') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Enterprise SaaS Backend' AND s.skill_name = 'AWS'
ON CONFLICT DO NOTHING;

WITH inserted_job AS (
  INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
  SELECT 
    (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1),
    'Web3 NFT Marketplace', 'Looking for a smart contract developer to build the backend for a new NFT platform.', 
    (SELECT id FROM marketplace_categories WHERE name = 'Development & IT' LIMIT 1),
    120, 150, '2024-02-04T10:30:00.000Z', 'open', '2023-10-29T10:30:00.000Z'
  RETURNING id
)
SELECT id FROM inserted_job;

INSERT INTO skills (skill_name) VALUES ('Solidity') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Web3 NFT Marketplace' AND s.skill_name = 'Solidity'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('React') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Web3 NFT Marketplace' AND s.skill_name = 'React'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('TypeScript') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Web3 NFT Marketplace' AND s.skill_name = 'TypeScript'
ON CONFLICT DO NOTHING;

INSERT INTO skills (skill_name) VALUES ('Node.js') ON CONFLICT (skill_name) DO NOTHING;
INSERT INTO job_required_skills (job_id, skill_id, skill_name)
SELECT j.id, s.id, s.skill_name
FROM jobs j, skills s
WHERE j.title = 'Web3 NFT Marketplace' AND s.skill_name = 'Node.js'
ON CONFLICT DO NOTHING;

