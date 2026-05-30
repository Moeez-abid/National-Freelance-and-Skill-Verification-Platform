-- PROPOSED ALTERATIONS TO SPM_Centralized_Db.sql
-- These commands add fields and tables necessary for the Skill Testing Module 
-- to function correctly while remaining integrated with the Centralized DB.

-- 1. Add Timing and Grading fields to ec_skill_assessments
ALTER TABLE ec_skill_assessments 
ADD COLUMN duration INTEGER DEFAULT 30,
ADD COLUMN passing_score INTEGER DEFAULT 50;

-- 2. Add Many-to-Many support for Questions (Optional but recommended)
-- This allows sharing the same question across multiple assessments.
CREATE TABLE ec_exam_questions (
    assessment_id INTEGER NOT NULL REFERENCES ec_skill_assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES ec_questions(id) ON DELETE CASCADE,
    PRIMARY KEY (assessment_id, question_id)
);

-- Note: In the centralized schema, ec_questions.assessment_id exists. 
-- For Many-to-Many, we would eventually migrate that field into this link table.
