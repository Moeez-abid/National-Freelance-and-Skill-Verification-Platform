-- MODULE 6 SEED DATA
-- Purpose: Populate the communication module with realistic sample data
-- Prerequisites:
--   1. Run SPM_Centralized_Db.sql first
--   2. Run module6_schema_patch.sql
--   3. Users 1–8 must exist in the users table (see INSERT block below)
-- ALL insertion commands are saved here as requested.

-- USERS (seed 8 users matching the frontend ALL_CONTACTS array)
-- Skip if users already exist from another module's seed

INSERT INTO users (id, uuid, email, password_hash, first_name, last_name, role, account_status, is_email_verified)
VALUES
  (1, gen_random_uuid(), 'sarah.j@nexuspro.com',    '$2b$12$placeholder_hash_sarah',   'Sarah',  'Johnson',  'freelancer', 'active', TRUE),
  (2, gen_random_uuid(), 'info@techsolutions.com',  '$2b$12$placeholder_hash_tech',    'Tech',   'Solutions', 'client',    'active', TRUE),
  (3, gen_random_uuid(), 'm.thorne@nexuspro.com',   '$2b$12$placeholder_hash_marcus',  'Marcus', 'Thorne',   'freelancer', 'active', TRUE),
  (4, gen_random_uuid(), 'lisa.p@nexuspro.com',     '$2b$12$placeholder_hash_lisa',    'Lisa',   'Park',     'freelancer', 'active', TRUE),
  (5, gen_random_uuid(), 'omar.k@nexuspro.com',     '$2b$12$placeholder_hash_omar',    'Omar',   'Khalid',   'freelancer', 'active', TRUE),
  (6, gen_random_uuid(), 'riya.m@nexuspro.com',     '$2b$12$placeholder_hash_riya',    'Riya',   'Mehta',    'freelancer', 'active', TRUE),
  (7, gen_random_uuid(), 'dev.s@nexuspro.com',      '$2b$12$placeholder_hash_dev',     'Dev',    'Singh',    'freelancer', 'active', TRUE),
  (8, gen_random_uuid(), 'ahmed.k@nexuspro.com',    '$2b$12$placeholder_hash_ahmed',   'Ahmed',  'Khan',     'freelancer', 'active', TRUE),
  (9, gen_random_uuid(), 'me@nexuspro.com',			'$2b$12$placeholder_hash_me',	   'Alex',   'Morgan',   'client',      'active', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence after manual id inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));


-- PROFILES
INSERT INTO profiles (user_id, headline, availability_status)
VALUES
  (1, 'UI/UX Designer',    'available'),
  (2, 'Client Account',    'available'),
  (3, 'Senior Architect',  'away'),
  (4, 'Frontend Dev',      'available'),
  (5, 'Project Manager',   'away'),
  (6, 'Backend Dev',       'available'),
  (7, 'DevOps Engineer',   'away'),
  (8, 'Team Lead',         'available'),
  (9, 'Full Stack Developer', 'available')
ON CONFLICT (user_id) DO NOTHING;


-- CHAT ROOMS
-- Direct rooms (room_type = 'direct', room_name must be NULL per CHECK constraint)
INSERT INTO chat_rooms (id, uuid, room_type, room_name, created_by, is_active)
VALUES
  (1, gen_random_uuid(), 'direct', NULL, 1, TRUE),   -- Me <-> Sarah
  (2, gen_random_uuid(), 'direct', NULL, 1, TRUE),   -- Me <-> Tech Solutions
  (3, gen_random_uuid(), 'direct', NULL, 1, TRUE),   -- Me <-> Marcus
  (4, gen_random_uuid(), 'direct', NULL, 1, TRUE)    -- Me <-> Lisa
ON CONFLICT (id) DO NOTHING;

