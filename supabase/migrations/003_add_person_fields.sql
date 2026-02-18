-- Migration: Add person mode fields to leads table
-- Enables the prospector agent to track individual decision-makers (person leads)
-- in addition to company-level leads.

-- Add new columns for person mode
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type text DEFAULT 'company';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS person_linkedin_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_confidence text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS parent_company_id uuid REFERENCES leads(id) ON DELETE SET NULL;

-- Backfill existing leads as company type
UPDATE leads SET lead_type = 'company' WHERE lead_type IS NULL;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_parent_company_id ON leads(parent_company_id);
CREATE INDEX IF NOT EXISTS idx_leads_job_title ON leads(job_title) WHERE job_title IS NOT NULL;

-- Add check constraint for lead_type
ALTER TABLE leads ADD CONSTRAINT chk_lead_type CHECK (lead_type IN ('company', 'person'));

-- Add check constraint for email_confidence
ALTER TABLE leads ADD CONSTRAINT chk_email_confidence CHECK (
  email_confidence IS NULL OR email_confidence IN ('verified', 'guessed', 'pattern', 'unknown')
);
