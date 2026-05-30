-- EXTENSION UPDATES: Adding missing fields and tables to Centralized Schema
-- Run this to synchronize Module 2 with its required custom fields and Many-to-Many support.

-- 1. ALTER TABLE: Add timing and grading fields to ec_skill_assessments
ALTER TABLE ec_skill_assessments 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 50;

-- 2. CREATE TABLE: ec_exam_questions (Many-to-Many support for sharing questions)
CREATE TABLE IF NOT EXISTS ec_exam_questions (
    assessment_id INTEGER NOT NULL REFERENCES ec_skill_assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES ec_questions(id) ON DELETE CASCADE,
    PRIMARY KEY (assessment_id, question_id)
);

-- 3. CREATE TABLE: ec_badges (Module 2 achievement tracking)
CREATE TABLE IF NOT EXISTS ec_badges (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    criteria TEXT NOT NULL,
    "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLEANUP: If migrating to Many-to-Many, assessment_id in ec_questions becomes redundant.
-- Optional: ALTER TABLE ec_questions DROP COLUMN IF EXISTS assessment_id;

-- 5. UPDATE DATA: Populate the new assessment fields
UPDATE ec_skill_assessments SET duration = 30, passing_score = 20 WHERE assessment_name = 'JavaScript Fundamentals';
UPDATE ec_skill_assessments SET duration = 45, passing_score = 30 WHERE assessment_name = 'React Performance Tuning';
UPDATE ec_skill_assessments SET duration = 30, passing_score = 25 WHERE assessment_name = 'Node.js Backend Mastery';
UPDATE ec_skill_assessments SET duration = 30, passing_score = 20 WHERE assessment_name = 'SQL Query Optimization';
UPDATE ec_skill_assessments SET duration = 10, passing_score = 25 WHERE assessment_name LIKE 'JavaScript AI Challenge%';

-- 6. VERIFY
SELECT assessment_name, duration, passing_score FROM ec_skill_assessments;
