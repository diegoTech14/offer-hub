-- =====================================================
-- ANALYTICS TABLES FOR PAGE TRACKING
-- =====================================================

-- Table: visitors (unique visitors)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id VARCHAR(255) NOT NULL UNIQUE, -- Fingerprint hash
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  total_visits INTEGER DEFAULT 1,
  ip_address VARCHAR(45), -- IPv4 or IPv6
  country VARCHAR(100),
  country_code VARCHAR(10),
  city VARCHAR(100),
  region VARCHAR(100),
  timezone VARCHAR(100),
  user_agent TEXT,
  browser VARCHAR(100),
  device VARCHAR(50), -- mobile, desktop, tablet
  os VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: page_views (individual page visits)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id VARCHAR(255) NOT NULL, -- References visitors.visitor_id
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(500),
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  session_id VARCHAR(255),
  duration_seconds INTEGER, -- Time spent on page
  ip_address VARCHAR(45),
  country VARCHAR(100),
  country_code VARCHAR(10),
  city VARCHAR(100),
  user_agent TEXT,
  browser VARCHAR(100),
  device VARCHAR(50),
  os VARCHAR(100),
  screen_width INTEGER,
  screen_height INTEGER,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: daily_stats (aggregated daily statistics)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  avg_duration_seconds DECIMAL(10,2) DEFAULT 0,
  top_pages JSONB,
  top_countries JSONB,
  top_devices JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Visitors indexes
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);

-- Page views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Daily stats indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (for tracking)
CREATE POLICY "Allow anonymous insert visitors" ON visitors
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert page_views" ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to UPDATE visitors (for repeat visits)
CREATE POLICY "Allow anonymous update visitors" ON visitors
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can SELECT (view analytics)
CREATE POLICY "Allow authenticated read visitors" ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read page_views" ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read daily_stats" ON daily_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for visitors table
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for daily_stats table
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    date,
    total_visits,
    unique_visitors,
    total_duration_seconds,
    avg_duration_seconds,
    top_pages,
    top_countries,
    top_devices
  )
  SELECT
    target_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COALESCE(SUM(duration_seconds), 0) as total_duration_seconds,
    COALESCE(AVG(duration_seconds), 0) as avg_duration_seconds,
    (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT page_path, COUNT(*) as views
        FROM page_views
        WHERE DATE(visited_at) = target_date
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
      ) t
    ) as top_pages,
    (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT country, COUNT(*) as views
        FROM page_views
        WHERE DATE(visited_at) = target_date AND country IS NOT NULL
        GROUP BY country
        ORDER BY views DESC
        LIMIT 10
      ) t
    ) as top_countries,
    (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT device, COUNT(*) as views
        FROM page_views
        WHERE DATE(visited_at) = target_date AND device IS NOT NULL
        GROUP BY device
        ORDER BY views DESC
      ) t
    ) as top_devices
  FROM page_views
  WHERE DATE(visited_at) = target_date
  ON CONFLICT (date) DO UPDATE SET
    total_visits = EXCLUDED.total_visits,
    unique_visitors = EXCLUDED.unique_visitors,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    avg_duration_seconds = EXCLUDED.avg_duration_seconds,
    top_pages = EXCLUDED.top_pages,
    top_countries = EXCLUDED.top_countries,
    top_devices = EXCLUDED.top_devices,
    updated_at = TIMEZONE('utc'::text, NOW());
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON visitors TO anon;
GRANT INSERT ON page_views TO anon;
GRANT UPDATE ON visitors TO anon;
GRANT SELECT ON visitors TO authenticated;
GRANT SELECT ON page_views TO authenticated;
GRANT SELECT ON daily_stats TO authenticated;
