/**
 * Apollo.io API Service
 * Docs: https://apolloio.github.io/apollo-api-docs/
 *
 * Provides company and contact enrichment capabilities for lead prospection.
 * Replaces LinkedIn scraping with official Apollo.io API.
 *
 * Plan Limitations (as of 2024):
 * - Free plan: Organization enrichment only
 * - Basic ($49/mo): + People search, 500 credits
 * - Professional ($99/mo): + More credits, bulk operations
 */

import {
  ApolloOrganization,
  ApolloPerson,
  ApolloSearchResponse,
  ApolloEnrichmentResult,
  LINKEDIN_TARGET_TITLES,
} from '@/types/agents'

const APOLLO_BASE_URL = 'https://api.apollo.io/v1'

// Rate limiting configuration
const RATE_LIMIT_DELAY_MS = 1000 // 1 second between requests
let lastRequestTime = 0

// Cache for organization profiles to reduce API calls
const organizationCache = new Map<string, { data: ApolloOrganization | null; timestamp: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

// Track API capabilities (some endpoints require paid plans)
let peopleSearchAvailable: boolean | null = null // null = unknown, will be detected on first call

/**
 * Check if Apollo.io API is configured
 */
export function isApolloConfigured(): boolean {
  return !!process.env.APOLLO_API_KEY
}

/**
 * Get the Apollo API key
 */
function getApiKey(): string | null {
  return process.env.APOLLO_API_KEY || null
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Apply rate limiting before making API calls
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    await sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest)
  }
  lastRequestTime = Date.now()
}

/**
 * API error response structure
 */
interface ApolloErrorResponse {
  error?: string
  error_code?: string
}

/**
 * Result of an API call with error tracking
 */
interface ApiFetchResult<T> {
  data: T | null
  error?: string
  errorCode?: string
  requiresUpgrade?: boolean
}

/**
 * Make an authenticated request to Apollo.io API
 */
