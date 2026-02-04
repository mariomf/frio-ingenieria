/**
 * LinkedIn Service - Wrapper for linkedin-mcp-server Docker MCP
 *
 * This service provides LinkedIn scraping capabilities using the Docker MCP toolkit.
 * Requires the linkedin-mcp-server to be configured with a valid li_at cookie.
 *
 * Configuration:
 * 1. docker mcp server enable linkedin-mcp-server
 * 2. docker mcp secret set linkedin-mcp-server.cookie=<your_li_at_cookie>
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import {
  LinkedInCompany,
  LinkedInProfile,
  SearchLinkedInOutput,
  LINKEDIN_TARGET_TITLES,
} from '@/types/agents'

const execAsync = promisify(exec)

// Rate limiting configuration
const RATE_LIMIT_DELAY_MS = 2500 // 2.5 seconds between requests
let lastRequestTime = 0

// Cache for company profiles to reduce API calls
const companyCache = new Map<string, { data: LinkedInCompany | null; timestamp: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Check if LinkedIn MCP is configured and available
 */
export function isLinkedInConfigured(): boolean {
  const enabled = process.env.LINKEDIN_ENABLED !== 'false'
  return enabled
}

/**
 * Execute a command via Docker MCP and parse JSON response
 */
async function executeMcpTool<T>(
  toolName: string,
  args: Record<string, unknown>
): Promise<T | null> {
  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    await sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest)
  }
  lastRequestTime = Date.now()

  try {
    // Build the docker mcp run command
    const argsJson = JSON.stringify(args)
    const command = `docker run --rm -i -e LINKEDIN_COOKIE="$LINKEDIN_COOKIE" stickerdaniel/linkedin-mcp-server:1.4.0 ${toolName} '${argsJson}'`

    // For now, we'll use a simpler approach with docker exec or direct API call
    // The MCP gateway should handle this, but we'll implement a fallback

    // Try using the mcp-exec approach via the MCP Docker gateway
    const mcpCommand = `docker mcp tools run linkedin-mcp-server ${toolName} --args '${argsJson}'`

    const { stdout, stderr } = await execAsync(mcpCommand, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 5 * 1024 * 1024, // 5MB buffer
    })

    if (stderr && !stderr.includes('Tip:')) {
      console.warn(`[LinkedIn MCP] Warning: ${stderr}`)
    }

    if (stdout) {
      try {
        return JSON.parse(stdout) as T
      } catch {
        // Try to extract JSON from the output
        const jsonMatch = stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as T
        }
        console.log(`[LinkedIn MCP] Raw response: ${stdout}`)
        return null
      }
    }

    return null
  } catch (error) {
    console.error(`[LinkedIn MCP] Error executing ${toolName}:`, error)
    return null
  }
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Interface for company profile response from LinkedIn MCP
 */
interface LinkedInCompanyResponse {
  name?: string
  company_name?: string
  url?: string
  linkedin_url?: string
  industry?: string
  company_size?: string
  size?: string
  website?: string
  description?: string
  headquarters?: string
  employees?: Array<{
    name?: string
    title?: string
    headline?: string
    url?: string
    linkedin_url?: string
    location?: string
  }>
}

/**
 * Search for a company on LinkedIn
 */
