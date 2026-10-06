-- Daily request counters for the AI proxy. Never stores health data or raw IPs.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,     -- 'u:<appUserId>' or 'ip:<sha256 hash>'
  day TEXT NOT NULL,     -- 'YYYY-MM-DD' (UTC)
  count INTEGER NOT NULL,
  PRIMARY KEY (key, day)
);
