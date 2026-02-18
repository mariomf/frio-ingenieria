/**
 * Person Discovery Service
 *
 * Discovers decision-maker contacts at companies using multiple strategies:
 * 1. Existing contacts from Apollo/LinkedIn enrichment
 * 2. Website scraping (/contacto, /equipo, /nosotros)
 * 3. LLM inference (Claude generates likely titles + email patterns)
 * 4. Email pattern generation from company domain
 * 5. Apollo People Search (ready for paid plan)
 */

import { RawLeadData, LinkedInProfile, EmailConfidence, LINKEDIN_TARGET_TITLES } from '@/types/agents'
import { callClaude, isLLMConfigured } from '@/lib/services/llmService'
import { searchPeopleByCompany, isPeopleSearchAvailable, isApolloConfigured } from '@/lib/services/apolloService'

export interface DiscoveredPerson {
  firstName: string
  lastName: string
  fullName: string
  jobTitle: string
  email?: string
  emailConfidence: EmailConfidence
  linkedinUrl?: string
  phone?: string
  source: string
}

export interface PersonDiscoveryResult {
  companyName: string
  people: DiscoveredPerson[]
  strategies: string[]
}

interface PersonDiscoveryOptions {
  targetTitles?: string[]
  maxPeople?: number
}

// Common email patterns for Mexican/LATAM companies
const EMAIL_PATTERNS = [
  (first: string, last: string, domain: string) => `${first}.${last}@${domain}`,
  (first: string, last: string, domain: string) => `${first}${last}@${domain}`,
  (first: string, last: string, domain: string) => `${first[0]}${last}@${domain}`,
  (first: string, last: string, domain: string) => `${first}@${domain}`,
]

/**
 * Extract domain from a website URL
 */
function extractDomain(website?: string): string | undefined {
  if (!website) return undefined
  try {
    const url = website.startsWith('http') ? website : `https://${website}`
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return undefined
  }
}

/**
 * Normalize name for email generation (remove accents, lowercase)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')
}

/**
 * Strategy 1: Extract people from existing LinkedIn/Apollo contacts
 */
function extractFromExistingContacts(
  lead: RawLeadData,
  targetTitles: string[]
): DiscoveredPerson[] {
  const people: DiscoveredPerson[] = []
  const contacts = lead.linkedinContacts || []

  if (contacts.length === 0) return people

  const titleKeywords = targetTitles.map(t => t.toLowerCase())

  for (const contact of contacts) {
    const titleLower = (contact.title || '').toLowerCase()
    const isRelevant = titleKeywords.length === 0 ||
      titleKeywords.some(kw => titleLower.includes(kw.toLowerCase()))

    if (!isRelevant) continue

    const nameParts = contact.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const person: DiscoveredPerson = {
      firstName,
      lastName,
      fullName: contact.name,
      jobTitle: contact.title || 'Unknown',
      linkedinUrl: contact.linkedinUrl,
      emailConfidence: 'unknown',
      source: 'existing_contacts',
    }

    // Check if contact has email (from Apollo enrichment)
    const contactWithEmail = contact as LinkedInProfile & { email?: string }
    if (contactWithEmail.email) {
      person.email = contactWithEmail.email
      person.emailConfidence = 'verified'
    }

    people.push(person)
  }

  return people
}

/**
 * Strategy 2: Scrape company website for contact information
 */