-- Group rooms (room_type = 'group', room_name required)
INSERT INTO chat_rooms (id, uuid, room_type, room_name, created_by, is_active)
VALUES
  (10, gen_random_uuid(), 'group', 'Dev Team Alpha', 8, TRUE),
  (11, gen_random_uuid(), 'group', 'Project Gamma',  3, TRUE),
  (12, gen_random_uuid(), 'group', 'Design Squad',   1, TRUE),
  (13, gen_random_uuid(), 'group', 'QA Team',        5, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('chat_rooms_id_seq', (SELECT MAX(id) FROM chat_rooms));


-- CHAT ROOM MEMBERS
-- Direct rooms: 2 members each (using user 9 as "me" placeholder;
-- in production replace 9 with the logged-in user's actual id)
INSERT INTO chat_room_members (uuid, room_id, user_id, member_role)
VALUES
  -- Room 1: Me (user 9) & Sarah (1)
  (gen_random_uuid(), 1, 9, 'member'),
  (gen_random_uuid(), 1, 1, 'member'),
  -- Room 2: Me & Tech Solutions (2)
  (gen_random_uuid(), 2, 9, 'member'),
  (gen_random_uuid(), 2, 2, 'member'),
  -- Room 3: Me & Marcus (3)
  (gen_random_uuid(), 3, 9, 'member'),
  (gen_random_uuid(), 3, 3, 'member'),
  -- Room 4: Me & Lisa (4)
  (gen_random_uuid(), 4, 9, 'member'),
  (gen_random_uuid(), 4, 4, 'member'),
  
  -- Group rooms
  (gen_random_uuid(), 10, 8, 'admin'),
  (gen_random_uuid(), 10, 1, 'member'),
  (gen_random_uuid(), 10, 3, 'member'),
  (gen_random_uuid(), 10, 4, 'member'),
  (gen_random_uuid(), 10, 5, 'member'),
  (gen_random_uuid(), 10, 6, 'member'),
  (gen_random_uuid(), 10, 7, 'member'),
  (gen_random_uuid(), 10, 9, 'member'),
  (gen_random_uuid(), 11, 3, 'admin'),
  (gen_random_uuid(), 11, 1, 'member'),
  (gen_random_uuid(), 11, 2, 'member'),
  (gen_random_uuid(), 11, 4, 'member'),
  (gen_random_uuid(), 11, 5, 'member'),
  (gen_random_uuid(), 11, 9, 'member'),
  (gen_random_uuid(), 12, 1, 'admin'),
  (gen_random_uuid(), 12, 4, 'member'),
  (gen_random_uuid(), 12, 6, 'member'),
  (gen_random_uuid(), 12, 9, 'member'),
  (gen_random_uuid(), 13, 5, 'admin'),
  (gen_random_uuid(), 13, 6, 'member'),
  (gen_random_uuid(), 13, 7, 'member'),
  (gen_random_uuid(), 13, 8, 'member')
ON CONFLICT (room_id, user_id) DO NOTHING;


-- CHAT MESSAGES
-- NOTE: In production, content is stored ENCRYPTED by the backend.
--       Here we insert plaintext for seeding; to insert encrypted values run the Node snippet at the bottom of this file.
--       The backend's safeDecrypt() will return plaintext unchanged if a row isn't encrypted (graceful fallback).

INSERT INTO chat_messages (uuid, room_id, sender_id, message_type, content, status, sent_at)
VALUES
  -- Room 1: Sarah conversation
  (gen_random_uuid(), 1, 1, 'text', 'Hey! Can you review the latest UI mockups?',                    'read',      NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), 1, 9, 'text', 'Of course! I''ll check them out now.',                          'read',      NOW() - INTERVAL '2 hours 55 min'),
  (gen_random_uuid(), 1, 1, 'text', 'They''re in the shared folder. Let me know about the colour palette.', 'read', NOW() - INTERVAL '2 hours 50 min'),
  (gen_random_uuid(), 1, 9, 'text', 'The teal accents look very on-brand. Really like the direction!', 'read',    NOW() - INTERVAL '2 hours 40 min'),
  (gen_random_uuid(), 1, 1, 'text', 'Can you review the latest mockups?',                            'delivered', NOW() - INTERVAL '1 hour'),

  -- Room 2: Tech Solutions conversation
  (gen_random_uuid(), 2, 2, 'text', 'The project proposal looks great!',                             'read',      NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), 2, 9, 'text', 'Thank you! We''re confident we can deliver on schedule.',       'read',      NOW() - INTERVAL '4 hours 55 min'),

  -- Room 3: Marcus (file message)
  (gen_random_uuid(), 3, 3, 'file', 'wireframes_v3.pdf',                                             'read',      NOW() - INTERVAL '6 hours'),

  -- Group room 10: Dev Team Alpha
  (gen_random_uuid(), 10, 8, 'text', 'Morning team! Standup in 10 mins.',                           'delivered', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), 10, 4, 'text', 'Ready! Working on the auth module',                           'delivered', NOW() - INTERVAL '3 hours 58 min'),
  (gen_random_uuid(), 10, 9, 'text', 'On it! Will share PR link shortly.',                          'delivered', NOW() - INTERVAL '3 hours 55 min'),
  (gen_random_uuid(), 10, 8, 'text', 'Sprint review at 3pm everyone!',                              'delivered', NOW() - INTERVAL '2 hours'),

  -- Group room 11: Project Gamma
  (gen_random_uuid(), 11, 9, 'text', 'Will finalize by EOD',                                        'delivered', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;


-- CHAT MEETING LINKS (for the Meetings section)

INSERT INTO chat_meeting_links
  (uuid, created_by, room_id, platform, meeting_url, meeting_id, passcode, scheduled_at, duration_minutes, is_expired)
VALUES
  (gen_random_uuid(), 9, 10, 'zoom',         'https://zoom.us/j/abc123',            'abc123',     '123456',   NOW() + INTERVAL '1 hour',   60,  FALSE),
  (gen_random_uuid(), 9, 11, 'google_meet',  'https://meet.google.com/xyz-abc',     'xyz-abc',    NULL,       NOW() + INTERVAL '1 day',    90,  FALSE),
  (gen_random_uuid(), 1, 12, 'zoom',         'https://zoom.us/j/def456',            'def456',     '654321',   NOW() + INTERVAL '2 days',   45,  FALSE),
  (gen_random_uuid(), 8, 10, 'google_meet',  'https://meet.google.com/uvw-xyz',     'uvw-xyz',    NULL,       NOW() - INTERVAL '1 day',    30,  TRUE),
  (gen_random_uuid(), 3, 11, 'zoom',         'https://zoom.us/j/ghi789',            'ghi789',     NULL,       NOW() - INTERVAL '2 days',   60,  TRUE)
ON CONFLICT DO NOTHING;


-- NOTIFICATIONS (default push/email = FALSE per schema patch)
-- We only insert in-app notifications; no email_queue rows needed

INSERT INTO notifications
  (uuid, recipient_id, notification_type, related_room_id, title, content, is_read, created_at)
VALUES
  (gen_random_uuid(), 9, 'new_message',  1,  'New message from Sarah Johnson',    'Can you review the latest mockups?',            FALSE, NOW() - INTERVAL '2 min'),
  (gen_random_uuid(), 9, 'group_update', 10, 'Dev Team Alpha activity',           'Ahmed added a new file to the group',           FALSE, NOW() - INTERVAL '15 min'),
  (gen_random_uuid(), 9, 'meeting',      11, 'Meeting Reminder',                  'Sprint Review starts in 30 minutes via Zoom',   FALSE, NOW() - INTERVAL '30 min'),
  (gen_random_uuid(), 9, 'new_message',  2,  'Message from Tech Solutions Inc.', 'The project proposal looks great!',              TRUE,  NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), 9, 'file_shared',  3,  'File received',                    'Marcus Thorne shared wireframes_v3.pdf',         TRUE,  NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 9, 'meeting',      10, 'Meeting completed',                 'Client onboarding session ended',               TRUE,  NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), 9, 'group_update', 11, 'Added to Project Gamma',            'Omar Khalid added you to the group',            TRUE,  NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;


