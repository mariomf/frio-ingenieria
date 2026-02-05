import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import {
  SearchApolloInput,
  SearchApolloOutput,
  LinkedInCompany,
  LinkedInProfile,
  LINKEDIN_TARGET_TITLES,
} from '@/types/agents'
import {
  searchPeopleByCompany,
  isApolloConfigured,
  getCompanySizeCategory,
  getPlanCapabilities,
} from '@/lib/services/apolloService'

/**
 * Map Apollo.io response to existing LinkedIn types for compatibility
 * This allows the ProspectorAgent to use Apollo data without major refactoring
 */
function mapApolloToLinkedInTypes(
  apolloResult: Awaited<ReturnType<typeof searchPeopleByCompany>>
): SearchApolloOutput {
  const company: LinkedInCompany | null = apolloResult.company
    ? {
        name: apolloResult.company.name,
        linkedinUrl: apolloResult.company.linkedin_url || '',
        industry: apolloResult.company.industry || undefined,
        size: getCompanySizeCategory(apolloResult.company),
        website: apolloResult.company.website_url || undefined,
        description: undefined,
        headquarters: apolloResult.company.city && apolloResult.company.country
          ? `${apolloResult.company.city}, ${apolloResult.company.country}`
          : undefined,
      }
    : null

  const employees: LinkedInProfile[] = apolloResult.contacts.map((person) => ({
    name: person.name,
    title: person.title || '',
    linkedinUrl: person.linkedin_url || '',
    location: person.city && person.country
      ? `${person.city}, ${person.country}`
      : undefined,
    headline: person.title || undefined,
    // Include verified email in a compatible way
    ...(person.email_status === 'verified' && person.email
      ? { email: person.email }
      : {}),
  }))

  return {
    company,
    employees,
    totalFound: apolloResult.totalFound,
    source: 'apollo',
  }
}

/**
 * Extended output type with plan info
 */
interface SearchApolloExtendedOutput extends SearchApolloOutput {
  planInfo?: {
    peopleSearchAvailable: boolean
    message?: string
  }
}

/**
 * Search Apollo.io for a company and its key employees
 * This function wraps the Apollo service for direct use
 *
 * Note: On free plan, only company data is available.
 * Contact/people search requires a paid Apollo.io plan.
 */
export async function searchApollo(input: SearchApolloInput): Promise<SearchApolloExtendedOutput> {
  if (!isApolloConfigured()) {
    console.log('[search-apollo] Apollo.io not configured, returning empty result')
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'apollo',
    }
  }

  const { companyName, titles, limit, getEmployees } = input

  console.log(`[search-apollo] Searching Apollo.io for: ${companyName}`)

  try {
    const apolloResult = await searchPeopleByCompany(companyName, {
      titles: titles || [...LINKEDIN_TARGET_TITLES],
      limit: getEmployees === false ? 0 : (limit || 5),
      emailStatus: ['verified', 'guessed'],
    })

    const result = mapApolloToLinkedInTypes(apolloResult)

    // Check plan capabilities and add info
    const planCapabilities = getPlanCapabilities()
    const planInfo: SearchApolloExtendedOutput['planInfo'] = {
      peopleSearchAvailable: planCapabilities.peopleSearch === true,
    }

    // Add helpful message if people search is not available
    if (planCapabilities.peopleSearch === false && result.employees.length === 0) {
      planInfo.message = 'Contact search requires paid Apollo.io plan. Company data enrichment is available.'
    }

    console.log(
      `[search-apollo] Found company: ${result.company?.name || 'N/A'}, contacts: ${result.employees.length}`
    )

    return {
      ...result,
      planInfo,
    }
  } catch (error) {
    console.error(`[search-apollo] Error searching Apollo.io for ${companyName}:`, error)
    return {
      company: null,
      employees: [],
      totalFound: 0,
      source: 'apollo',
    }
  }
}

/**
 * Create the LangChain tool for Apollo.io search
 * Used by the ProspectorAgent to enrich leads with contact data
 */
export const createSearchApolloTool = () => {
  return new DynamicStructuredTool({
    name: 'search_apollo',
    description: `Search Apollo.io for company information and decision-makers.
Returns company details (industry, size, website, LinkedIn) and contacts filtered by job titles.

PLAN LIMITATIONS:
- Free plan: Company enrichment only (industry, size, website, headquarters)
- Paid plan: + Contact search with verified emails

Target job titles include: ${LINKEDIN_TARGET_TITLES.slice(0, 7).join(', ')}.

Use this to:
- Enrich leads with company data (always available)
- Find decision-makers at target companies (paid plan)
- Get verified emails for outreach (paid plan)`,
    schema: z.object({
      companyName: z.string().describe('Name of the company to search'),
      titles: z
        .array(z.string())
        .optional()
        .describe(
          'Job titles to filter contacts by (e.g., ["Gerente de Mantenimiento", "Jefe de Compras"])'
        ),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of contacts to return (default: 5)'),
      getEmployees: z
        .boolean()
        .optional()
        .describe('Whether to fetch employee contacts (default: true)'),
    }),
    func: async (input) => {
      const result = await searchApollo(input)
      return JSON.stringify(result, null, 2)
    },
  })
}

/**
 * Check if Apollo.io search is available
 */
export function isApolloSearchAvailable(): boolean {
  return isApolloConfigured()
}

/**
 * Get the default target job titles for Apollo search
 */
export function getDefaultApolloTitles(): readonly string[] {
  return LINKEDIN_TARGET_TITLES
}

export { isApolloConfigured }
