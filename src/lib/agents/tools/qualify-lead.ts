import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import {
  QualifyLeadInput,
  QualifyLeadOutput,
  RawLeadData,
  LeadCategory,
  LeadScoreBreakdown,
  SearchMode,
  EmailConfidence,
  TARGET_INDUSTRIES,
  EQUIPMENT_BRANDS,
  LinkedInProfile,
} from '@/types/agents'

// Industry matching
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  food_processing: ['alimentos', 'procesadora', 'empacadora', 'food', 'processing'],
  cold_storage: ['frío', 'frigorífico', 'almacén', 'cold', 'storage', 'cadena de frío'],
  dairy: ['lácteos', 'leche', 'quesos', 'yogurt', 'dairy', 'lacteos'],
  meat: ['cárnicos', 'rastro', 'carnes', 'frigorífico', 'meat', 'carnicos'],
  beverages: ['cervecería', 'bebidas', 'refrescos', 'jugos', 'beverages', 'cerveza'],
  pharmaceuticals: ['farmacéutico', 'laboratorio', 'medicamentos', 'pharma', 'farmaceutico'],
  ice_plants: ['hielo', 'ice', 'planta de hielo'],
  supermarkets: ['supermercado', 'tienda', 'autoservicio', 'supermarket'],
}

// Relevant job titles
const RELEVANT_TITLES = [
  'mantenimiento',
  'maintenance',
  'compras',
  'purchasing',
  'procurement',
  'planta',
  'plant',
  'operaciones',
  'operations',
  'ingeniería',
  'engineering',
  'técnico',
  'technical',
  'gerente',
  'manager',
  'director',
]

// Location scoring
function scoreLocation(location?: string): number {
  if (!location) return 0

  const locationLower = location.toLowerCase()

  // Mexico (high priority)
  if (
    locationLower.includes('méxico') ||
    locationLower.includes('mexico') ||
    locationLower.includes('cdmx') ||
    locationLower.includes('monterrey') ||
    locationLower.includes('guadalajara') ||
    locationLower.includes('querétaro') ||
    locationLower.includes('queretaro') ||
    locationLower.includes('puebla') ||
    locationLower.includes('león') ||
    locationLower.includes('leon') ||
    locationLower.includes('tijuana')
  ) {
    return 10
  }

  // LATAM main markets
  if (
    locationLower.includes('colombia') ||
    locationLower.includes('bogotá') ||
    locationLower.includes('bogota') ||
    locationLower.includes('medellín') ||
    locationLower.includes('medellin') ||
    locationLower.includes('perú') ||
    locationLower.includes('peru') ||
    locationLower.includes('lima') ||
    locationLower.includes('chile') ||
    locationLower.includes('santiago') ||
    locationLower.includes('argentina') ||
    locationLower.includes('buenos aires')
  ) {
    return 8
  }

  // Other LATAM
  if (
    locationLower.includes('ecuador') ||
    locationLower.includes('guatemala') ||
    locationLower.includes('costa rica') ||
    locationLower.includes('panamá') ||
    locationLower.includes('panama') ||
    locationLower.includes('república dominicana') ||
    locationLower.includes('dominican')
  ) {
    return 5
  }

  return 0
}

// Industry scoring
function scoreIndustry(industry?: string, companyName?: string): number {
  if (!industry && !companyName) return 0

  const searchText = `${industry || ''} ${companyName || ''}`.toLowerCase()

  for (const [, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return 15
    }
  }

  return 0
}

// Company size scoring
function scoreCompanySize(size?: string): number {
  if (!size) return 0

  // Parse size ranges
  const sizeLower = size.toLowerCase()

  // Ideal range: 50-500 employees
  if (
    sizeLower.includes('50-100') ||
    sizeLower.includes('100-250') ||
    sizeLower.includes('150-300') ||
    sizeLower.includes('200-500') ||
    sizeLower.includes('100-200')
  ) {
    return 10
  }

  // Acceptable range: 20-50 or 500-1000
  if (
    sizeLower.includes('25-50') ||
    sizeLower.includes('20-50') ||
    sizeLower.includes('500-1000')
  ) {
    return 5
  }

  // Small companies still worth considering
  if (sizeLower.includes('10-25') || sizeLower.includes('10-20')) {
    return 3
  }

  return 0
}

