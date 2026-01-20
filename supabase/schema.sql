-- Frío Ingeniería Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BRANDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  is_direct_distributor BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default brands
INSERT INTO brands (name, slug, is_direct_distributor) VALUES
  ('MYCOM', 'mycom', true),
  ('YORK-FRICK', 'york-frick', true),
  ('Danfoss', 'danfoss', false),
  ('Parker', 'parker', false)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- EQUIPMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  model VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL, -- compressor, evaporator, condenser, etc.
  description TEXT,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_brand ON equipment(brand_id);
CREATE INDEX idx_equipment_type ON equipment(type);

-- =====================================================
-- PARTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  compatible_equipment TEXT[] DEFAULT '{}',
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  in_stock BOOLEAN DEFAULT FALSE,
  lead_time_days INTEGER,
  image_url TEXT,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_brand ON parts(brand_id);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_part_number ON parts(part_number);

-- Full-text search index for parts
ALTER TABLE parts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(part_number, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(category, '')), 'C')
  ) STORED;

CREATE INDEX idx_parts_search ON parts USING GIN(search_vector);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  client_name VARCHAR(200) NOT NULL,
  client_logo_url TEXT,
  location VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  industry VARCHAR(100) NOT NULL, -- lacteos, carnicos, bebidas, etc.
  application VARCHAR(100) NOT NULL, -- cuartos-frios, tuneles, chillers, etc.
  refrigerant VARCHAR(50),
  capacity_tr DECIMAL(10,2),
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT,
  testimonial TEXT,
  testimonial_author VARCHAR(200),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_application ON projects(application);
CREATE INDEX idx_projects_year ON projects(year);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_published ON projects(published);

-- =====================================================
-- QUOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('QT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')),
  name VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('project', 'parts')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'closed')),
  items JSONB, -- For parts quotes: [{part_number, quantity, description}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_type ON quotes(type);
CREATE INDEX idx_quotes_email ON quotes(email);

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  source VARCHAR(100) NOT NULL, -- website, whatsapp, referral, etc.
  interest VARCHAR(200),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_email ON leads(email);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read access for brands, equipment, parts, and published projects
CREATE POLICY "Public read access for brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access for equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Public read access for parts" ON parts FOR SELECT USING (true);
CREATE POLICY "Public read access for published projects" ON projects FOR SELECT USING (published = true);

-- Public insert access for quotes and leads (for contact forms)
CREATE POLICY "Public insert access for quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for leads" ON leads FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to search parts
CREATE OR REPLACE FUNCTION search_parts(search_query TEXT)
RETURNS SETOF parts AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM parts
  WHERE search_vector @@ plainto_tsquery('spanish', search_query)
  ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
