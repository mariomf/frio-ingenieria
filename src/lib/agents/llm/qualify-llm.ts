/**
 * LLM-powered Lead Qualification
 *
 * Uses Claude to intelligently qualify leads based on context understanding,
 * not just keyword matching.
 */

import { callClaude, isLLMConfigured, LLMResult } from '@/lib/services/llmService'
import {
  RawLeadData,
  LeadCategory,
  LeadScoreBreakdown,
  QualifyLeadOutput,
} from '@/types/agents'
import { qualifyLead as qualifyLeadDeterministic } from '../tools/qualify-lead'

// System prompt for lead qualification
const QUALIFY_SYSTEM_PROMPT = `Eres un experto en calificación de leads para Frío Ingeniería, una empresa mexicana que vende refacciones de equipos de refrigeración industrial (compresores, evaporadores, condensadores) de marcas como FRICK, MYCOM, Danfoss, y Parker.

Tu trabajo es calificar leads basándote en su potencial como clientes.

INDUSTRIAS OBJETIVO (máxima prioridad):
- Lácteos (leche, quesos, yogurt)
- Cárnicos (rastros, procesadoras de carne)
- Alimentos procesados
- Bebidas (cervecerías, refrescos)
- Farmacéuticos
- Almacenes frigoríficos / cadena de frío
- Plantas de hielo

UBICACIONES OBJETIVO:
- México (máxima prioridad)
- LATAM (Colombia, Perú, Chile, Argentina)

SEÑALES DE COMPRA:
- Mencionan equipos Frick, MYCOM, York, Danfoss
- Necesitan refacciones o mantenimiento
- Tienen equipos de refrigeración industrial
- Tamaño mediano (50-500 empleados) es ideal

TÍTULOS DE CONTACTO RELEVANTES:
- Gerente/Jefe de Mantenimiento
- Gerente de Compras/Procurement
- Gerente de Planta/Operaciones
- Director de Ingeniería

Responde SIEMPRE en formato JSON exacto.`

// User prompt template for single lead
function createQualifyPrompt(lead: RawLeadData): string {
  return `Califica el siguiente lead para Frío Ingeniería:

DATOS DEL LEAD:
- Nombre/Contacto: ${lead.name || 'No disponible'}
- Empresa: ${lead.company || 'No disponible'}
- Industria: ${lead.industry || 'No especificada'}
- Ubicación: ${lead.location || 'No especificada'}
- Tamaño: ${lead.companySize || 'No especificado'}
- Email: ${lead.email || 'No disponible'}
- Website: ${lead.website || 'No disponible'}
- Fuente: ${lead.source || 'No especificada'}
${lead.linkedinContacts?.length ? `- Contactos LinkedIn: ${lead.linkedinContacts.map(c => `${c.name} (${c.title})`).join(', ')}` : ''}

Responde en este formato JSON exacto:
{
  "score": <número 0-100>,
  "category": "<HOT|WARM|COLD|DISCARD>",
  "reasoning": "<explicación breve de por qué este score>",
  "scoreBreakdown": {
    "demographic": {
      "industry": <0-15>,
      "companySize": <0-10>,
      "location": <0-10>,
      "jobTitle": <0-5>
    },
    "intent": {
      "equipmentBrands": <0-20>,
      "refaccionesNeed": <0-10>
    },
    "engagement": {
      "purchaseHistory": <0-15>,
      "previousInteractions": <0-15>
    }
  },
  "recommendations": ["<acción sugerida 1>", "<acción sugerida 2>"]
}`
}

// System prompt for batch qualification
const BATCH_QUALIFY_SYSTEM_PROMPT = `${QUALIFY_SYSTEM_PROMPT}

Para eficiencia, calificarás múltiples leads a la vez. Responde con un array JSON.`

// User prompt template for batch leads
function createBatchQualifyPrompt(leads: RawLeadData[]): string {
  const leadsText = leads.map((lead, index) => `
LEAD ${index + 1}:
- Empresa: ${lead.company || lead.name || 'No disponible'}
- Industria: ${lead.industry || 'No especificada'}
- Ubicación: ${lead.location || 'No especificada'}
- Tamaño: ${lead.companySize || 'No especificado'}
- Fuente: ${lead.source || 'No especificada'}
${lead.linkedinContacts?.length ? `- Contactos: ${lead.linkedinContacts.length} identificados` : ''}`
  ).join('\n')

  return `Califica los siguientes ${leads.length} leads para Frío Ingeniería:

${leadsText}

Responde con un array JSON con este formato para cada lead:
[
  {
    "leadIndex": 0,
    "score": <número 0-100>,
    "category": "<HOT|WARM|COLD|DISCARD>",
    "reasoning": "<explicación breve>"
  },
  ...
]`
}

