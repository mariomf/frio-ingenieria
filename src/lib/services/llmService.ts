/**
 * LLM Service - Claude/Anthropic Integration
 *
 * Provides intelligent lead qualification and prioritization using Claude.
 * Falls back to deterministic approach if API key is not configured.
 */

import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

// Configuration
const DEFAULT_MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024
const TEMPERATURE = 0.3 // Low temperature for more consistent scoring

// Rate limiting
const RATE_LIMIT_DELAY_MS = 500
let lastRequestTime = 0

// Token usage tracking
interface TokenUsage {
  input: number
  output: number
  total: number
}

let sessionUsage: TokenUsage = { input: 0, output: 0, total: 0 }

/**
 * Check if LLM service is configured
 */
export function isLLMConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

/**
 * Get LLM provider preference
 */
export function getLLMProvider(): 'anthropic' | 'openai' | 'none' {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'none'
}

/**
 * Get the Claude client
 */
function getClaudeClient(): ChatAnthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[LLM] Anthropic API key not configured')
    return null
  }

  return new ChatAnthropic({
    model: DEFAULT_MODEL,
    maxTokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    apiKey,
  })
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Apply rate limiting before making API calls
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    await sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest)
  }
  lastRequestTime = Date.now()
}

/**
 * Result of an LLM call
 */
export interface LLMResult<T> {
  data: T | null
  error?: string
  tokensUsed?: TokenUsage
  fallbackUsed?: boolean
}

/**
 * Make a call to Claude with structured output parsing
 */
export async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  parseResponse: (text: string) => T
): Promise<LLMResult<T>> {
  const client = getClaudeClient()

  if (!client) {
    return {
      data: null,
      error: 'LLM not configured',
      fallbackUsed: true
    }
  }

  await applyRateLimit()

  try {
    const response = await client.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ])

    // Extract token usage if available
    const usage = response.usage_metadata
    const tokensUsed: TokenUsage = {
      input: usage?.input_tokens || 0,
      output: usage?.output_tokens || 0,
      total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    }

    // Update session tracking
    sessionUsage.input += tokensUsed.input
    sessionUsage.output += tokensUsed.output
    sessionUsage.total += tokensUsed.total

    // Parse response
    const text = typeof response.content === 'string'
      ? response.content
      : response.content[0]?.type === 'text'
        ? response.content[0].text
        : ''

    const data = parseResponse(text)

    console.log(`[LLM] Claude call successful, tokens: ${tokensUsed.total}`)

    return { data, tokensUsed }
  } catch (error) {
    console.error('[LLM] Claude call failed:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackUsed: true
    }
  }
}

/**
 * Get session token usage statistics
 */
export function getSessionUsage(): TokenUsage {
  return { ...sessionUsage }
}

/**
 * Reset session token usage
 */
export function resetSessionUsage(): void {
  sessionUsage = { input: 0, output: 0, total: 0 }
}

/**
 * Estimate cost based on token usage (Claude Sonnet pricing)
 * Prices as of 2024: $3/1M input, $15/1M output
 */
export function estimateCost(usage: TokenUsage): number {
  const inputCost = (usage.input / 1_000_000) * 3
  const outputCost = (usage.output / 1_000_000) * 15
  return inputCost + outputCost
}

/**
 * Get formatted cost string
 */
export function formatCost(usage: TokenUsage): string {
  const cost = estimateCost(usage)
  return `$${cost.toFixed(4)}`
}
