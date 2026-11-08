-- Safe, additive migration for shared admin login throttling.
-- Stores HMAC fingerprints only; raw visitor IP addresses are not written.
CREATE TABLE IF NOT EXISTS admin_login_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_login_limits_window ON admin_login_limits (window_started);