// System prompt for prioritization
const PRIORITIZE_SYSTEM_PROMPT = `${QUALIFY_SYSTEM_PROMPT}

Tu tarea es priorizar una lista de leads ya calificados, eligiendo los mejores para seguimiento inmediato.

Considera:
1. Score actual (pero puedes ajustarlo basándote en contexto)
2. Potencial de venta a corto plazo
3. Calidad de los datos de contacto
4. Señales de intención de compra`

// User prompt for prioritization
function createPrioritizePrompt(
  leads: Array<{ lead: RawLeadData; score: number; category: LeadCategory }>,
  maxLeads: number
): string {
  const leadsText = leads.map((item, index) => `
LEAD ${index + 1} (Score actual: ${item.score}, Categoría: ${item.category}):
- Empresa: ${item.lead.company || item.lead.name}
- Industria: ${item.lead.industry || 'No especificada'}
- Ubicación: ${item.lead.location || 'No especificada'}
- Contactos: ${item.lead.linkedinContacts?.length || 0} identificados
- Website: ${item.lead.website ? 'Sí' : 'No'}`
  ).join('\n')

  return `De los siguientes ${leads.length} leads, selecciona y prioriza los ${maxLeads} mejores:

${leadsText}

Responde con un array JSON ordenado por prioridad (mejor primero):
[
  {
    "leadIndex": <índice original 0-based>,
    "adjustedScore": <score ajustado 0-100>,
    "priority": <1-${maxLeads}>,
    "reasoning": "<por qué es prioritario>"
  },
  ...
]`
}

/**
 * Parse JSON response from Claude, handling markdown code blocks
 */
function parseJSONResponse<T>(text: string): T {
  // Remove markdown code blocks if present
  let cleanText = text.trim()
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7)
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3)
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3)
  }
  return JSON.parse(cleanText.trim())
}

/**
 * Qualify a single lead using LLM
 * Falls back to deterministic if LLM is not configured or fails
 */
export async function qualifyLeadLLM(lead: RawLeadData): Promise<QualifyLeadOutput & { reasoning?: string; recommendations?: string[] }> {
  if (!isLLMConfigured()) {
    console.log('[qualify-llm] LLM not configured, using deterministic fallback')
    return qualifyLeadDeterministic({ lead })
  }

  const result = await callClaude<{
    score: number
    category: LeadCategory
    reasoning: string
    scoreBreakdown: LeadScoreBreakdown
    recommendations: string[]
  }>(
    QUALIFY_SYSTEM_PROMPT,
    createQualifyPrompt(lead),
    parseJSONResponse
  )

  if (result.error || !result.data) {
    console.log('[qualify-llm] LLM call failed, using deterministic fallback:', result.error)
    return qualifyLeadDeterministic({ lead })
  }

  const { score, category, reasoning, scoreBreakdown, recommendations } = result.data

  // Validate and normalize score
  const normalizedScore = Math.max(0, Math.min(100, score))
  const normalizedCategory = ['HOT', 'WARM', 'COLD', 'DISCARD'].includes(category)
    ? category
    : normalizedScore >= 80 ? 'HOT'
    : normalizedScore >= 60 ? 'WARM'
    : normalizedScore >= 30 ? 'COLD'
    : 'DISCARD'

  return {
    score: normalizedScore,
    category: normalizedCategory as LeadCategory,
    scoreBreakdown: scoreBreakdown || {
      demographic: { industry: 0, companySize: 0, location: 0, jobTitle: 0 },
      intent: { equipmentBrands: 0, refaccionesNeed: 0 },
      engagement: { purchaseHistory: 0, previousInteractions: 0 },
      total: normalizedScore,
    },
    qualifies: normalizedScore >= 40,
    reasons: [reasoning],
    reasoning,
    recommendations,
  }
}

/**
 * Qualify multiple leads in a single LLM call (more efficient)
 * Falls back to deterministic if LLM fails
 */
