/**
 * Google Maps Places API Service
 *
 * Searches for businesses using Google Places API (Text Search)
 * Useful for finding potential leads in target industries
 */

import { RawLeadData } from '@/types/agents'

// Industry search terms mapping
const INDUSTRY_SEARCH_TERMS: Record<string, string[]> = {
  food_processing: [
    'procesadora de alimentos',
    'empacadora de alimentos',
    'planta de alimentos congelados',
    'conservas industriales',
    'empacadora de frutas y verduras',
  ],
  cold_storage: [
    'almacén frigorífico industrial',
    'cuarto frío industrial',
    'bodega refrigerada',
    'almacenamiento en frío',
    'cadena de frío logística',
  ],
  dairy: [
    'procesadora de lácteos',
    'pasteurizadora de leche',
    'quesería industrial',
    'cremería industrial',
    'planta láctea',
  ],
  meat: [
    'empacadora de carnes',
    'rastro TIF',
    'frigorífico de cárnicos',
    'procesadora de aves',
    'empacadora de embutidos',
  ],
  beverages: [
    'embotelladora de refrescos',
    'cervecería industrial',
    'planta embotelladora',
    'jugos industriales',
    'refresquera',
  ],
  pharmaceuticals: [
    'laboratorio farmacéutico',
    'industria farmacéutica',
    'laboratorio biológico',
    'manufactura farmacéutica',
    'biotecnología farmacéutica',
  ],
  ice_plants: [
    'fábrica de hielo industrial',
    'planta de hielo',
    'hielera industrial',
    'hielo en bloque industrial',
    'producción de hielo',
  ],
  supermarkets: [
    'cadena de supermercados',
    'autoservicio regional',
    'distribuidora de alimentos',
  ],
}

// City coordinates for regional searches
const REGION_LOCATIONS: Record<string, { lat: number; lng: number; radius: number }[]> = {
  mexico: [
    { lat: 19.4326, lng: -99.1332, radius: 40000 }, // CDMX
    { lat: 25.6866, lng: -100.3161, radius: 40000 }, // Monterrey
    { lat: 20.6597, lng: -103.3496, radius: 40000 }, // Guadalajara
    { lat: 20.5881, lng: -100.3899, radius: 30000 }, // Querétaro
    { lat: 21.0190, lng: -101.2574, radius: 30000 }, // León
    { lat: 25.5428, lng: -103.4068, radius: 30000 }, // Torreón
    { lat: 29.0729, lng: -110.9559, radius: 30000 }, // Hermosillo
    { lat: 28.6353, lng: -106.0889, radius: 30000 }, // Chihuahua
    { lat: 19.0414, lng: -98.2063, radius: 30000 }, // Puebla
    { lat: 19.2826, lng: -99.6557, radius: 30000 }, // Toluca
    { lat: 32.5149, lng: -117.0382, radius: 25000 }, // Tijuana
    { lat: 20.9674, lng: -89.5926, radius: 25000 }, // Mérida
    { lat: 19.1738, lng: -96.1342, radius: 25000 }, // Veracruz
    { lat: 24.8091, lng: -107.3940, radius: 25000 }, // Culiacán
    { lat: 25.4232, lng: -101.0036, radius: 25000 }, // Saltillo
    { lat: 21.8853, lng: -102.2916, radius: 25000 }, // Aguascalientes
    { lat: 20.5239, lng: -100.8188, radius: 20000 }, // Celaya
    { lat: 20.6745, lng: -101.3557, radius: 20000 }, // Irapuato
  ],
  central_america: [
    { lat: 14.6349, lng: -90.5069, radius: 40000 }, // Guatemala City
    { lat: 13.6929, lng: -89.2182, radius: 30000 }, // San Salvador
    { lat: 14.0723, lng: -87.1921, radius: 30000 }, // Tegucigalpa
    { lat: 9.9281, lng: -84.0907, radius: 30000 }, // San José, CR
    { lat: 8.9824, lng: -79.5199, radius: 30000 }, // Panama City
  ],
  south_america: [
    { lat: 4.7110, lng: -74.0721, radius: 50000 }, // Bogotá
    { lat: -12.0464, lng: -77.0428, radius: 50000 }, // Lima
    { lat: -33.4489, lng: -70.6693, radius: 50000 }, // Santiago
    { lat: -34.6037, lng: -58.3816, radius: 50000 }, // Buenos Aires
    { lat: -0.1807, lng: -78.4678, radius: 40000 }, // Quito
  ],
  caribbean: [
    { lat: 18.4861, lng: -69.9312, radius: 30000 }, // Santo Domingo
    { lat: 18.4655, lng: -66.1057, radius: 30000 }, // San Juan, PR
  ],
}

interface GooglePlaceResult {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  types?: string[]
  business_status?: string
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface TextSearchResponse {
  results: GooglePlaceResult[]
  status: string
  next_page_token?: string
  error_message?: string
}

interface PlaceDetailsResponse {
  result: GooglePlaceResult
  status: string
  error_message?: string
}

/**
 * Search for places using Google Maps Text Search API
 */
async function textSearch(
  query: string,
  location?: { lat: number; lng: number },
  radius?: number
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not configured, returning empty results')
    return []
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
  const params = new URLSearchParams({
    query,
    key: apiKey,
    language: 'es',
  })

  if (location) {
    params.append('location', `${location.lat},${location.lng}`)
    params.append('radius', String(radius || 50000))
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`)
    const data: TextSearchResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data.status, data.error_message)
      return []
    }

    return data.results || []
  } catch (error) {
    console.error('Error fetching from Google Maps:', error)
    return []
  }
}

/**
 * Get place details including phone and website
 */
async function getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return null
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,types,business_status',
    language: 'es',
  })

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`)
    const data: PlaceDetailsResponse = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Maps Place Details error:', data.status, data.error_message)
      return null
    }

