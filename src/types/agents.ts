import { Json } from './database'

// =====================================================
// Lead Types (Extended)
// =====================================================

export type LeadCategory = 'HOT' | 'WARM' | 'COLD' | 'DISCARD'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'unsubscribed'

export interface LeadScoreBreakdown {
  demographic: {
    industry: number
    companySize: number
    location: number
    jobTitle: number
  }
  intent: {
    equipmentBrands: number
    refaccionesNeed: number
  }
  engagement: {
    purchaseHistory: number
    previousInteractions: number
  }
  total: number
}

export interface ExtendedLead {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  source: string
  interest: string | null
  notes: string | null
  status: LeadStatus
  // New agent-related fields
  score: number
  score_breakdown: LeadScoreBreakdown | null
  category: LeadCategory
  industry: string | null
  equipment_brands: string[]
  assigned_agent: string | null
  consent_status: ConsentStatus
  last_contact_at: string | null
  next_action_at: string | null
  company_size: string | null
  location: string | null
  website: string | null
  enrichment_data: Json | null
  created_at: string
  updated_at: string
}

// =====================================================
// Agent Types
// =====================================================

export type AgentType = 'prospector' | 'engage' | 'qualifier' | 'enricher'
export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface AgentRun {
  id: string
  agent_id: string
  agent_type: AgentType
  config: AgentConfig
  results: AgentResults
  status: AgentRunStatus
  leads_found: number
  leads_qualified: number
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface AgentConfig {
  industries?: string[]
  regions?: string[]
  maxLeads?: number
  sources?: string[]
  minScore?: number
  dryRun?: boolean
}

export interface AgentResults {
  leadsProcessed: number
  leadsCreated: number
  leadsUpdated: number
  leadsByCategory: {
    HOT: number
    WARM: number
    COLD: number
    DISCARD: number
  }
  errors: string[]
  sources: {
    name: string
    leadsFound: number
  }[]
}

// =====================================================
// Interaction Types
// =====================================================

export type InteractionChannel = 'email' | 'whatsapp' | 'phone' | 'sms' | 'web' | 'linkedin'
export type InteractionDirection = 'inbound' | 'outbound'
export type InteractionStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'

export interface LeadInteraction {
  id: string
  lead_id: string
  agent_id: string | null
  channel: InteractionChannel
  direction: InteractionDirection
  interaction_type: string
  subject: string | null
  content: string | null
  metadata: Json | null
  status: InteractionStatus
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  created_at: string
}

// =====================================================
// Prospect Source Types
// =====================================================

export type SourceType = 'directory' | 'api' | 'scrape' | 'manual' | 'referral'

export interface ProspectSource {
  id: string
  name: string
  source_type: SourceType
  url: string | null
  config: Json | null
  last_scraped_at: string | null
  leads_found_total: number
  is_active: boolean
  region: string | null
  industries: string[]
  created_at: string
  updated_at: string
}

// =====================================================
// Scoring Types
// =====================================================

export interface ScoringRule {
  id: string
  category: 'demographic' | 'intent' | 'engagement'
  factor: string
  condition: Json
  points: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScoringCriteria {
  industries: string[]
  employeeRange: [number, number]
  countries: string[]
  relevantTitles: string[]
  targetBrands: string[]
  intentSignals: string[]
}

// =====================================================
// Tool Input/Output Types
// =====================================================

export interface SearchLeadsInput {
  query: string
  industries?: string[]
  regions?: string[]
  limit?: number
  source?: string
}

export interface SearchLeadsOutput {
  leads: RawLeadData[]
  source: string
  totalFound: number
}

// =====================================================
// LinkedIn Types
// =====================================================

export interface LinkedInProfile {
  name: string
  title: string
  linkedinUrl: string
  location?: string
  headline?: string
}

export interface LinkedInCompany {
  name: string
  linkedinUrl: string
  industry?: string
  size?: string
  website?: string
  description?: string
  headquarters?: string
}

export interface SearchLinkedInInput {
  companyName: string
  titles?: string[]
  location?: string
  limit?: number
  getEmployees?: boolean
}

export interface SearchLinkedInOutput {
  company: LinkedInCompany | null
  employees: LinkedInProfile[]
  totalFound: number
  source: 'linkedin'
}

// =====================================================
// Raw Lead Data (Extended with LinkedIn)
// =====================================================

export interface RawLeadData {
  name: string
  company: string
  email?: string
  phone?: string
  industry?: string
  location?: string
  website?: string
  companySize?: string
  source: string
  sourceUrl?: string
  rawData?: Json
  // LinkedIn enrichment data
  linkedinCompanyUrl?: string
  linkedinContacts?: LinkedInProfile[]
}

export interface QualifyLeadInput {
  lead: RawLeadData | ExtendedLead
}

export interface QualifyLeadOutput {
  score: number
  category: LeadCategory
  scoreBreakdown: LeadScoreBreakdown
  qualifies: boolean
  reasons: string[]
}

export interface EnrichLeadInput {
  lead: RawLeadData
}

export interface EnrichLeadOutput {
  email?: string
  phone?: string
  website?: string
  companySize?: string
  industry?: string
  equipmentBrands?: string[]
  socialProfiles?: {
    linkedin?: string
    facebook?: string
  }
  additionalContacts?: {
    name: string
    title: string
    email?: string
  }[]
}

export interface SaveLeadInput {
  lead: RawLeadData
  score: number
  category: LeadCategory
  scoreBreakdown: LeadScoreBreakdown
  enrichmentData?: EnrichLeadOutput
  agentId: string
}

export interface SaveLeadOutput {
  id: string
  isNew: boolean
  success: boolean
  error?: string
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface ProspectorRequest {
  industries?: string[]
  regions?: string[]
  maxLeads?: number
  sources?: string[]
  minScore?: number
  dryRun?: boolean
}

export interface ProspectorResponse {
  success: boolean
  runId: string
  results?: AgentResults
  error?: string
}

export interface LeadsDashboardFilters {
  category?: LeadCategory
  status?: LeadStatus
  industry?: string
  minScore?: number
  assignedAgent?: string
  dateRange?: {
    from: string
    to: string
  }
}

// =====================================================
// Target Industries
// =====================================================

export const TARGET_INDUSTRIES = [
  { id: 'food_processing', label: 'Procesamiento de alimentos', labelEs: 'Procesamiento de alimentos' },
  { id: 'cold_storage', label: 'Cold Storage / Cadena de frío', labelEs: 'Almacenamiento en frío' },
  { id: 'dairy', label: 'Dairy / Lácteos', labelEs: 'Lácteos' },
  { id: 'meat', label: 'Meat Processing / Cárnicos', labelEs: 'Cárnicos' },
  { id: 'beverages', label: 'Beverages / Bebidas', labelEs: 'Bebidas y cervecerías' },
  { id: 'pharmaceuticals', label: 'Pharmaceuticals / Farmacéutica', labelEs: 'Farmacéutica' },
  { id: 'ice_plants', label: 'Ice Plants / Plantas de hielo', labelEs: 'Plantas de hielo' },
  { id: 'supermarkets', label: 'Supermarkets / Supermercados', labelEs: 'Supermercados' },
] as const

export const TARGET_REGIONS = [
  { id: 'mexico', label: 'México', countries: ['MX'] },
  { id: 'central_america', label: 'Centroamérica', countries: ['GT', 'SV', 'HN', 'NI', 'CR', 'PA'] },
  { id: 'south_america', label: 'Sudamérica', countries: ['CO', 'PE', 'EC', 'CL', 'AR', 'VE', 'BO', 'PY', 'UY'] },
  { id: 'caribbean', label: 'Caribe', countries: ['DO', 'PR', 'CU'] },
] as const

export const EQUIPMENT_BRANDS = [
  { id: 'frick', label: 'Frick / York-Frick', aliases: ['frick', 'york-frick', 'york frick', 'yorkfrick'] },
  { id: 'danfoss', label: 'Danfoss', aliases: ['danfoss'] },
  { id: 'mycom', label: 'MYCOM', aliases: ['mycom', 'mayekawa'] },
  { id: 'bitzer', label: 'Bitzer', aliases: ['bitzer'] },
  { id: 'carrier', label: 'Carrier', aliases: ['carrier'] },
  { id: 'copeland', label: 'Copeland', aliases: ['copeland', 'emerson copeland'] },
] as const

// =====================================================
// LinkedIn Target Job Titles
// =====================================================

export const LINKEDIN_TARGET_TITLES = [
  'Gerente de Mantenimiento',
  'Jefe de Mantenimiento',
  'Director de Operaciones',
  'Gerente de Compras',
  'Jefe de Compras',
  'Ingeniero de Planta',
  'Director de Planta',
  'Gerente de Operaciones',
  'Supervisor de Mantenimiento',
  'Maintenance Manager',
  'Operations Manager',
  'Purchasing Manager',
  'Plant Manager',
  'Plant Engineer',
] as const
