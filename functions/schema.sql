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
  cover_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Index for querying public listings
CREATE INDEX IF NOT EXISTS idx_posts_status_category ON posts (status, category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- Owner-managed catalog and uploaded covers. Public visitors have read-only APIs.
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES
  ('tools', '工具', 10), ('vip', '会员', 20), ('deals', '优惠', 30);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Shared, short-lived admin login throttling stores only a keyed IP fingerprint.
CREATE TABLE IF NOT EXISTS admin_login_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_login_limits_window ON admin_login_limits (window_started);