// Job title scoring
function scoreJobTitle(contact?: string, email?: string): number {
  const searchText = `${contact || ''} ${email || ''}`.toLowerCase()

  for (const title of RELEVANT_TITLES) {
    if (searchText.includes(title)) {
      return 5
    }
  }

  return 0
}

// Equipment brands scoring
function scoreEquipmentBrands(brands?: string[], companyInfo?: string): number {
  const searchText = (brands || []).join(' ').toLowerCase() + (companyInfo || '').toLowerCase()

  // Check for Frick/Danfoss
  const frickMatch = EQUIPMENT_BRANDS.find((b) => b.id === 'frick')
  const danfossMatch = EQUIPMENT_BRANDS.find((b) => b.id === 'danfoss')

  let score = 0

  if (frickMatch?.aliases.some((alias) => searchText.includes(alias))) {
    score += 20
  }
  if (danfossMatch?.aliases.some((alias) => searchText.includes(alias))) {
    score = Math.min(score + 20, 20) // Cap at 20
  }

  return score
}

// Refacciones need scoring
function scoreRefaccionesNeed(notes?: string, interest?: string): number {
  const searchText = `${notes || ''} ${interest || ''}`.toLowerCase()

  const needSignals = [
    'refacciones',
    'repuestos',
    'mantenimiento',
    'reparación',
    'reparacion',
    'falla',
    'compresor',
    'evaporador',
    'condensador',
    'spare parts',
    'maintenance',
    'repair',
  ]

  if (needSignals.some((signal) => searchText.includes(signal))) {
    return 10
  }

  return 0
}

// LinkedIn contacts scoring - bonus for having identified decision-makers
function scoreLinkedInContacts(linkedinContacts?: LinkedInProfile[]): number {
  if (!linkedinContacts || linkedinContacts.length === 0) return 0

  // Base points for having LinkedIn contacts
  let score = 3

  // Additional points for contacts with relevant titles
  const relevantTitleKeywords = [
    'mantenimiento',
    'maintenance',
    'compras',
    'purchasing',
    'operaciones',
    'operations',
    'planta',
    'plant',
    'gerente',
    'manager',
    'director',
    'jefe',
  ]

  const hasRelevantContact = linkedinContacts.some((contact) => {
    const titleLower = (contact.title || '').toLowerCase()
    return relevantTitleKeywords.some((keyword) => titleLower.includes(keyword))
  })

  if (hasRelevantContact) {
    score += 5 // Bonus for having a decision-maker identified
  }

  return Math.min(score, 8) // Cap at 8 points
}

// Person job title scoring (reweighted for person mode)
// Tier 1 (25pts): Gerente/Jefe de Mantenimiento
// Tier 2 (20pts): Gerente de Compras, Ingeniero de Planta
// Tier 3 (15pts): Supervisor, Gerente de Operaciones
// Tier 4 (10pts): C-Level (CEO, COO, Director General)
// Tier 5 (5pts): Any management/engineering keyword
const PERSON_TITLE_TIERS: Array<{ points: number; keywords: string[] }> = [
  {
    points: 25,
    keywords: [
      'gerente de mantenimiento', 'jefe de mantenimiento',
      'maintenance manager', 'head of maintenance',
    ],
  },
  {
    points: 20,
    keywords: [
      'gerente de compras', 'jefe de compras', 'ingeniero de planta',
      'purchasing manager', 'plant engineer', 'procurement manager',
    ],
  },
  {
    points: 15,
    keywords: [
      'supervisor de mantenimiento', 'gerente de operaciones',
      'operations manager', 'maintenance supervisor',
      'director de planta', 'plant manager',
    ],
  },
  {
    points: 10,
    keywords: [
      'ceo', 'coo', 'cto', 'director general', 'presidente',
      'chief executive', 'chief operating', 'general manager',
    ],
  },
  {
    points: 5,
    keywords: [
      'gerente', 'manager', 'director', 'jefe', 'ingeniero',
      'engineer', 'supervisor', 'coordinador',
    ],
  },
]

