-- Cloudflare D1 Schema for Yunchu Studio Sharing Posts
-- Table: posts

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

-- Index for querying public listings
CREATE INDEX IF NOT EXISTS idx_posts_status_category ON posts (status, category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
