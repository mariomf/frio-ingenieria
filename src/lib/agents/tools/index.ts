export * from './search-leads'
export * from './search-linkedin'
export * from './search-apollo'
export * from './qualify-lead'
export * from './enrich-lead'
export * from './save-lead'

import { StructuredTool } from '@langchain/core/tools'
import { createSearchLeadsTool } from './search-leads'
import { createSearchLinkedInTool, isLinkedInSearchAvailable } from './search-linkedin'
import { createSearchApolloTool, isApolloSearchAvailable } from './search-apollo'
import { createQualifyLeadTool } from './qualify-lead'
import { createEnrichLeadTool } from './enrich-lead'
import { createSaveLeadTool } from './save-lead'

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

// Create all tools for the prospector agent
export function createProspectorTools(agentId: string): StructuredTool[] {
  const tools: StructuredTool[] = [
    createSearchLeadsTool(),
    createQualifyLeadTool(),
    createEnrichLeadTool(),
    createSaveLeadTool(agentId),
  ]

  const provider = getEnrichmentProvider()

  // Add enrichment tools based on provider preference
  // Apollo.io is preferred (stable API, verified emails)
  if (provider === 'apollo' || provider === 'both') {
    if (isApolloSearchAvailable()) {
      tools.splice(1, 0, createSearchApolloTool()) // Insert after search-leads
      console.log('[tools] Apollo.io search enabled')
    } else if (provider === 'apollo') {
      console.warn('[tools] Apollo.io not configured (APOLLO_API_KEY missing)')
    }
  }

  // LinkedIn as fallback or if explicitly configured
  if (provider === 'linkedin' || (provider === 'both' && !isApolloSearchAvailable())) {
    if (isLinkedInSearchAvailable()) {
      // Insert after Apollo if both are enabled, or after search-leads if only LinkedIn
      const insertPosition = provider === 'both' && isApolloSearchAvailable() ? 2 : 1
      tools.splice(insertPosition, 0, createSearchLinkedInTool())
      console.log('[tools] LinkedIn search enabled (fallback)')
    }
  }

  return tools
}

// Export availability checks
export { isApolloSearchAvailable, isApolloConfigured } from './search-apollo'
export { isLinkedInSearchAvailable } from './search-linkedin'
