-- Migration: Add milestones column to bids table
ALTER TABLE bids ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]';
