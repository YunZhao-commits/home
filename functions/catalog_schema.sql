-- Run once on the existing database after the original posts schema.
-- Before ALTER, inspect PRAGMA table_info(posts). Skip ALTER if cover_url exists.
ALTER TABLE posts ADD COLUMN cover_url TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES ('tools', '工具', 10), ('vip', '会员', 20), ('deals', '优惠', 30);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_login_limits (ip_hash TEXT PRIMARY KEY, window_started INTEGER NOT NULL, attempts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_admin_login_limits_window ON admin_login_limits (window_started);
