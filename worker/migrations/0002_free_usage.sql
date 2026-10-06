-- Free AI answers used per app ID and month (the free plan's monthly allowance). Counts only.
CREATE TABLE IF NOT EXISTS free_usage (
  app_user_id TEXT NOT NULL,  -- the app's random ID (also its RevenueCat ID)
  month TEXT NOT NULL,        -- 'YYYY-MM' (UTC)
  count INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, month)
);
