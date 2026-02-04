-- Agent System Database Extension for Frío Ingeniería
-- Run this after the initial schema.sql

-- =====================================================
-- EXTEND LEADS TABLE FOR AI PROSPECTING
-- =====================================================

-- Add new columns for AI-powered lead scoring and management
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'COLD'
  CHECK (category IN ('HOT', 'WARM', 'COLD', 'DISCARD'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS equipment_brands TEXT[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_agent VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_status VARCHAR(20) DEFAULT 'pending'
  CHECK (consent_status IN ('pending', 'granted', 'denied', 'unsubscribed'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_data JSONB DEFAULT '{}';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON leads(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_at ON leads(next_action_at);

-- =====================================================
-- AGENT RUNS TABLE - Track agent executions
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(50) NOT NULL,
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('prospector', 'engage', 'qualifier', 'enricher')),
  config JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  leads_found INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_type ON agent_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at);

-- Enable RLS
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated service role
CREATE POLICY "Service role access for agent_runs" ON agent_runs
  FOR ALL USING (true);

-- =====================================================
-- LEAD INTERACTIONS TABLE - Track all lead communications
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  agent_id VARCHAR(50),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'phone', 'sms', 'web', 'linkedin')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  interaction_type VARCHAR(50) NOT NULL, -- 'initial_contact', 'follow_up', 'response', 'qualification', etc.
  subject VARCHAR(500),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_agent_id ON lead_interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_channel ON lead_interactions(channel);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_status ON lead_interactions(status);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON lead_interactions(created_at);

-- Enable RLS
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated service role
CREATE POLICY "Service role access for lead_interactions" ON lead_interactions
  FOR ALL USING (true);

-- =====================================================
-- PROSPECT SOURCES TABLE - Track lead sources
-- =====================================================

CREATE TABLE IF NOT EXISTS prospect_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('directory', 'api', 'scrape', 'manual', 'referral')),
  url VARCHAR(500),
  config JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMPTZ,
  leads_found_total INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  region VARCHAR(50), -- 'mexico', 'latam', 'usa', etc.
  industries TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_sources_source_type ON prospect_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_prospect_sources_is_active ON prospect_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_prospect_sources_region ON prospect_sources(region);

-- Enable RLS
ALTER TABLE prospect_sources ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated service role
CREATE POLICY "Service role access for prospect_sources" ON prospect_sources
  FOR ALL USING (true);

-- Insert default prospect sources for Mexico + LATAM
INSERT INTO prospect_sources (name, source_type, url, region, industries) VALUES
  ('SIEM México', 'directory', 'https://siem.gob.mx', 'mexico', ARRAY['food_processing', 'dairy', 'meat', 'beverages']),
  ('CANACINTRA', 'directory', 'https://canacintra.org.mx', 'mexico', ARRAY['food_processing', 'manufacturing']),
  ('Google Maps - Alimentos MX', 'api', 'https://maps.googleapis.com', 'mexico', ARRAY['food_processing', 'cold_storage']),
  ('Google Maps - Lácteos MX', 'api', 'https://maps.googleapis.com', 'mexico', ARRAY['dairy']),
  ('Google Maps - Cárnicos MX', 'api', 'https://maps.googleapis.com', 'mexico', ARRAY['meat']),
  ('Cámaras de Comercio LATAM', 'directory', NULL, 'latam', ARRAY['food_processing', 'cold_storage'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCORING RULES TABLE - Configurable scoring criteria
-- =====================================================

CREATE TABLE IF NOT EXISTS scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- 'demographic', 'intent', 'engagement'
  factor VARCHAR(100) NOT NULL,
  condition JSONB NOT NULL, -- e.g., {"industry": ["food_processing", "dairy"]}
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoring_rules_category ON scoring_rules(category);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_is_active ON scoring_rules(is_active);

-- Enable RLS
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated service role
CREATE POLICY "Service role access for scoring_rules" ON scoring_rules
  FOR ALL USING (true);

-- Insert default scoring rules
INSERT INTO scoring_rules (category, factor, condition, points, description) VALUES
  -- Demographic factors (0-40 pts)
  ('demographic', 'industry_match', '{"industries": ["food_processing", "cold_storage", "dairy", "meat", "beverages", "pharmaceuticals", "ice_plants"]}', 15, 'Industry matches target industries'),
  ('demographic', 'company_size_ideal', '{"employee_range": [50, 500]}', 10, 'Company size 50-500 employees'),
  ('demographic', 'location_mexico', '{"countries": ["MX"]}', 10, 'Located in Mexico'),
  ('demographic', 'location_latam', '{"countries": ["CO", "PE", "CL", "AR", "EC", "GT", "CR"]}', 8, 'Located in LATAM'),
  ('demographic', 'relevant_title', '{"titles": ["mantenimiento", "compras", "planta", "operaciones", "ingenieria"]}', 5, 'Contact has relevant job title'),

  -- Intent factors (0-30 pts)
  ('intent', 'frick_equipment', '{"brands": ["frick", "york-frick"]}', 20, 'Has Frick/York-Frick equipment installed'),
  ('intent', 'danfoss_equipment', '{"brands": ["danfoss"]}', 20, 'Has Danfoss equipment installed'),
  ('intent', 'refacciones_need', '{"signals": ["refacciones", "repuestos", "mantenimiento", "reparacion"]}', 10, 'Shows signs of needing spare parts'),

  -- Engagement factors (0-30 pts)
  ('engagement', 'purchase_history', '{"has_purchases": true}', 15, 'Has previous purchase history'),
  ('engagement', 'previous_interaction', '{"has_interactions": true}', 15, 'Has previous interactions with company')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION: Calculate lead score
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  lead_record RECORD;
BEGIN
  SELECT * INTO lead_record FROM leads WHERE id = lead_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Industry scoring (15 pts)
  IF lead_record.industry IN ('food_processing', 'cold_storage', 'dairy', 'meat', 'beverages', 'pharmaceuticals', 'ice_plants') THEN
    total_score := total_score + 15;
  END IF;

  -- Location scoring (10 pts for Mexico, 8 for LATAM)
  IF lead_record.location ILIKE '%México%' OR lead_record.location ILIKE '%Mexico%' OR lead_record.location ILIKE '%CDMX%' THEN
    total_score := total_score + 10;
  ELSIF lead_record.location ILIKE ANY(ARRAY['%Colombia%', '%Perú%', '%Peru%', '%Chile%', '%Argentina%', '%Ecuador%', '%Guatemala%', '%Costa Rica%']) THEN
    total_score := total_score + 8;
  END IF;

  -- Equipment brands scoring (20 pts each)
  IF 'frick' = ANY(lead_record.equipment_brands) OR 'york-frick' = ANY(lead_record.equipment_brands) THEN
    total_score := total_score + 20;
  END IF;
  IF 'danfoss' = ANY(lead_record.equipment_brands) THEN
    total_score := total_score + 20;
  END IF;

  RETURN LEAST(total_score, 100);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Categorize lead by score
-- =====================================================

CREATE OR REPLACE FUNCTION categorize_lead(score INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
  IF score >= 80 THEN
    RETURN 'HOT';
  ELSIF score >= 60 THEN
    RETURN 'WARM';
  ELSIF score >= 40 THEN
    RETURN 'COLD';
  ELSE
    RETURN 'DISCARD';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update lead score and category
-- =====================================================

CREATE OR REPLACE FUNCTION update_lead_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := calculate_lead_score(NEW.id);
  NEW.category := categorize_lead(NEW.score);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_update_lead_score') THEN
    CREATE TRIGGER auto_update_lead_score
      BEFORE INSERT OR UPDATE ON leads
      FOR EACH ROW
      EXECUTE FUNCTION update_lead_score_trigger();
  END IF;
END;
$$;

-- =====================================================
-- VIEWS: Useful aggregations
-- =====================================================

-- View: Lead summary by category
CREATE OR REPLACE VIEW lead_summary_by_category AS
SELECT
  category,
  COUNT(*) as total_leads,
  AVG(score) as avg_score,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
  COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_leads
FROM leads
GROUP BY category
ORDER BY
  CASE category
    WHEN 'HOT' THEN 1
    WHEN 'WARM' THEN 2
    WHEN 'COLD' THEN 3
    ELSE 4
  END;

-- View: Agent run performance
CREATE OR REPLACE VIEW agent_performance AS
SELECT
  agent_type,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  SUM(leads_found) as total_leads_found,
  SUM(leads_qualified) as total_leads_qualified,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM agent_runs
GROUP BY agent_type;

-- View: Recent HOT leads for immediate action
CREATE OR REPLACE VIEW hot_leads_action_required AS
SELECT
  l.id,
  l.name,
  l.company,
  l.email,
  l.phone,
  l.score,
  l.industry,
  l.location,
  l.equipment_brands,
  l.created_at,
  l.next_action_at,
  COUNT(li.id) as total_interactions,
  MAX(li.created_at) as last_interaction_at
FROM leads l
LEFT JOIN lead_interactions li ON l.id = li.lead_id
WHERE l.category = 'HOT'
  AND l.status IN ('new', 'contacted')
  AND l.consent_status != 'denied'
GROUP BY l.id
ORDER BY l.score DESC, l.created_at DESC;
