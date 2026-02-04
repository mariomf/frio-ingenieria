import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import {
  SearchLinkedInInput,
  SearchLinkedInOutput,
  LINKEDIN_TARGET_TITLES,
} from '@/types/agents'
import {
  searchLinkedIn as searchLinkedInService,
  isLinkedInConfigured,
} from '@/lib/services/linkedinService'

/**
 * Search LinkedIn for a company and its key employees
 * This function wraps the LinkedIn service for direct use
 */
export async function searchLinkedIn(input: SearchLinkedInInput): Promise<SearchLinkedInOutput> {
  if (!isLinkedInConfigured()) {
    console.log('[search-linkedin] LinkedIn not configured, returning empty result')
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'linkedin',
    }
  }

  const { companyName, titles, location, limit, getEmployees } = input

  console.log(`[search-linkedin] Searching LinkedIn for: ${companyName}`)

  try {
    const result = await searchLinkedInService(companyName, {
      titles: titles || [...LINKEDIN_TARGET_TITLES],
      location,
      limit: limit || 5,
      getEmployees: getEmployees ?? true,
    })

    console.log(
      `[search-linkedin] Found company: ${result.company?.name || 'N/A'}, employees: ${result.employees.length}`
    )

    return result
  } catch (error) {
    console.error(`[search-linkedin] Error searching LinkedIn for ${companyName}:`, error)
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'linkedin',
    }
  }
}

/**
 * Create the LangChain tool for LinkedIn search
 * Used by the ProspectorAgent to enrich leads with LinkedIn data
 */
export const createSearchLinkedInTool = () => {
  return new DynamicStructuredTool({
    name: 'search_linkedin',
    description: `Search LinkedIn for a company profile and its key employees. Use this to enrich leads with LinkedIn data and find decision-makers in maintenance, purchasing, and operations roles.

Target job titles include: ${LINKEDIN_TARGET_TITLES.slice(0, 7).join(', ')}.

This tool requires the linkedin-mcp-server to be configured with a valid session cookie.`,
    schema: z.object({
      companyName: z.string().describe('Name of the company to search on LinkedIn'),
      titles: z
        .array(z.string())
        .optional()
        .describe(
          'Job titles to filter employees by (e.g., ["Gerente de Mantenimiento", "Jefe de Compras"])'
        ),
      location: z
        .string()
        .optional()
        .describe('Location to filter results (e.g., "México", "Monterrey")'),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of employee profiles to return (default: 5)'),
      getEmployees: z
        .boolean()
        .optional()
        .describe('Whether to fetch employee profiles (default: true)'),
    }),
    func: async (input) => {
      const result = await searchLinkedIn(input)
      return JSON.stringify(result, null, 2)
    },
  })
}

/**
 * Check if LinkedIn search is available
 */
export function isLinkedInSearchAvailable(): boolean {
  return isLinkedInConfigured()
}

/**
 * Get the default target job titles for LinkedIn search
 */
export function getDefaultLinkedInTitles(): readonly string[] {
  return LINKEDIN_TARGET_TITLES
}
