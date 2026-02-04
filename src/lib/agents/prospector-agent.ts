import { BaseAgent, createEmptyResults } from './base-agent'
import { searchLeads } from './tools/search-leads'
import { searchLinkedIn, isLinkedInSearchAvailable } from './tools/search-linkedin'
import { searchApollo, isApolloSearchAvailable } from './tools/search-apollo'
import { qualifyLead } from './tools/qualify-lead'
import { enrichLead } from './tools/enrich-lead'
import { saveLead, saveLeadsBatch } from './tools/save-lead'
import {
  AgentConfig,
  AgentResults,
  RawLeadData,
  LeadCategory,
  LeadScoreBreakdown,
  LinkedInProfile,
  LINKEDIN_TARGET_TITLES,
} from '@/types/agents'

interface ProcessedLead {
  lead: RawLeadData
  score: number
  category: LeadCategory
  scoreBreakdown: LeadScoreBreakdown
  enrichmentData?: unknown
  linkedInContacts?: LinkedInProfile[]
}

/**
 * Get the enrichment provider preference
 * 'apollo' (default) - Use Apollo.io for enrichment
 * 'linkedin' - Use LinkedIn MCP (deprecated)
 * 'both' - Use Apollo first, fallback to LinkedIn
 */
function getEnrichmentProvider(): 'apollo' | 'linkedin' | 'both' {
  const provider = process.env.ENRICHMENT_PROVIDER?.toLowerCase()
  if (provider === 'linkedin' || provider === 'both') {
    return provider
  }
  return 'apollo' // default
}

export class ProspectorAgent extends BaseAgent {
  constructor() {
    super('prospector')
  }