function scorePersonJobTitle(jobTitle?: string): number {
  if (!jobTitle) return 0
  const titleLower = jobTitle.toLowerCase()

  for (const tier of PERSON_TITLE_TIERS) {
    if (tier.keywords.some(kw => titleLower.includes(kw))) {
      return tier.points
    }
  }
  return 0
}

// Email availability scoring for person mode
function scoreEmailAvailability(emailConfidence?: EmailConfidence): number {
  if (!emailConfidence) return 0
  switch (emailConfidence) {
    case 'verified': return 15
    case 'guessed': return 10
    case 'pattern': return 5
    case 'unknown': return 0
    default: return 0
  }
}

// Person-specific qualification function
function qualifyPersonLead(input: QualifyLeadInput): QualifyLeadOutput {
  const lead = input.lead as RawLeadData

  // Person mode reweighted scoring
  const jobTitleScore = scorePersonJobTitle(lead.jobTitle)
  const emailScore = scoreEmailAvailability(lead.emailConfidence)
  const industryScore = scoreIndustry(lead.industry, lead.company || lead.name)
  const companySizeScore = Math.min(scoreCompanySize(lead.companySize), 5) // Capped at 5
  const locationScore = scoreLocation(lead.location)
  const equipmentScore = scoreEquipmentBrands(undefined, lead.company)
  const refaccionesScore = scoreRefaccionesNeed(lead.rawData?.toString())
  const linkedInContactsScore = lead.personLinkedinUrl ? 5 : 0

  const demographicTotal = Math.min(industryScore, 10) + companySizeScore + locationScore + jobTitleScore
  const intentTotal = equipmentScore + refaccionesScore
  const engagementTotal = emailScore + linkedInContactsScore
  const totalScore = Math.min(demographicTotal + intentTotal + engagementTotal, 100)

  const category = calculateCategory(totalScore)

  const scoreBreakdown: LeadScoreBreakdown = {
    demographic: {
      industry: Math.min(industryScore, 10),
      companySize: companySizeScore,
      location: locationScore,
      jobTitle: jobTitleScore,
    },
    intent: {
      equipmentBrands: equipmentScore,
      refaccionesNeed: refaccionesScore,
    },
    engagement: {
      purchaseHistory: emailScore,
      previousInteractions: linkedInContactsScore,
    },
    total: totalScore,
  }

  const reasons: string[] = []
  if (jobTitleScore >= 20) reasons.push('Puesto de alta decisión')
  else if (jobTitleScore >= 10) reasons.push('Puesto relevante')
  if (emailScore >= 15) reasons.push('Email verificado')
  else if (emailScore >= 5) reasons.push('Email disponible')
  if (industryScore > 0) reasons.push('Industria objetivo')
  if (locationScore >= 10) reasons.push('Ubicado en México')
  else if (locationScore >= 5) reasons.push('Ubicado en LATAM')
  if (equipmentScore > 0) reasons.push('Posible usuario de Frick/Danfoss')
  if (lead.personLinkedinUrl) reasons.push('LinkedIn disponible')

  if (totalScore < 40) {
    reasons.push('Score bajo, no califica para seguimiento activo')
  }

  return {
    score: totalScore,
    category,
    scoreBreakdown,
    qualifies: totalScore >= 40,
    reasons,
  }
}

// Calculate category from score
function calculateCategory(score: number): LeadCategory {
  if (score >= 80) return 'HOT'
  if (score >= 60) return 'WARM'
  if (score >= 30) return 'COLD'
  return 'DISCARD'
}