async function scrapeWebsiteContacts(
  lead: RawLeadData
): Promise<DiscoveredPerson[]> {
  const people: DiscoveredPerson[] = []
  const website = lead.website
  if (!website) return people

  const baseUrl = website.startsWith('http') ? website : `https://${website}`
  const contactPages = ['/contacto', '/equipo', '/nosotros', '/about', '/contact', '/team']

  for (const page of contactPages) {
    try {
      const url = `${baseUrl.replace(/\/$/, '')}${page}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FrioBot/1.0)' },
      })
      clearTimeout(timeout)

      if (!response.ok) continue

      const html = await response.text()

      // Extract emails with regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const emails = Array.from(new Set(html.match(emailRegex) || []))
        .filter(e => !e.includes('example.com') && !e.includes('sentry'))

      // Try to extract names near emails or from structured data
      for (const email of emails.slice(0, 5)) {
        const localPart = email.split('@')[0]
        const parts = localPart.split(/[._-]/)
        const firstName = parts[0] || ''
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''

        people.push({
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
          fullName: `${firstName} ${lastName}`.trim(),
          jobTitle: 'Contact',
          email,
          emailConfidence: 'verified',
          source: 'website_scrape',
        })
      }

      if (people.length > 0) break // Stop after first successful page
    } catch {
      // Silently skip failed pages
      continue
    }
  }

  return people
}

// LLM prompt for person inference
const PERSON_INFERENCE_SYSTEM_PROMPT = `Eres un experto en organigramas de empresas industriales en México y LATAM.
Dado el nombre de una empresa, su industria y tamaño, genera los puestos más probables que tendrían poder de decisión para comprar refacciones de refrigeración industrial.

Responde SIEMPRE en formato JSON exacto.`

function createPersonInferencePrompt(lead: RawLeadData): string {
  return `Empresa: ${lead.company || lead.name}
Industria: ${lead.industry || 'No especificada'}
Tamaño: ${lead.companySize || 'No especificado'}
Ubicación: ${lead.location || 'No especificada'}
Website: ${lead.website || 'No disponible'}

Genera los 3-5 puestos más probables que serían decision-makers para compra de refacciones de refrigeración industrial.

Responde en este formato JSON exacto:
{
  "people": [
    {
      "jobTitle": "<puesto en español>",
      "firstName": "<nombre probable (genérico si no se conoce)>",
      "lastName": "<apellido probable (genérico si no se conoce)>",
      "likelihood": "<high|medium|low>"
    }
  ],
  "emailPattern": "<patrón más probable: nombre.apellido | nombre_apellido | n.apellido | nombre>"
}`
}

/**
 * Strategy 3: LLM inference of likely contacts
 */
async function inferPeopleWithLLM(
  lead: RawLeadData
): Promise<DiscoveredPerson[]> {
  if (!isLLMConfigured()) return []

  const result = await callClaude<{
    people: Array<{
      jobTitle: string
      firstName: string
      lastName: string
      likelihood: string
    }>
    emailPattern: string
  }>(
    PERSON_INFERENCE_SYSTEM_PROMPT,
    createPersonInferencePrompt(lead),
    (text) => {
      let clean = text.trim()
      if (clean.startsWith('```json')) clean = clean.slice(7)
      else if (clean.startsWith('```')) clean = clean.slice(3)
      if (clean.endsWith('```')) clean = clean.slice(0, -3)
      return JSON.parse(clean.trim())
    }
  )

  if (result.error || !result.data) return []

  const domain = extractDomain(lead.website)

  return result.data.people.map(p => {
    const person: DiscoveredPerson = {
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: `${p.firstName} ${p.lastName}`.trim(),
      jobTitle: p.jobTitle,
      emailConfidence: 'unknown',
      source: 'llm_inference',
    }

    // Generate email if we have a domain
    if (domain && p.firstName && p.lastName) {
      const first = normalizeName(p.firstName)
      const last = normalizeName(p.lastName)
      const pattern = result.data!.emailPattern || 'nombre.apellido'

      if (pattern.includes('.')) {
        person.email = `${first}.${last}@${domain}`
      } else if (pattern.includes('_')) {
        person.email = `${first}_${last}@${domain}`
      } else if (pattern === 'n.apellido') {
        person.email = `${first[0]}.${last}@${domain}`
      } else {
        person.email = `${first}.${last}@${domain}`
      }
      person.emailConfidence = 'guessed'
    }

    return person
  })
}

/**
 * Strategy 4: Generate email patterns from domain
 */
