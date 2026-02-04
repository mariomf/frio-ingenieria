import { ChatAnthropic } from '@langchain/anthropic'

// Claude 3 Haiku for fast, cost-effective operations
export const getClaudeHaiku = () => {
  return new ChatAnthropic({
    modelName: 'claude-3-haiku-20240307',
    temperature: 0.3,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// Claude 3 Sonnet for balanced performance
export const getClaudeSonnet = () => {
  return new ChatAnthropic({
    modelName: 'claude-3-sonnet-20240229',
    temperature: 0.2,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// Claude 3 Opus for complex reasoning tasks
export const getClaudeOpus = () => {
  return new ChatAnthropic({
    modelName: 'claude-3-opus-20240229',
    temperature: 0.2,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// Default model for prospecting (cost-effective with good Spanish)
export const getProspectorModelAnthropic = () => {
  // Claude Haiku is fast and handles Spanish well
  return getClaudeHaiku()
}

// Model for lead qualification
export const getQualifierModelAnthropic = () => {
  // Sonnet provides better reasoning for qualification
  return getClaudeSonnet()
}

// Model for complex analysis
export const getAnalysisModelAnthropic = () => {
  return getClaudeSonnet()
}

// Validate that Anthropic API key is configured
export const validateAnthropicConfig = (): boolean => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  return !!apiKey && apiKey.length > 0
}