// Main qualification function (dispatches based on search mode)
export function qualifyLead(input: QualifyLeadInput, searchMode?: SearchMode): QualifyLeadOutput {
  if (searchMode === 'person' || (input.lead as RawLeadData).leadType === 'person') {
    return qualifyPersonLead(input)
  }
  const lead = input.lead as RawLeadData

  // Calculate demographic scores
  const industryScore = scoreIndustry(lead.industry, lead.company || lead.name)
  const companySizeScore = scoreCompanySize(lead.companySize)
  const locationScore = scoreLocation(lead.location)
  const jobTitleScore = scoreJobTitle(lead.name, lead.email)

  // Calculate intent scores
  const equipmentScore = scoreEquipmentBrands(undefined, lead.company)
  const refaccionesScore = scoreRefaccionesNeed(lead.rawData?.toString())

  // Calculate engagement scores
  const purchaseHistoryScore = 0 // default for new leads
  const linkedInContactsScore = scoreLinkedInContacts(lead.linkedinContacts)

  // Calculate totals
  const demographicTotal = industryScore + companySizeScore + locationScore + jobTitleScore
  const intentTotal = equipmentScore + refaccionesScore
  const engagementTotal = purchaseHistoryScore + linkedInContactsScore
  const totalScore = Math.min(demographicTotal + intentTotal + engagementTotal, 100)

  const category = calculateCategory(totalScore)

  const scoreBreakdown: LeadScoreBreakdown = {
    demographic: {
      industry: industryScore,
      companySize: companySizeScore,
      location: locationScore,
      jobTitle: jobTitleScore,
    },
    intent: {
      equipmentBrands: equipmentScore,
      refaccionesNeed: refaccionesScore,
    },
    engagement: {
      purchaseHistory: purchaseHistoryScore,
      previousInteractions: linkedInContactsScore, // Using LinkedIn contacts as engagement indicator
    },
    total: totalScore,
  }

  // Generate reasons
  const reasons: string[] = []
  if (industryScore > 0) reasons.push('Industria objetivo')
  if (locationScore >= 10) reasons.push('Ubicado en México')
  else if (locationScore >= 5) reasons.push('Ubicado en LATAM')
  if (companySizeScore >= 10) reasons.push('Tamaño de empresa ideal')
  if (equipmentScore > 0) reasons.push('Posible usuario de Frick/Danfoss')
  if (jobTitleScore > 0) reasons.push('Contacto con título relevante')
  if (linkedInContactsScore > 0) reasons.push('Contactos de LinkedIn identificados')

  if (totalScore < 40) {
    reasons.push('Score bajo, no califica para seguimiento activo')
  }

  return {
    score: totalScore,
    category,
    scoreBreakdown,
    qualifies: totalScore >= 40,
    reasons,
  }
}

// Create LangChain tool for qualification
export const createQualifyLeadTool = () => {
  return new DynamicStructuredTool({
    name: 'qualify_lead',
    description:
      'Qualify a lead by calculating its score based on industry, location, company size, and other factors. Returns a score (0-100), category (HOT/WARM/COLD/DISCARD), and detailed breakdown.',
    schema: z.object({
      name: z.string().describe('Contact or company name'),
      company: z.string().optional().describe('Company name'),
      industry: z.string().optional().describe('Industry sector'),
      location: z.string().optional().describe('Location (city, state, country)'),
      companySize: z.string().optional().describe('Company size (e.g., "50-100")'),
      email: z.string().optional().describe('Email address'),
      notes: z.string().optional().describe('Additional notes or context'),
    }),
    func: async (input) => {
      const result = qualifyLead({ lead: input as RawLeadData })
      return JSON.stringify(result, null, 2)
    },
  })
}

// Export utility functions for direct use
export {
  scoreLocation,
  scoreIndustry,
  scoreCompanySize,
  scoreJobTitle,
  scoreEquipmentBrands,
  scoreRefaccionesNeed,
  scoreLinkedInContacts,
  scorePersonJobTitle,
  scoreEmailAvailability,
  calculateCategory,
  qualifyPersonLead,
}
