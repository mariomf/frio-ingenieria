export * from './openai'
export * from './anthropic'

import { validateOpenAIConfig, getProspectorModel } from './openai'
import { validateAnthropicConfig, getProspectorModelAnthropic } from './anthropic'

export type AIProvider = 'openai' | 'anthropic'

// Get the best available model based on configuration
export const getAvailableProspectorModel = () => {
  if (validateOpenAIConfig()) {
    return { provider: 'openai' as AIProvider, model: getProspectorModel() }
  }
  if (validateAnthropicConfig()) {
    return { provider: 'anthropic' as AIProvider, model: getProspectorModelAnthropic() }
  }
  throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')
}

// Check which providers are available
export const getAvailableProviders = (): AIProvider[] => {
  const providers: AIProvider[] = []
  if (validateOpenAIConfig()) providers.push('openai')
  if (validateAnthropicConfig()) providers.push('anthropic')
  return providers
}