export async function searchCompany(
  companyName: string,
  getEmployees: boolean = false
): Promise<{ company: LinkedInCompany | null; employees: LinkedInProfile[] }> {
  if (!isLinkedInConfigured()) {
    console.log('[LinkedIn] Service not configured, skipping')
    return { company: null, employees: [] }
  }

  // Check cache first
  const cacheKey = `${companyName.toLowerCase()}_${getEmployees}`
  const cached = companyCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[LinkedIn] Using cached data for: ${companyName}`)
    return { company: cached.data, employees: [] }
  }

  console.log(`[LinkedIn] Searching company: ${companyName}`)

  try {
    const response = await executeMcpTool<LinkedInCompanyResponse>('get_company_profile', {
      company_name: companyName,
      get_employees: getEmployees,
    })

    if (!response) {
      console.log(`[LinkedIn] No response for company: ${companyName}`)
      return { company: null, employees: [] }
    }

    const company: LinkedInCompany = {
      name: response.name || response.company_name || companyName,
      linkedinUrl: response.url || response.linkedin_url || '',
      industry: response.industry,
      size: response.company_size || response.size,
      website: response.website,
      description: response.description,
      headquarters: response.headquarters,
    }

    // Cache the result
    companyCache.set(cacheKey, { data: company, timestamp: Date.now() })

    // Parse employees if available
    const employees: LinkedInProfile[] = []
    if (response.employees && Array.isArray(response.employees)) {
      for (const emp of response.employees) {
        if (emp.name) {
          employees.push({
            name: emp.name,
            title: emp.title || emp.headline || '',
            linkedinUrl: emp.url || emp.linkedin_url || '',
            location: emp.location,
            headline: emp.headline,
          })
        }
      }
    }

    console.log(`[LinkedIn] Found company: ${company.name}, employees: ${employees.length}`)
    return { company, employees }
  } catch (error) {
    console.error(`[LinkedIn] Error searching company ${companyName}:`, error)
    return { company: null, employees: [] }
  }
}

/**
 * Interface for person profile response from LinkedIn MCP
 */
interface LinkedInPersonResponse {
  name?: string
  full_name?: string
  headline?: string
  title?: string
  current_company?: string
  location?: string
  url?: string
  linkedin_url?: string
  profile_url?: string
}

/**
 * Get a LinkedIn profile by username
 */
export async function getProfile(linkedinUsername: string): Promise<LinkedInProfile | null> {
  if (!isLinkedInConfigured()) {
    return null
  }

  console.log(`[LinkedIn] Getting profile: ${linkedinUsername}`)

  try {
    const response = await executeMcpTool<LinkedInPersonResponse>('get_person_profile', {
      linkedin_username: linkedinUsername,
    })

    if (!response) {
      return null
    }

    return {
      name: response.name || response.full_name || linkedinUsername,
      title: response.title || response.headline || '',
      linkedinUrl: response.url || response.linkedin_url || response.profile_url || `https://www.linkedin.com/in/${linkedinUsername}`,
      location: response.location,
      headline: response.headline,
    }
  } catch (error) {
    console.error(`[LinkedIn] Error getting profile ${linkedinUsername}:`, error)
    return null
  }
}

/**
 * Filter employees by target job titles relevant to refrigeration industry
 */
export function filterRelevantEmployees(
  employees: LinkedInProfile[],
  customTitles?: string[]
): LinkedInProfile[] {
  const targetTitles = customTitles || [...LINKEDIN_TARGET_TITLES]
  const lowerTitles = targetTitles.map(t => t.toLowerCase())

  return employees.filter(emp => {
    const empTitle = (emp.title || emp.headline || '').toLowerCase()
    return lowerTitles.some(title => empTitle.includes(title.toLowerCase()))
  })
}

/**
 * Search for a company and its key employees on LinkedIn
 * This is the main function used by the ProspectorAgent
 */
export async function searchLinkedIn(
  companyName: string,
  options: {
    titles?: string[]
    location?: string
    limit?: number
    getEmployees?: boolean
  } = {}
): Promise<SearchLinkedInOutput> {
  const { titles, limit = 10, getEmployees = true } = options

  if (!isLinkedInConfigured()) {
    console.log('[LinkedIn] Service not configured')
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'linkedin',
    }
  }

  try {
    // Search for the company profile
    const { company, employees: allEmployees } = await searchCompany(companyName, getEmployees)

    // Filter employees by relevant titles
    let relevantEmployees = filterRelevantEmployees(allEmployees, titles)

    // Apply limit
    if (limit && relevantEmployees.length > limit) {
      relevantEmployees = relevantEmployees.slice(0, limit)
    }

    return {
      company,
      employees: relevantEmployees,
      totalFound: relevantEmployees.length,
      source: 'linkedin',
    }
  } catch (error) {
    console.error(`[LinkedIn] Error in searchLinkedIn for ${companyName}:`, error)
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'linkedin',
    }
  }
}

/**
 * Batch search multiple companies on LinkedIn with rate limiting
 */
export async function batchSearchLinkedIn(
  companyNames: string[],
  options: {
    titles?: string[]
    limit?: number
    maxCompanies?: number
  } = {}
): Promise<Map<string, SearchLinkedInOutput>> {
  const { maxCompanies = 10 } = options
  const results = new Map<string, SearchLinkedInOutput>()

  // Limit the number of companies to search
  const companiesToSearch = companyNames.slice(0, maxCompanies)

  console.log(`[LinkedIn] Batch searching ${companiesToSearch.length} companies`)

  for (const companyName of companiesToSearch) {
    const result = await searchLinkedIn(companyName, options)
    results.set(companyName, result)

    // Rate limiting is handled internally by executeMcpTool
  }

  return results
}

/**
 * Clear the company cache
 */
export function clearCache(): void {
  companyCache.clear()
  console.log('[LinkedIn] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: companyCache.size,
    entries: Array.from(companyCache.keys()),
  }
}
