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
 * Search Apollo.io for a company and its key employees
 * This function wraps the Apollo service for direct use
 */
export async function searchApollo(input: SearchApolloInput): Promise<SearchApolloOutput> {
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
    // If getEmployees is false, only fetch company data
    if (getEmployees === false) {
      const result = await searchPeopleByCompany(companyName, {
        titles: titles || [...LINKEDIN_TARGET_TITLES],
        limit: 0,
      })

      return {
        company: result.company
          ? {
              name: result.company.name,
              linkedinUrl: result.company.linkedin_url || '',
              industry: result.company.industry || undefined,
              size: getCompanySizeCategory(result.company),
              website: result.company.website_url || undefined,
              headquarters: result.company.city && result.company.country
                ? `${result.company.city}, ${result.company.country}`
                : undefined,
            }
          : null,
        employees: [],
        totalFound: 0,
        source: 'apollo',
      }
    }

    const apolloResult = await searchPeopleByCompany(companyName, {
      titles: titles || [...LINKEDIN_TARGET_TITLES],
      limit: limit || 5,
      emailStatus: ['verified', 'guessed'],
    })

    const result = mapApolloToLinkedInTypes(apolloResult)

    console.log(
      `[search-apollo] Found company: ${result.company?.name || 'N/A'}, contacts: ${result.employees.length}`
    )

    return result
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
Returns company details and contacts filtered by job titles, with verified emails when available.

Target job titles include: ${LINKEDIN_TARGET_TITLES.slice(0, 7).join(', ')}.

Use this to:
- Find decision-makers at target companies
- Get verified emails for outreach
- Enrich leads with company data (industry, size, website)`,
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
