/**
 * Apollo.io API Service
 * Docs: https://apolloio.github.io/apollo-api-docs/
 *
 * Provides company and contact enrichment capabilities for lead prospection.
 * Replaces LinkedIn scraping with official Apollo.io API.
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
 * Make an authenticated request to Apollo.io API
 */
async function apolloFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST'
    body?: Record<string, unknown>
  } = {}
): Promise<T | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[Apollo] API key not configured')
    return null
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
      console.error(`[Apollo] API error ${response.status}: ${errorText}`)

      // Handle specific error codes
      if (response.status === 401) {
        console.error('[Apollo] Invalid API key')
      } else if (response.status === 429) {
        console.error('[Apollo] Rate limit exceeded')
      }

      return null
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`[Apollo] Request failed for ${endpoint}:`, error)
    return null
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

  const response = await apolloFetch<OrganizationEnrichResponse>('/organizations/enrich', {
    body: { domain },
  })

  const organization = response?.organization || null

  // Cache the result
  organizationCache.set(cacheKey, { data: organization, timestamp: Date.now() })

  if (organization) {
    console.log(`[Apollo] Found organization: ${organization.name}`)
  }

  return organization
}

/**
 * Enrich a person by email
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

  const response = await apolloFetch<PersonMatchResponse>('/people/match', {
    body: { email },
  })

  return response?.person || null
}

/**
 * Search for people at a company with optional title filtering
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

  console.log(`[Apollo] Searching people at company: ${companyName}`)

  // First, try to enrich the organization if we have a domain
  let organization: ApolloOrganization | null = null
  const extractedDomain = domain || extractDomain(companyName)

  if (extractedDomain) {
    organization = await enrichOrganization(extractedDomain)
  }

  // Search for people
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

  const response = await apolloFetch<ApolloSearchResponse>('/mixed_people/search', {
    body: searchBody,
  })

  if (!response) {
    console.log(`[Apollo] No results for company: ${companyName}`)
    return { company: organization, contacts: [], totalFound: 0 }
  }

  // Use organization from search results if we didn't find one earlier
  if (!organization && response.organizations?.length > 0) {
    organization = response.organizations[0]
  }

  const contacts = response.people || []
  const totalFound = response.pagination?.total_entries || contacts.length

  console.log(`[Apollo] Found ${contacts.length} contacts (${totalFound} total) at ${companyName}`)

  return {
    company: organization,
    contacts,
    totalFound,
  }
}

/**
 * Search for companies by industry and location
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

  const response = await apolloFetch<OrganizationSearchResponse>('/mixed_companies/search', {
    body: searchBody,
  })

  return response?.organizations || []
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
