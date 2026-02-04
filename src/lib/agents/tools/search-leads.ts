import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import {
  SearchLeadsInput,
  SearchLeadsOutput,
  RawLeadData,
  TARGET_INDUSTRIES,
  TARGET_REGIONS,
} from '@/types/agents'
import { searchGoogleMapsLeads, isGoogleMapsConfigured } from '@/lib/services/googleMapsService'
import {
  searchSIEM as searchSIEMService,
  searchCANACINTRA as searchCANACINTRAService,
  isScrapingEnabled,
} from '@/lib/services/scrapingService'

// Fallback mock data - used when APIs are not configured
const MOCK_COMPANIES: RawLeadData[] = [
  {
    name: 'Productos Lácteos del Norte SA de CV',
    company: 'Lácteos del Norte',
    email: 'compras@lacteosdelnorte.com.mx',
    phone: '+52 81 8123 4567',
    industry: 'dairy',
    location: 'Monterrey, Nuevo León, México',
    website: 'https://lacteosdelnorte.com.mx',
    companySize: '100-250',
    source: 'SIEM',
  },
  {
    name: 'Frigorífico Industrial de Guadalajara',
    company: 'Frigorífico GDL',
    email: 'mantenimiento@frigorifico-gdl.mx',
    phone: '+52 33 3456 7890',
    industry: 'meat',
    location: 'Guadalajara, Jalisco, México',
    website: 'https://frigorifico-gdl.mx',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Cervecería Artesanal Querétaro',
    company: 'Cervecería Querétaro',
    email: 'info@cerveceriaqro.com',
    phone: '+52 442 789 0123',
    industry: 'beverages',
    location: 'Querétaro, Querétaro, México',
    website: 'https://cerveceriaqro.com',
    companySize: '25-50',
    source: 'Google Maps',
  },
  {
    name: 'Alimentos Congelados del Bajío',
    company: 'Congelados Bajío',
    email: 'operaciones@congeladosbajio.mx',
    phone: '+52 477 234 5678',
    industry: 'cold_storage',
    location: 'León, Guanajuato, México',
    website: 'https://congeladosbajio.mx',
    companySize: '150-300',
    source: 'SIEM',
  },
  {
    name: 'Laboratorios Farmacéuticos Azteca',
    company: 'Farma Azteca',
    email: 'logistica@farmazteca.com.mx',
    phone: '+52 55 5678 9012',
    industry: 'pharmaceuticals',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://farmazteca.com.mx',
    companySize: '200-500',
    source: 'CANACINTRA',
  },
  {
    name: 'Procesadora de Mariscos del Pacífico',
    company: 'Mariscos Pacífico',
    email: 'planta@mariscospacifico.mx',
    phone: '+52 669 345 6789',
    industry: 'food_processing',
    location: 'Mazatlán, Sinaloa, México',
    website: 'https://mariscospacifico.mx',
    companySize: '75-150',
    source: 'Google Maps',
  },
  {
    name: 'Hielo Industrial de Veracruz',
    company: 'Hielo Veracruz',
    email: 'ventas@hieloveracruz.com',
    phone: '+52 229 456 7890',
    industry: 'ice_plants',
    location: 'Veracruz, Veracruz, México',
    website: 'https://hieloveracruz.com',
    companySize: '20-50',
    source: 'SIEM',
  },
  {
    name: 'Cárnicos Premium Colombia',
    company: 'Cárnicos Premium',
    email: 'gerencia@carnicospremium.co',
    phone: '+57 1 234 5678',
    industry: 'meat',
    location: 'Bogotá, Colombia',
    website: 'https://carnicospremium.co',
    companySize: '100-200',
    source: 'Cámara de Comercio Colombia',
  },
  {
    name: 'Lácteos Andinos Perú',
    company: 'Lácteos Andinos',
    email: 'produccion@lacteosandinos.pe',
    phone: '+51 1 567 8901',
    industry: 'dairy',
    location: 'Lima, Perú',
    website: 'https://lacteosandinos.pe',
    companySize: '150-300',
    source: 'SUNAT',
  },
  {
    name: 'Almacenes Frigoríficos del Sur',
    company: 'Frigoríficos del Sur',
    email: 'operaciones@frigosurmx.com',
    phone: '+52 999 678 9012',
    industry: 'cold_storage',
    location: 'Mérida, Yucatán, México',
    website: 'https://frigosurmx.com',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
]

// Filter leads based on criteria
function filterLeads(
  leads: RawLeadData[],
  industries?: string[],
  regions?: string[]
): RawLeadData[] {
  return leads.filter((lead) => {
    // Filter by industry
    if (industries && industries.length > 0) {
      const matchesIndustry = industries.some(
        (ind) => lead.industry?.toLowerCase().includes(ind.toLowerCase())
      )
      if (!matchesIndustry) return false
    }

    // Filter by region
    if (regions && regions.length > 0) {
      const matchesRegion = regions.some((region) => {
        const regionData = TARGET_REGIONS.find((r) => r.id === region)
        if (!regionData) return false

        // Check if location matches any country in the region
        return regionData.countries.some(
          (country) =>
            lead.location?.includes('México') && country === 'MX' ||
            lead.location?.includes('Colombia') && country === 'CO' ||
            lead.location?.includes('Perú') && country === 'PE' ||
            lead.location?.includes('Peru') && country === 'PE' ||
            lead.location?.includes('Chile') && country === 'CL' ||
            lead.location?.includes('Argentina') && country === 'AR'
        )
      })
      if (!matchesRegion) return false
    }

    return true
  })
}

// Search leads from SIEM (real scraping or fallback to mock)
async function searchSIEM(input: SearchLeadsInput): Promise<RawLeadData[]> {
  // Use real scraping if enabled
  if (isScrapingEnabled()) {
    try {
      const leads = await searchSIEMService({
        industries: input.industries,
        limit: input.limit || 10,
      })

      if (leads.length > 0) {
        console.log(`[SIEM Scraping] Found ${leads.length} leads`)
        return leads
      }
    } catch (error) {
      console.error('[SIEM Scraping] Error:', error)
      // Fall through to mock data
    }
  }

  // Fallback to mock data if scraping failed
  console.log('[SIEM] Using mock data (scraping returned no results)')
  const allLeads = MOCK_COMPANIES.filter((c) => c.source === 'SIEM')
  return filterLeads(allLeads, input.industries, input.regions).slice(0, input.limit || 10)
}

// Search leads from CANACINTRA (real scraping or fallback to mock)
async function searchCANACINTRA(input: SearchLeadsInput): Promise<RawLeadData[]> {
  // Use real scraping if enabled
  if (isScrapingEnabled()) {
    try {
      const leads = await searchCANACINTRAService({
        industries: input.industries,
        limit: input.limit || 10,
      })

      if (leads.length > 0) {
        console.log(`[CANACINTRA Scraping] Found ${leads.length} leads`)
        return leads
      }
    } catch (error) {
      console.error('[CANACINTRA Scraping] Error:', error)
      // Fall through to mock data
    }
  }

  // Fallback to mock data if scraping failed
  console.log('[CANACINTRA] Using mock data (scraping returned no results)')
  const allLeads = MOCK_COMPANIES.filter((c) => c.source === 'CANACINTRA')
  return filterLeads(allLeads, input.industries, input.regions).slice(0, input.limit || 10)
}

// Search leads from Google Maps (real API or fallback to mock)
async function searchGoogleMaps(input: SearchLeadsInput): Promise<RawLeadData[]> {
  // Use real Google Maps API if configured
  if (isGoogleMapsConfigured()) {
    try {
      const leads = await searchGoogleMapsLeads({
        industries: input.industries,
        regions: input.regions,
        limit: input.limit || 10,
        includeDetails: true,
      })

      if (leads.length > 0) {
        console.log(`[Google Maps API] Found ${leads.length} leads`)
        return leads
      }
    } catch (error) {
      console.error('[Google Maps API] Error:', error)
      // Fall through to mock data
    }
  }

  // Fallback to mock data if API not configured or failed
  console.log('[Google Maps] Using mock data (API not configured)')
  const allLeads = MOCK_COMPANIES.filter((c) => c.source === 'Google Maps')
  return filterLeads(allLeads, input.industries, input.regions).slice(0, input.limit || 10)
}

// Search leads from all sources
export async function searchLeads(input: SearchLeadsInput): Promise<SearchLeadsOutput> {
  const source = input.source || 'all'
  let leads: RawLeadData[] = []

  switch (source.toLowerCase()) {
    case 'siem':
      leads = await searchSIEM(input)
      break
    case 'canacintra':
      leads = await searchCANACINTRA(input)
      break
    case 'google_maps':
    case 'googlemaps':
      leads = await searchGoogleMaps(input)
      break
    case 'all':
    default:
      // Search all sources
      const siemLeads = await searchSIEM(input)
      const canacintraLeads = await searchCANACINTRA(input)
      const gmapsLeads = await searchGoogleMaps(input)
      leads = [...siemLeads, ...canacintraLeads, ...gmapsLeads]
      break
  }

  // Apply limit
  if (input.limit && leads.length > input.limit) {
    leads = leads.slice(0, input.limit)
  }

  return {
    leads,
    source,
    totalFound: leads.length,
  }
}

// Create LangChain tool for search
export const createSearchLeadsTool = () => {
  return new DynamicStructuredTool({
    name: 'search_leads',
    description:
      'Search for potential business leads from various sources (SIEM, CANACINTRA, Google Maps). Use this to find companies in target industries.',
    schema: z.object({
      query: z.string().describe('Search query or keywords'),
      industries: z
        .array(z.string())
        .optional()
        .describe(
          'List of target industries: food_processing, cold_storage, dairy, meat, beverages, pharmaceuticals, ice_plants'
        ),
      regions: z
        .array(z.string())
        .optional()
        .describe('List of target regions: mexico, central_america, south_america'),
      limit: z.number().optional().describe('Maximum number of leads to return (default: 10)'),
      source: z
        .string()
        .optional()
        .describe('Specific source to search: siem, canacintra, google_maps, or all'),
    }),
    func: async (input) => {
      const result = await searchLeads(input)
      return JSON.stringify(result, null, 2)
    },
  })
}

// Get available industries for UI
export function getAvailableIndustries() {
  return TARGET_INDUSTRIES
}

// Get available regions for UI
export function getAvailableRegions() {
  return TARGET_REGIONS
}
