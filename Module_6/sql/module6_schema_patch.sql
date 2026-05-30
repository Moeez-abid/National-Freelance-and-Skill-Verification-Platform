-- MODULE 6 SCHEMA PATCH

-- STEP 1: Changing notification_preferences defaults to FALSE
ALTER TABLE notification_preferences
  ALTER COLUMN email_enabled SET DEFAULT FALSE,
  ALTER COLUMN push_enabled  SET DEFAULT FALSE;

-- STEP 2: Updating any existing rows (if DB was already seeded)
UPDATE notification_preferences
SET
  email_enabled = FALSE,
  push_enabled  = FALSE
WHERE email_enabled = TRUE OR push_enabled = TRUE;


-- STEP 3: Adding index on uuid for fast WS status updates

CREATE INDEX IF NOT EXISTS idx_chat_messages_uuid
  ON chat_messages(uuid);

-- STEP 4: Adding composite index for room + time together (used by message history queries)
-- and dropping two weaker originals
DROP INDEX IF EXISTS idx_chat_messages_room;
DROP INDEX IF EXISTS idx_chat_messages_sent_at;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_sent
  ON chat_messages(room_id, sent_at DESC);

-- STEP 5: Adding index for direct-room lookup (used by findOrCreateDirectRoom)

CREATE INDEX IF NOT EXISTS idx_chat_room_members_user
  ON chat_room_members(user_id);

-- STEP 6: Adding title for meeting_links
ALTER TABLE chat_meeting_links ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Update existing seeded meetings with proper names:
UPDATE chat_meeting_links SET title = 'Sprint Review'         WHERE meeting_id = 'abc123';
UPDATE chat_meeting_links SET title = 'Client Onboarding'     WHERE meeting_id = 'xyz-abc';
UPDATE chat_meeting_links SET title = 'Design Review'         WHERE meeting_id = 'def456';
UPDATE chat_meeting_links SET title = 'Weekly Standup'        WHERE meeting_id = 'uvw-xyz';
UPDATE chat_meeting_links SET title = 'Project Kickoff'       WHERE meeting_id = 'ghi789';

-- STEP 7: Adding file types not mentioned in db
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check 
CHECK (message_type IN ('text','media','meeting_link','system','file','pdf','image','video','doc','docx','txt','xlsx','ppt','pptx'));