  async run(config: AgentConfig): Promise<AgentResults> {
    const results = createEmptyResults()
    const processedLeads: ProcessedLead[] = []

    this.log('info', 'Starting prospection run', config)

    try {
      // Step 1: Search for leads from various sources
      const industries = config.industries || [
        'food_processing',
        'dairy',
        'meat',
        'beverages',
        'cold_storage',
        'pharmaceuticals',
        'ice_plants',
      ]
      const regions = config.regions || ['mexico']
      const maxLeads = config.maxLeads || 20
      const sources = config.sources || ['all']

      this.log('info', 'Searching leads', { industries, regions, maxLeads, sources })

      // Search each source
      for (const source of sources) {
        try {
          const searchResults = await searchLeads({
            query: industries.join(' OR '),
            industries,
            regions,
            limit: Math.ceil(maxLeads / sources.length),
            source,
          })

          this.log('info', `Found ${searchResults.totalFound} leads from ${source}`)

          results.sources.push({
            name: source,
            leadsFound: searchResults.totalFound,
          })

          // Step 2: Qualify each lead
          for (const rawLead of searchResults.leads) {
            results.leadsProcessed++

            try {
              const qualification = qualifyLead({ lead: rawLead })

              this.log('info', `Qualified lead: ${rawLead.company}`, {
                score: qualification.score,
                category: qualification.category,
              })

              // Only process leads that meet minimum score
              const minScore = config.minScore || 40
              if (qualification.score >= minScore) {
                // Step 3: Enrich the lead
                let enrichmentData
                try {
                  enrichmentData = await enrichLead({ lead: rawLead })
                  this.log('info', `Enriched lead: ${rawLead.company}`)
                } catch (enrichError) {
                  this.log('warn', `Failed to enrich lead: ${rawLead.company}`, enrichError)
                }

                // Step 3b: Contact enrichment (Apollo.io preferred, LinkedIn fallback)
                let contacts: LinkedInProfile[] = []
                let companyUrl: string | undefined
                let enrichedIndustry: string | undefined
                let enrichedCompanySize: string | undefined

                const provider = getEnrichmentProvider()

                // Try Apollo.io first (preferred)
                if (
                  (provider === 'apollo' || provider === 'both') &&
                  isApolloSearchAvailable() &&
                  rawLead.company
                ) {
                  try {
                    const apolloResult = await searchApollo({
                      companyName: rawLead.company,
                      titles: [...LINKEDIN_TARGET_TITLES],
                      limit: 5,
                      getEmployees: true,
                    })

                    if (apolloResult.company) {
                      companyUrl = apolloResult.company.linkedinUrl || apolloResult.company.website
                      if (apolloResult.company.industry) {
                        enrichedIndustry = apolloResult.company.industry
                      }
                      if (apolloResult.company.size) {
                        enrichedCompanySize = apolloResult.company.size
                      }
                      this.log('info', `Found company via Apollo: ${apolloResult.company.name}`)
                    }

                    if (apolloResult.employees.length > 0) {
                      contacts = apolloResult.employees
                      this.log(
                        'info',
                        `Found ${contacts.length} contacts via Apollo for: ${rawLead.company}`
                      )
                    }
                  } catch (apolloError) {
                    this.log('warn', `Apollo enrichment failed for: ${rawLead.company}`, apolloError)
                  }
                }

                // Fallback to LinkedIn if Apollo didn't return results or if configured
                if (
                  contacts.length === 0 &&
                  (provider === 'linkedin' || provider === 'both') &&
                  isLinkedInSearchAvailable() &&
                  rawLead.company
                ) {
                  try {
                    const linkedInResult = await searchLinkedIn({
                      companyName: rawLead.company,
                      titles: [...LINKEDIN_TARGET_TITLES],
                      limit: 5,
                      getEmployees: true,
                    })

                    if (linkedInResult.company && !companyUrl) {
                      companyUrl = linkedInResult.company.linkedinUrl
                      this.log(
                        'info',
                        `Found LinkedIn company (fallback): ${linkedInResult.company.name}`
                      )
                    }

                    if (linkedInResult.employees.length > 0) {
                      contacts = linkedInResult.employees
                      this.log(
                        'info',
                        `Found ${contacts.length} LinkedIn contacts (fallback) for: ${rawLead.company}`
                      )
                    }
                  } catch (linkedInError) {
                    this.log(
                      'warn',
                      `LinkedIn enrichment failed for: ${rawLead.company}`,
                      linkedInError
                    )
                  }
                }

                // Add to processed leads
                processedLeads.push({
                  lead: {
                    ...rawLead,
                    email: enrichmentData?.email || rawLead.email,
                    phone: enrichmentData?.phone || rawLead.phone,
                    website: enrichmentData?.website || rawLead.website,
                    industry: enrichedIndustry || rawLead.industry,
                    companySize: enrichedCompanySize || rawLead.companySize,
                    linkedinCompanyUrl: companyUrl,
                    linkedinContacts: contacts.length > 0 ? contacts : undefined,
                  },
                  score: qualification.score,
                  category: qualification.category,
                  scoreBreakdown: qualification.scoreBreakdown,
                  enrichmentData,
                  linkedInContacts: contacts,
                })

                // Update category counts
                results.leadsByCategory[qualification.category]++
              } else {
                results.leadsByCategory.DISCARD++
              }
            } catch (qualifyError) {
              this.log('error', `Failed to qualify lead: ${rawLead.company}`, qualifyError)
              results.errors.push(`Qualify error: ${rawLead.company}`)
            }
          }
        } catch (sourceError) {
          this.log('error', `Failed to search source: ${source}`, sourceError)
          results.errors.push(`Search error: ${source}`)
        }
      }

      // Step 4: Save qualified leads (unless dry run)
      if (!config.dryRun && processedLeads.length > 0) {
        this.log('info', `Saving ${processedLeads.length} qualified leads`)

        const saveResults = await saveLeadsBatch(
          processedLeads.map((pl) => ({
            lead: pl.lead,
            score: pl.score,
            category: pl.category,
            scoreBreakdown: pl.scoreBreakdown,
            enrichmentData: pl.enrichmentData as Record<string, unknown>,
          })),
          this.agentId
        )

        results.leadsCreated = saveResults.created
        results.leadsUpdated = saveResults.updated

        if (saveResults.errors.length > 0) {
          results.errors.push(...saveResults.errors)
        }

        this.log('info', 'Save results', saveResults)
      } else if (config.dryRun) {
        this.log('info', 'Dry run - leads not saved', { count: processedLeads.length })
        results.leadsCreated = 0
        results.leadsUpdated = 0
      }

      this.log('info', 'Prospection run completed', results)

      return results
    } catch (error) {
      this.log('error', 'Prospection run failed', error)
      results.errors.push(error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }
}

// Factory function to create and run the prospector
export async function runProspector(config: AgentConfig): Promise<{
  runId: string
  results: AgentResults
}> {
  const agent = new ProspectorAgent()
  return agent.execute(config)
}

// Run prospector with default configuration
export async function runDefaultProspection(): Promise<{
  runId: string
  results: AgentResults
}> {
  return runProspector({
    industries: ['food_processing', 'dairy', 'meat', 'beverages', 'cold_storage'],
    regions: ['mexico'],
    maxLeads: 20,
    sources: ['all'],
    minScore: 40,
  })
}

// Export the agent class
export default ProspectorAgent