function generateEmailPatterns(
  lead: RawLeadData,
  existingPeople: DiscoveredPerson[]
): DiscoveredPerson[] {
  const domain = extractDomain(lead.website)
  if (!domain) return []

  // Only generate patterns for people who don't already have emails
  const peopleWithoutEmail = existingPeople.filter(p => !p.email && p.firstName && p.lastName)

  for (const person of peopleWithoutEmail) {
    const first = normalizeName(person.firstName)
    const last = normalizeName(person.lastName)

    if (first && last) {
      // Use the most common pattern
      person.email = EMAIL_PATTERNS[0](first, last, domain)
      person.emailConfidence = 'pattern'
    }
  }

  return [] // Modifies in place, doesn't add new people
}

/**
 * Strategy 5: Apollo People Search (requires paid plan)
 */
async function searchApolloContacts(
  lead: RawLeadData,
  targetTitles: string[],
  maxPeople: number
): Promise<DiscoveredPerson[]> {
  if (!isApolloConfigured() || isPeopleSearchAvailable() === false) return []

  try {
    const result = await searchPeopleByCompany(lead.company, {
      titles: targetTitles.length > 0 ? targetTitles : [...LINKEDIN_TARGET_TITLES],
      limit: maxPeople,
    })

    return result.contacts.map(contact => ({
      firstName: contact.first_name,
      lastName: contact.last_name,
      fullName: contact.name,
      jobTitle: contact.title || 'Unknown',
      email: contact.email || undefined,
      emailConfidence: (contact.email_status === 'verified' ? 'verified' :
        contact.email_status === 'guessed' ? 'guessed' : 'unknown') as EmailConfidence,
      linkedinUrl: contact.linkedin_url || undefined,
      source: 'apollo_people',
    }))
  } catch (error) {
    console.error(`[PersonDiscovery] Apollo people search failed for ${lead.company}:`, error)
    return []
  }
}

/**
 * Main discovery function: find people at a company using multiple strategies
 */
export async function discoverPeopleAtCompany(
  lead: RawLeadData,
  options: PersonDiscoveryOptions = {}
): Promise<PersonDiscoveryResult> {
  const {
    targetTitles = [...LINKEDIN_TARGET_TITLES],
    maxPeople = 5,
  } = options

  const result: PersonDiscoveryResult = {
    companyName: lead.company || lead.name,
    people: [],
    strategies: [],
  }

  const seen = new Set<string>()
  function addPeople(people: DiscoveredPerson[], strategy: string) {
    if (people.length === 0) return
    result.strategies.push(strategy)
    for (const person of people) {
      // Deduplicate by name+title
      const key = `${person.fullName.toLowerCase()}|${person.jobTitle.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      result.people.push(person)
    }
  }

  console.log(`[PersonDiscovery] Discovering people at: ${result.companyName}`)

  // Strategy 1: Existing contacts (instant, no API calls)
  const existing = extractFromExistingContacts(lead, targetTitles)
  addPeople(existing, 'existing_contacts')

  // Strategy 5: Apollo People Search (if available - most reliable)
  if (result.people.length < maxPeople) {
    const apolloPeople = await searchApolloContacts(lead, targetTitles, maxPeople)
    addPeople(apolloPeople, 'apollo_people')
  }

  // Strategy 2: Website scraping (free, real data)
  if (result.people.length < maxPeople && lead.website) {
    const scraped = await scrapeWebsiteContacts(lead)
    addPeople(scraped, 'website_scrape')
  }

  // Strategy 3: LLM inference (uses API tokens but generates plausible contacts)
  if (result.people.length < maxPeople) {
    const inferred = await inferPeopleWithLLM(lead)
    addPeople(inferred, 'llm_inference')
  }

  // Strategy 4: Email pattern generation for people without emails
  generateEmailPatterns(lead, result.people)

  // Trim to maxPeople
  result.people = result.people.slice(0, maxPeople)

  console.log(`[PersonDiscovery] Found ${result.people.length} people at ${result.companyName} using: ${result.strategies.join(', ')}`)

  return result
}
