-- Run this file to set up Module 1 tables
-- Command: psql -U postgres -d module1_db -f schema.sql

CREATE TYPE user_role AS ENUM ('freelancer', 'client', 'admin', 'moderator');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned', 'pending_verification');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'verified', 'rejected', 'expired');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role user_role NOT NULL DEFAULT 'freelancer',
    account_status account_status DEFAULT 'active',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    profile_flags INTEGER DEFAULT 0,
    moderation_notes TEXT,
    last_moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    last_moderated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(150),
    bio TEXT,
    location VARCHAR(100),
    profile_image_url VARCHAR(500),
    banner_image_url VARCHAR(500),
    hourly_rate DECIMAL(18,4),
    experience_years DECIMAL(3,1) DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'available',
    impact_points INTEGER DEFAULT 0,
    social_contribution_level VARCHAR(20) DEFAULT 'bronze',
    national_builder_badge BOOLEAN DEFAULT FALSE,
    reputation_level INTEGER DEFAULT 1,
    tier_level VARCHAR(20) DEFAULT 'beginner',
    achievement_points INTEGER DEFAULT 0,
    trust_score NUMERIC(5,2) DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    total_reviews INTEGER DEFAULT 0,
    average_rating NUMERIC(2,1) DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    skill_level skill_level DEFAULT 'intermediate',
    years_of_experience DECIMAL(3,1),
    is_certified BOOLEAN DEFAULT FALSE,
    verified_by_test BOOLEAN DEFAULT FALSE,
    test_score INTEGER,
    last_tested_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS skill_badges (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    badge_name VARCHAR(150) NOT NULL,
    level skill_level DEFAULT 'intermediate',
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(150) NOT NULL,
    credential_id VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    verification_status verification_status DEFAULT 'pending',
    verification_url VARCHAR(500),
    certificate_file_url VARCHAR(500),
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    featured_image VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    sort_order INTEGER DEFAULT 0,
    technologies TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_history (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id INTEGER,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    deadline_rating INTEGER CHECK (deadline_rating BETWEEN 1 AND 5),
    is_public BOOLEAN DEFAULT TRUE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (freelancer_id != reviewer_id)
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('identity', 'email', 'phone', 'skill', 'professional')),
    verification_status verification_status DEFAULT 'pending',
    document_url VARCHAR(500),
    document_type VARCHAR(50),
    rejection_reason TEXT,
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    badge_name VARCHAR(100) UNIQUE NOT NULL,
    badge_description TEXT,
    badge_icon_url VARCHAR(500),
    category VARCHAR(50),
    points_value INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_displayed BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);