async function apolloFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST'
    body?: Record<string, unknown>
  } = {}
): Promise<ApiFetchResult<T>> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[Apollo] API key not configured')
    return { data: null, error: 'API key not configured' }
  }

  await applyRateLimit()

  const { method = 'POST', body } = options

  try {
    const response = await fetch(`${APOLLO_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: ApolloErrorResponse = {}

      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Not JSON, use raw text
      }

      // Handle specific error codes
      if (response.status === 401) {
        console.error('[Apollo] Invalid API key')
        return { data: null, error: 'Invalid API key', errorCode: 'INVALID_KEY' }
      } else if (response.status === 429) {
        console.error('[Apollo] Rate limit exceeded')
        return { data: null, error: 'Rate limit exceeded', errorCode: 'RATE_LIMITED' }
      } else if (response.status === 403 && errorData.error_code === 'API_INACCESSIBLE') {
        // This endpoint requires a paid plan
        console.warn(`[Apollo] Endpoint ${endpoint} requires paid plan`)
        return {
          data: null,
          error: errorData.error || 'Requires paid plan',
          errorCode: 'REQUIRES_UPGRADE',
          requiresUpgrade: true
        }
      }

      console.error(`[Apollo] API error ${response.status}: ${errorText}`)
      return { data: null, error: errorData.error || errorText, errorCode: errorData.error_code }
    }

    const data = await response.json()
    return { data: data as T }
  } catch (error) {
    console.error(`[Apollo] Request failed for ${endpoint}:`, error)
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Extract domain from URL or company name
 */
function extractDomain(input: string): string | undefined {
  try {
    // If it looks like a URL or domain
    if (input.includes('.')) {
      const url = input.startsWith('http') ? input : `https://${input}`
      return new URL(url).hostname.replace('www.', '')
    }
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Guess possible domain names for a company
 * Useful for Mexican/LATAM companies that may not have obvious domains
 */
function guessCompanyDomains(companyName: string): string[] {
  const domains: string[] = []

  // Normalize the company name
  const normalized = companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()

  // Extract main words (skip common suffixes)
  const skipWords = ['sa', 'de', 'cv', 'srl', 'grupo', 'industrias', 'alimentos', 'inc', 'corp', 'llc']
  const words = normalized.split(/\s+/).filter(w => w.length > 2 && !skipWords.includes(w))

  if (words.length === 0) return domains

  // Try common domain patterns
  const baseName = words[0]
  const fullName = words.join('')

  // Mexican companies
  domains.push(`${baseName}.com.mx`)
  domains.push(`${fullName}.com.mx`)
  domains.push(`grupo${baseName}.com.mx`)

  // International
  domains.push(`${baseName}.com`)
  domains.push(`${fullName}.com`)
  domains.push(`grupo${baseName}.com`)

  // Known mappings for common Mexican companies
  const knownDomains: Record<string, string> = {
    'lala': 'grupolala.com',
    'sigma': 'sigma-alimentos.com',
    'bimbo': 'grupobimbo.com',
    'modelo': 'gmodelo.com.mx',
    'femsa': 'femsa.com',
    'alpura': 'alpura.com',
    'bachoco': 'bachoco.com.mx',
    'sukarne': 'sukarne.com',
    'gruma': 'gruma.com',
    'herdez': 'grupoherdez.com.mx',
  }

  if (knownDomains[baseName]) {
    domains.unshift(knownDomains[baseName]) // Add known domain first
  }

  // Remove duplicates
  return Array.from(new Set(domains))
}

/**
 * Categorize company size based on employee count
 */
function categorizeCompanySize(employees: number | null): string {
  if (!employees) return 'unknown'
  if (employees < 10) return '1-10'
  if (employees < 50) return '11-50'
  if (employees < 200) return '51-200'
  if (employees < 500) return '201-500'
  if (employees < 1000) return '501-1000'
  return '1000+'
}

/**
 * Enrich an organization by domain
 * This endpoint is available on the free plan
 */
export async function enrichOrganization(domain: string): Promise<ApolloOrganization | null> {
  if (!isApolloConfigured()) {
    console.log('[Apollo] Not configured, skipping organization enrichment')
    return null
  }

  // Check cache first
  const cacheKey = domain.toLowerCase()
  const cached = organizationCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[Apollo] Using cached organization data for: ${domain}`)
    return cached.data
  }

  console.log(`[Apollo] Enriching organization: ${domain}`)

  interface OrganizationEnrichResponse {
    organization?: ApolloOrganization
  }

  const result = await apolloFetch<OrganizationEnrichResponse>('/organizations/enrich', {
    body: { domain },
  })

  const organization = result.data?.organization || null

  // Cache the result
  organizationCache.set(cacheKey, { data: organization, timestamp: Date.now() })

  if (organization) {
    console.log(`[Apollo] Found organization: ${organization.name}`)
  }

  return organization
}

/**
 * Enrich a person by email
 * Note: May require paid plan depending on endpoint
 */
export async function enrichPerson(email: string): Promise<ApolloPerson | null> {
  if (!isApolloConfigured()) {
    console.log('[Apollo] Not configured, skipping person enrichment')
    return null
  }

  console.log(`[Apollo] Enriching person by email: ${email}`)

  interface PersonMatchResponse {
    person?: ApolloPerson
  }

  const result = await apolloFetch<PersonMatchResponse>('/people/match', {
    body: { email },
  })

  if (result.requiresUpgrade) {
    console.log('[Apollo] Person enrichment requires paid plan')
    return null
  }

  return result.data?.person || null
}

/**
 * Search for people at a company with optional title filtering
 *
 * Note: People search requires a paid Apollo.io plan.
 * On free plan, this will still return company data via organization enrichment.
 */
export async function searchPeopleByCompany(
  companyName: string,
  options: {
    titles?: string[]
    limit?: number
    emailStatus?: ('verified' | 'guessed')[]
    domain?: string
  } = {}
): Promise<ApolloEnrichmentResult> {
  if (!isApolloConfigured()) {
    console.log('[Apollo] Not configured, returning empty result')
    return { company: null, contacts: [], totalFound: 0 }
  }

  const {
    titles = [],
    limit = 10,
    emailStatus = ['verified', 'guessed'],
    domain,
  } = options

  console.log(`[Apollo] Searching company: ${companyName}`)

  // First, try to enrich the organization if we have a domain
  // This works on free plan
  let organization: ApolloOrganization | null = null
  const extractedDomain = domain || extractDomain(companyName)

  if (extractedDomain) {
    organization = await enrichOrganization(extractedDomain)
  }

  // If no domain provided, try to find organization by name using the enrichment endpoint
  // with a guessed domain (common patterns for Mexican companies)
  if (!organization && !extractedDomain) {
    const guessedDomains = guessCompanyDomains(companyName)
    for (const guessedDomain of guessedDomains) {
      organization = await enrichOrganization(guessedDomain)
      if (organization) {
        console.log(`[Apollo] Found organization via guessed domain: ${guessedDomain}`)
        break
      }
    }
  }

  // If people search is known to be unavailable (free plan), skip it
  if (peopleSearchAvailable === false) {
    console.log('[Apollo] People search not available on current plan, using org data only')
    return { company: organization, contacts: [], totalFound: 0 }
  }

  // Search for people (requires paid plan)
  const searchBody: Record<string, unknown> = {
    q_organization_name: companyName,
    per_page: limit,
    contact_email_status: emailStatus,
  }

  // Add title filtering if specified
  if (titles.length > 0) {
    searchBody.person_titles = titles
  }

  // If we found the organization, use its ID for more accurate results
  if (organization?.id) {
    searchBody.organization_ids = [organization.id]
  }

  const result = await apolloFetch<ApolloSearchResponse>('/mixed_people/search', {
    body: searchBody,
  })

  // Handle plan limitation - mark people search as unavailable for future calls
  if (result.requiresUpgrade) {
    peopleSearchAvailable = false
    console.log('[Apollo] People search requires paid plan - will use org enrichment only')
    console.log('[Apollo] Upgrade at: https://app.apollo.io/settings/plans')
    return { company: organization, contacts: [], totalFound: 0 }
  }

  // People search is available
  if (peopleSearchAvailable === null) {
    peopleSearchAvailable = true
  }

  if (!result.data) {
    console.log(`[Apollo] No results for company: ${companyName}`)
    return { company: organization, contacts: [], totalFound: 0 }
  }

  // Use organization from search results if we didn't find one earlier
  if (!organization && result.data.organizations?.length > 0) {
    organization = result.data.organizations[0]
  }

  const contacts = result.data.people || []
  const totalFound = result.data.pagination?.total_entries || contacts.length

  console.log(`[Apollo] Found ${contacts.length} contacts (${totalFound} total) at ${companyName}`)

  return {
    company: organization,
    contacts,
    totalFound,
  }
}

/**
 * Search for companies by industry and location
 * Note: This may require a paid plan
 */
export async function searchOrganizations(
  options: {
    industry?: string
    location?: string
    employeeRange?: [number, number]
    limit?: number
  } = {}
): Promise<ApolloOrganization[]> {
  if (!isApolloConfigured()) {
    return []
  }

  const { industry, location, employeeRange, limit = 25 } = options

  console.log(`[Apollo] Searching organizations`, { industry, location })

  const searchBody: Record<string, unknown> = {
    per_page: limit,
  }

  if (industry) {
    searchBody.organization_industry_tag_ids = [industry]
  }

  if (location) {
    searchBody.organization_locations = [location]
  }

  if (employeeRange) {
    searchBody.organization_num_employees_ranges = [`${employeeRange[0]},${employeeRange[1]}`]
  }

  interface OrganizationSearchResponse {
    organizations: ApolloOrganization[]
    pagination: {
      total_entries: number
    }
  }

  const result = await apolloFetch<OrganizationSearchResponse>('/mixed_companies/search', {
    body: searchBody,
  })

  if (result.requiresUpgrade) {
    console.log('[Apollo] Organization search requires paid plan')
    return []
  }

  return result.data?.organizations || []
}

/**
 * Batch search for contacts at multiple companies
 */
export async function batchSearchContacts(
  companyNames: string[],
  options: {
    titles?: string[]
    limit?: number
    maxCompanies?: number
  } = {}
): Promise<Map<string, ApolloEnrichmentResult>> {
  const { titles = [...LINKEDIN_TARGET_TITLES], maxCompanies = 10 } = options
  const results = new Map<string, ApolloEnrichmentResult>()

  const companiesToSearch = companyNames.slice(0, maxCompanies)

  console.log(`[Apollo] Batch searching ${companiesToSearch.length} companies`)

  for (const companyName of companiesToSearch) {
    const result = await searchPeopleByCompany(companyName, {
      titles,
      limit: options.limit || 5,
    })
    results.set(companyName, result)
  }

  return results
}

/**
 * Get the company size category from Apollo organization
 */
export function getCompanySizeCategory(org: ApolloOrganization | null): string {
  return categorizeCompanySize(org?.estimated_num_employees ?? null)
}

/**
 * Check if people search is available (requires paid plan)
 * Returns: true = available, false = not available, null = unknown (not tested yet)
 */
export function isPeopleSearchAvailable(): boolean | null {
  return peopleSearchAvailable
}

/**
 * Get the current plan capabilities based on API responses
 */
export function getPlanCapabilities(): {
  configured: boolean
  organizationEnrichment: boolean
  peopleSearch: boolean | null
} {
  return {
    configured: isApolloConfigured(),
    organizationEnrichment: isApolloConfigured(), // Always available when configured
    peopleSearch: peopleSearchAvailable,
  }
}

/**
 * Reset the plan capability detection (useful for testing after plan upgrade)
 */
export function resetPlanDetection(): void {
  peopleSearchAvailable = null
  console.log('[Apollo] Plan capability detection reset')
}

/**
 * Clear the organization cache
 */
export function clearCache(): void {
  organizationCache.clear()
  console.log('[Apollo] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: organizationCache.size,
    entries: Array.from(organizationCache.keys()),
  }
}
