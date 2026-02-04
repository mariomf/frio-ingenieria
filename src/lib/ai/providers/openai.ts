import { ChatOpenAI } from '@langchain/openai'

// GPT-3.5-Turbo for cost-effective operations (~$0.002/1K tokens)
export const getGPT35Turbo = () => {
  return new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
}

// GPT-4 for complex reasoning (Phase 2+)
export const getGPT4 = () => {
  return new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0.2,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
}

// GPT-4 Turbo for balance of cost and capability
export const getGPT4Turbo = () => {
  return new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0.2,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
}

// Default model for prospecting (cost-effective)
export const getProspectorModel = () => {
  // Use GPT-3.5-Turbo for initial MVP to keep costs low
  return getGPT35Turbo()
}

// Model for lead qualification (needs better reasoning)
export const getQualifierModel = () => {
  // Start with GPT-3.5, upgrade to GPT-4 if quality is insufficient
  return getGPT35Turbo()
}

// Model for enrichment tasks
export const getEnricherModel = () => {
  return getGPT35Turbo()
}

// Validate that OpenAI API key is configured
export const validateOpenAIConfig = (): boolean => {
  const apiKey = process.env.OPENAI_API_KEY
  return !!apiKey && apiKey.length > 0
}
