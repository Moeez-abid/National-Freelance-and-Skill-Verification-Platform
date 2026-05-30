CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id)
        )
    WHERE user_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_rating();

CREATE OR REPLACE FUNCTION update_freelancer_rating_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE freelancer_id = OLD.freelancer_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE freelancer_id = OLD.freelancer_id
        )
    WHERE user_id = OLD.freelancer_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_delete_trigger
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_rating_delete();

CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    uid INTEGER;
    avg_rating NUMERIC;
    cert_count INTEGER;
    skill_count INTEGER;
    work_count INTEGER;
    final_score NUMERIC;
    tier TEXT;
BEGIN

    -- Determine User ID based on table
    IF TG_TABLE_NAME = 'reviews' THEN
        uid := COALESCE(NEW.freelancer_id, OLD.freelancer_id);
    ELSE
        uid := COALESCE(NEW.user_id, OLD.user_id);
    END IF;

    -- REVIEWS
    SELECT COALESCE(AVG(rating),0)
    INTO avg_rating
    FROM reviews
    WHERE freelancer_id = uid;

    -- CERTIFICATIONS
    SELECT COUNT(*)
    INTO cert_count
    FROM certifications
    WHERE user_id = uid
    AND verification_status = 'verified';

    -- SKILLS
    SELECT COUNT(*)
    INTO skill_count
    FROM user_skills
    WHERE user_id = uid;

    -- WORK HISTORY
    SELECT COUNT(*)
    INTO work_count
    FROM work_history
    WHERE user_id = uid;

    -- TRUST SCORE CALCULATION
    final_score :=
        (avg_rating / 5) * 50 +
        LEAST(cert_count * 5, 20) +
        LEAST(skill_count * 2, 15) +
        LEAST(work_count * 3, 15);

    final_score := LEAST(final_score, 100);

    -- TIER CALCULATION
    IF final_score >= 85 THEN
        tier := 'Elite';
    ELSIF final_score >= 70 THEN
        tier := 'Gold';
    ELSIF final_score >= 50 THEN
        tier := 'Silver';
    ELSE
        tier := 'Bronze';
    END IF;

    -- FINAL UPDATE (ONLY ONCE)
    UPDATE profiles
    SET 
        trust_score = final_score,
        tier_level = tier
    WHERE user_id = uid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_trust_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER cert_trust_trigger
AFTER INSERT OR UPDATE OR DELETE ON certifications
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER skill_trust_trigger
AFTER INSERT OR DELETE ON user_skills
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER work_trust_trigger
AFTER INSERT OR DELETE ON work_history
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();