export async function qualifyLeadsBatchLLM(
  leads: RawLeadData[]
): Promise<Array<{ lead: RawLeadData; qualification: QualifyLeadOutput; reasoning?: string }>> {
  if (!isLLMConfigured() || leads.length === 0) {
    console.log('[qualify-llm] LLM not configured or no leads, using deterministic fallback')
    return leads.map(lead => ({
      lead,
      qualification: qualifyLeadDeterministic({ lead }),
    }))
  }

  // For large batches, split into chunks of 10
  const BATCH_SIZE = 10
  const results: Array<{ lead: RawLeadData; qualification: QualifyLeadOutput; reasoning?: string }> = []

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE)

    const result = await callClaude<Array<{
      leadIndex: number
      score: number
      category: LeadCategory
      reasoning: string
    }>>(
      BATCH_QUALIFY_SYSTEM_PROMPT,
      createBatchQualifyPrompt(batch),
      parseJSONResponse
    )

    if (result.error || !result.data) {
      console.log('[qualify-llm] Batch LLM call failed, using deterministic fallback')
      batch.forEach(lead => {
        results.push({
          lead,
          qualification: qualifyLeadDeterministic({ lead }),
        })
      })
      continue
    }

    // Map LLM results back to leads
    for (const llmResult of result.data) {
      const leadIndex = llmResult.leadIndex
      if (leadIndex >= 0 && leadIndex < batch.length) {
        const lead = batch[leadIndex]
        const normalizedScore = Math.max(0, Math.min(100, llmResult.score))

        results.push({
          lead,
          qualification: {
            score: normalizedScore,
            category: llmResult.category,
            scoreBreakdown: {
              demographic: { industry: 0, companySize: 0, location: 0, jobTitle: 0 },
              intent: { equipmentBrands: 0, refaccionesNeed: 0 },
              engagement: { purchaseHistory: 0, previousInteractions: 0 },
              total: normalizedScore,
            },
            qualifies: normalizedScore >= 40,
            reasons: [llmResult.reasoning],
          },
          reasoning: llmResult.reasoning,
        })
      }
    }

    // Handle any leads not returned by LLM
    batch.forEach((lead, index) => {
      const found = result.data?.find(r => r.leadIndex === index)
      if (!found) {
        results.push({
          lead,
          qualification: qualifyLeadDeterministic({ lead }),
        })
      }
    })
  }

  return results
}

/**
 * Prioritize leads using LLM intelligence
 * Returns leads in priority order, limited to maxLeads
 */
export async function prioritizeLeadsLLM(
  leads: Array<{ lead: RawLeadData; score: number; category: LeadCategory }>,
  maxLeads: number
): Promise<LLMResult<Array<{
  lead: RawLeadData
  score: number
  category: LeadCategory
  priority: number
  reasoning: string
}>>> {
  if (!isLLMConfigured() || leads.length === 0) {
    console.log('[qualify-llm] LLM not configured, using score-based prioritization')
    const sorted = [...leads]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxLeads)
      .map((item, index) => ({
        ...item,
        priority: index + 1,
        reasoning: 'Priorizado por score',
      }))
    return { data: sorted, fallbackUsed: true }
  }

  const result = await callClaude<Array<{
    leadIndex: number
    adjustedScore: number
    priority: number
    reasoning: string
  }>>(
    PRIORITIZE_SYSTEM_PROMPT,
    createPrioritizePrompt(leads, maxLeads),
    parseJSONResponse
  )

  if (result.error || !result.data) {
    console.log('[qualify-llm] Prioritization LLM call failed, using score-based fallback')
    const sorted = [...leads]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxLeads)
      .map((item, index) => ({
        ...item,
        priority: index + 1,
        reasoning: 'Priorizado por score (fallback)',
      }))
    return { data: sorted, fallbackUsed: true }
  }

  // Map LLM priorities back to leads
  const prioritized = result.data
    .filter(r => r.leadIndex >= 0 && r.leadIndex < leads.length)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxLeads)
    .map(r => ({
      lead: leads[r.leadIndex].lead,
      score: r.adjustedScore,
      category: r.adjustedScore >= 80 ? 'HOT' as LeadCategory
        : r.adjustedScore >= 60 ? 'WARM' as LeadCategory
        : r.adjustedScore >= 30 ? 'COLD' as LeadCategory
        : 'DISCARD' as LeadCategory,
      priority: r.priority,
      reasoning: r.reasoning,
    }))

  return { data: prioritized, tokensUsed: result.tokensUsed }
}

/**
 * Check if hybrid LLM qualification is enabled
 */
export function isHybridQualificationEnabled(): boolean {
  const mode = process.env.QUALIFICATION_MODE?.toLowerCase()
  // Enable hybrid by default if LLM is configured, unless explicitly disabled
  if (mode === 'deterministic') return false
  if (mode === 'hybrid' || mode === 'llm') return isLLMConfigured()
  return isLLMConfigured() // Default: use LLM if available
}
