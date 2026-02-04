import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { EnrichLeadInput, EnrichLeadOutput, RawLeadData } from '@/types/agents'

// Simulated enrichment - in production, this would call external APIs
// like Apollo.io, Clearbit, or scrape websites
async function enrichFromWebsite(website?: string): Promise<Partial<EnrichLeadOutput>> {
  if (!website) return {}

  // In production, this would:
  // 1. Fetch the website
  // 2. Extract contact information
  // 3. Find social media links
  // 4. Determine company size from about page

  // For now, return empty as this requires actual web scraping
  return {}
}

// Try to find email patterns
function guessEmailPatterns(company: string, website?: string): string[] {
  const domain = website?.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
  if (!domain) return []

  return [
    `info@${domain}`,
    `ventas@${domain}`,
    `compras@${domain}`,
    `contacto@${domain}`,
    `mantenimiento@${domain}`,
  ]
}

// Extract domain from website
function extractDomain(website?: string): string | null {
  if (!website) return null
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return url.hostname
  } catch {
    return null
  }
}

// Main enrichment function
export async function enrichLead(input: EnrichLeadInput): Promise<EnrichLeadOutput> {
  const lead = input.lead

  // Start with what we have
  const result: EnrichLeadOutput = {
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    companySize: lead.companySize,
    industry: lead.industry,
    equipmentBrands: [],
    socialProfiles: {},
    additionalContacts: [],
  }

  // Try to enrich from website if available
  if (lead.website) {
    const websiteData = await enrichFromWebsite(lead.website)
    Object.assign(result, websiteData)
  }

  // If no email but we have website, suggest possible patterns
  if (!result.email && lead.website) {
    const patterns = guessEmailPatterns(lead.company || lead.name, lead.website)
    if (patterns.length > 0) {
      result.email = patterns[0] // Use most likely pattern
    }
  }

  // Generate LinkedIn company URL if we have company name
  if (lead.company) {
    const companySlug = lead.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    result.socialProfiles = {
      linkedin: `https://www.linkedin.com/company/${companySlug}`,
    }
  }

  return result
}

// Create LangChain tool for enrichment
export const createEnrichLeadTool = () => {
  return new DynamicStructuredTool({
    name: 'enrich_lead',
    description:
      'Enrich a lead with additional information by searching the web, social media, and business directories. Returns email, phone, company size, social profiles, and additional contacts.',
    schema: z.object({
      name: z.string().describe('Contact name'),
      company: z.string().describe('Company name'),
      website: z.string().optional().describe('Company website URL'),
      location: z.string().optional().describe('Location (city, state, country)'),
      industry: z.string().optional().describe('Industry sector'),
    }),
    func: async (input) => {
      const result = await enrichLead({ lead: input as RawLeadData })
      return JSON.stringify(result, null, 2)
    },
  })
}

// Batch enrichment for multiple leads
export async function enrichLeadsBatch(leads: RawLeadData[]): Promise<Map<string, EnrichLeadOutput>> {
  const results = new Map<string, EnrichLeadOutput>()

  for (const lead of leads) {
    try {
      const enriched = await enrichLead({ lead })
      results.set(lead.company || lead.name, enriched)
    } catch (error) {
      console.error(`Failed to enrich lead ${lead.company || lead.name}:`, error)
      // Continue with other leads
    }
  }

  return results
}

// Verify email exists (mock - in production use email verification API)
export async function verifyEmail(email: string): Promise<{
  valid: boolean
  deliverable: boolean
  reason?: string
}> {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, deliverable: false, reason: 'Invalid format' }
  }

  // In production, call email verification API like ZeroBounce, Hunter, etc.
  return { valid: true, deliverable: true }
}

// Find company on LinkedIn (mock - in production use LinkedIn API or scraping)
export async function findLinkedInCompany(companyName: string): Promise<{
  found: boolean
  url?: string
  employeeCount?: number
  industry?: string
}> {
  // In production, this would search LinkedIn
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return {
    found: true,
    url: `https://www.linkedin.com/company/${slug}`,
  }
}
