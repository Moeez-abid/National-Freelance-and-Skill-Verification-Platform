-- MIGRATION LOG: Syncing Skill Testing Module with Centralized DB Schema
-- Date: 2026-05-02

-- 1. DROP OLD LOCAL TABLES
DROP TABLE IF EXISTS "EC_ExamQuestion" CASCADE;
DROP TABLE IF EXISTS "EC_Submission" CASCADE;
DROP TABLE IF EXISTS "EC_TestAttempt" CASCADE;
DROP TABLE IF EXISTS "EC_Question" CASCADE;
DROP TABLE IF EXISTS "EC_Exam" CASCADE;
DROP TABLE IF EXISTS "EC_Skill" CASCADE;
DROP TABLE IF EXISTS "EC_User" CASCADE;
DROP TABLE IF EXISTS "EC_Badge" CASCADE;
DROP TABLE IF EXISTS "EC_Certification" CASCADE;

-- 2. CREATE NEW CENTRALIZED TABLES (Handled by Prisma/Centralized SQL)
-- The following tables were created to match Module 1 & 2 of the centralized schema:
-- - users
-- - skills
-- - ec_skill_assessments
-- - ec_questions
-- - ec_test_attempts
-- - ec_submissions
-- - ec_certificates

-- 3. SCHEMA ALIGNMENT
-- - Renamed EC_Exam to ec_skill_assessments
-- - Changed many-to-many relationship (EC_ExamQuestion) to one-to-many (ec_questions.assessment_id)
-- - Standardized naming to snake_case as per project guidelines.
