CREATE TABLE IF NOT EXISTS admin_login_logs (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, ip TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '', result TEXT NOT NULL, blocked_bucket INTEGER
);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_time ON admin_login_logs (created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_login_logs_blocked ON admin_login_logs (ip, blocked_bucket) WHERE result = 'blocked';
