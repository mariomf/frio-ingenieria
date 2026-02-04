export * from './search-leads'
export * from './search-linkedin'
export * from './qualify-lead'
export * from './enrich-lead'
export * from './save-lead'

import { StructuredTool } from '@langchain/core/tools'
import { createSearchLeadsTool } from './search-leads'
import { createSearchLinkedInTool, isLinkedInSearchAvailable } from './search-linkedin'
import { createQualifyLeadTool } from './qualify-lead'
import { createEnrichLeadTool } from './enrich-lead'
import { createSaveLeadTool } from './save-lead'

// Create all tools for the prospector agent
export function createProspectorTools(agentId: string): StructuredTool[] {
  const tools: StructuredTool[] = [
    createSearchLeadsTool(),
    createQualifyLeadTool(),
    createEnrichLeadTool(),
    createSaveLeadTool(agentId),
  ]

  // Add LinkedIn tool if configured
  if (isLinkedInSearchAvailable()) {
    tools.splice(1, 0, createSearchLinkedInTool()) // Insert after search-leads
  }

  return tools
}