-- NOTIFICATION PREFERENCES (push + email OFF by default)

INSERT INTO notification_preferences (uuid, user_id, notification_type, email_enabled, in_app_enabled, push_enabled)
VALUES
  (gen_random_uuid(), 9, 'new_message',  FALSE, TRUE, FALSE),
  (gen_random_uuid(), 9, 'group_update', FALSE, TRUE, FALSE),
  (gen_random_uuid(), 9, 'meeting',      FALSE, TRUE, FALSE),
  (gen_random_uuid(), 9, 'file_shared',  FALSE, TRUE, FALSE)
ON CONFLICT (user_id, notification_type) DO UPDATE
  SET email_enabled = FALSE, push_enabled = FALSE;

-- NO email_queue ROWS — push and email notifications are disabled.
-- The table stays empty.

-- VERIFY
SELECT 'chat_rooms'            AS tbl, COUNT(*) FROM chat_rooms
UNION ALL
SELECT 'chat_room_members',          COUNT(*) FROM chat_room_members
UNION ALL
SELECT 'chat_messages',              COUNT(*) FROM chat_messages
UNION ALL
SELECT 'chat_meeting_links',         COUNT(*) FROM chat_meeting_links
UNION ALL
SELECT 'notifications',              COUNT(*) FROM notifications
UNION ALL
SELECT 'notification_preferences',   COUNT(*) FROM notification_preferences
UNION ALL
SELECT 'email_queue',                COUNT(*) FROM email_queue;

-- ===================================================================
-- HOW TO ENCRYPT SEED MESSAGES FROM NODE (optional):
--
-- const { encrypt } = require('./dist/common/encryption.util');
-- const msg = 'Hey! Can you review the latest UI mockups?';
-- console.log(encrypt(msg));
-- Then paste the result as the content value above.
-- ===================================================================
