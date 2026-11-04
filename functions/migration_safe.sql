-- Safe Non-Destructive Migration for Cloudflare D1
-- Target: 191607.xyz Sharing System
-- Notice: This script preserves all existing tables and data. It NEVER drops tables or columns.

-- 1. Create posts table if it does not already exist
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tools',
  link_type TEXT NOT NULL DEFAULT 'normal',
  link_url TEXT NOT NULL,
  disclosure TEXT,
  validity TEXT DEFAULT 'permanent',
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_status_category ON posts (status, category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- 3. Safety update for pre-existing records (if any existed before migration):
-- Ensure no records have empty/null status that could cause undefined behavior.
UPDATE posts SET status = 'draft' WHERE status IS NULL OR status = '';