    return data.result
  } catch (error) {
    console.error('Error fetching place details:', error)
    return null
  }
}

/**
 * Convert Google Place result to RawLeadData format
 */
function placeToLeadData(place: GooglePlaceResult, industry: string): RawLeadData {
  // Extract company name (remove generic suffixes)
  const companyName = place.name
    .replace(/\s*(S\.?A\.?\s*de\s*C\.?V\.?|S\.?A\.?S\.?|S\.?A\.?|S\.?R\.?L\.?|LLC|Inc\.?)$/i, '')
    .trim()

  return {
    name: place.name,
    company: companyName,
    phone: place.international_phone_number || place.formatted_phone_number,
    location: place.formatted_address,
    website: place.website,
    industry,
    source: 'Google Maps',
    sourceUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    rawData: {
      place_id: place.place_id,
      types: place.types,
      business_status: place.business_status,
    },
  }
}

/**
 * Estimate company size based on place types
 */
function estimateCompanySize(place: GooglePlaceResult): string | undefined {
  const types = place.types || []

  // Larger companies tend to have more specific business types
  if (types.includes('point_of_interest') && types.includes('establishment')) {
    if (types.length > 5) return '100-500'
    if (types.length > 3) return '50-100'
    return '10-50'
  }

  return undefined
}

export interface GoogleMapsSearchOptions {
  industries?: string[]
  regions?: string[]
  limit?: number
  includeDetails?: boolean
}

/**
 * Main function to search for leads using Google Maps
 */
export async function searchGoogleMapsLeads(
  options: GoogleMapsSearchOptions
): Promise<RawLeadData[]> {
  const { industries = [], regions = ['mexico'], limit = 20, includeDetails = true } = options

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not configured. Set it in .env.local to enable Google Maps search.')
    return []
  }

  const leads: RawLeadData[] = []
  const seenPlaceIds = new Set<string>()

  // Get search terms for requested industries
  const searchTerms: { term: string; industry: string }[] = []

  for (const industry of industries.length > 0 ? industries : Object.keys(INDUSTRY_SEARCH_TERMS)) {
    const terms = INDUSTRY_SEARCH_TERMS[industry] || []
    for (const term of terms.slice(0, 3)) { // Up to 3 terms per industry
      searchTerms.push({ term, industry })
    }
  }

  // Get locations for requested regions
  const locations: { lat: number; lng: number; radius: number }[] = []
  for (const region of regions) {
    const regionLocs = REGION_LOCATIONS[region] || []
    locations.push(...regionLocs) // Use all cities in the region
  }

  // If no specific locations, search without location bias
  if (locations.length === 0) {
    locations.push({ lat: 19.4326, lng: -99.1332, radius: 50000 }) // Default to CDMX
  }

  // maxSearches is now dynamic based on how many leads we need
  const maxSearches = Math.min(searchTerms.length * locations.length, Math.ceil(limit * 1.5))
  let searchCount = 0

  for (const { term, industry } of searchTerms) {
    if (leads.length >= limit) break

    for (const location of locations) {
      if (leads.length >= limit) break

      const results = await textSearch(term, location, location.radius)
      searchCount++

      for (const place of results) {
        if (leads.length >= limit) break
        if (seenPlaceIds.has(place.place_id)) continue

        seenPlaceIds.add(place.place_id)

        // Get details if requested (adds phone/website)
        let detailedPlace = place
        if (includeDetails && !place.formatted_phone_number && !place.website) {
          const details = await getPlaceDetails(place.place_id)
          if (details) {
            detailedPlace = { ...place, ...details }
          }
        }

        const lead = placeToLeadData(detailedPlace, industry)
        lead.companySize = estimateCompanySize(detailedPlace)
        leads.push(lead)
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return leads
}

/**
 * Search for a specific type of business in a specific city
 */
export async function searchBusinessInCity(
  businessType: string,
  city: string,
  country: string = 'México',
  limit: number = 10
): Promise<RawLeadData[]> {
  const query = `${businessType} en ${city}, ${country}`
  const results = await textSearch(query)

  const leads: RawLeadData[] = []

  for (const place of results.slice(0, limit)) {
    const details = await getPlaceDetails(place.place_id)
    const detailedPlace = details ? { ...place, ...details } : place

    const lead = placeToLeadData(detailedPlace, 'general')
    lead.companySize = estimateCompanySize(detailedPlace)
    leads.push(lead)
  }

  return leads
}

/**
 * Check if Google Maps API is configured and enabled
 */
export function isGoogleMapsConfigured(): boolean {
  // Check if explicitly disabled
  if (process.env.DISABLE_GOOGLE_MAPS === 'true') {
    return false
  }
  return !!process.env.GOOGLE_MAPS_API_KEY
}
