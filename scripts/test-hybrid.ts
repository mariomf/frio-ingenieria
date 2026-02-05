/**
 * Test script for Hybrid LLM Qualification
 *
 * Tests the Claude-powered lead qualification system
 *
 * Usage: npx tsx scripts/test-hybrid.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

loadEnv()

import {
  isLLMConfigured,
  getLLMProvider,
  getSessionUsage,
  formatCost,
} from '../src/lib/services/llmService'
import {
  qualifyLeadLLM,
  isHybridQualificationEnabled,
} from '../src/lib/agents/llm/qualify-llm'
import { qualifyLead } from '../src/lib/agents/tools/qualify-lead'
import { RawLeadData } from '../src/types/agents'

// Test leads with varying levels of information
const testLeads: RawLeadData[] = [
  {
    name: 'Juan Pérez',
    company: 'Grupo LALA',
    industry: 'Lácteos',
    location: 'Torreón, Coahuila, México',
    companySize: '1000+',
    source: 'test',
  },
  {
    name: 'María García',
    company: 'Industrias XYZ S.A. de C.V.',
    location: 'Monterrey, NL',
    source: 'test',
  },
  {
    name: 'Carlos Rodríguez',
    company: 'Frigorífico del Norte',
    industry: 'Almacén frigorífico',
    location: 'Guadalajara, Jalisco',
    companySize: '51-200',
    website: 'https://frigorificodelnorte.mx',
    source: 'test',
  },
  {
    name: 'Ana López',
    company: 'Cervecería Modelo',
    industry: 'Bebidas',
    location: 'CDMX, México',
    companySize: '500-1000',
    source: 'test',
    linkedinContacts: [
      { name: 'Roberto Sánchez', title: 'Gerente de Mantenimiento', linkedinUrl: '' },
      { name: 'Luis Hernández', title: 'Jefe de Compras', linkedinUrl: '' },
    ],
  },
  {
    name: 'Pedro Martínez',
    company: 'Consultores ABC',
    industry: 'Consultoría',
    location: 'Madrid, España',
    companySize: '10-50',
    source: 'test',
  },
]

async function runTests() {
  console.log('\n🧪 Testing Hybrid LLM Qualification\n')
  console.log('=' .repeat(60))

  // Check configuration
  console.log('\n📋 Configuration:')
  console.log(`  LLM Configured: ${isLLMConfigured() ? '✅ Yes' : '❌ No'}`)
  console.log(`  LLM Provider: ${getLLMProvider()}`)
  console.log(`  Hybrid Mode Enabled: ${isHybridQualificationEnabled() ? '✅ Yes' : '❌ No'}`)

  if (!isLLMConfigured()) {
    console.log('\n⚠️  ANTHROPIC_API_KEY not configured.')
    console.log('   Set it in .env.local to test hybrid mode.')
    console.log('   Continuing with deterministic fallback...\n')
  }

  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 Qualifying Test Leads:\n')

  for (const lead of testLeads) {
    console.log(`\n🏢 ${lead.company || lead.name}`)
    console.log('-'.repeat(40))

    // Deterministic qualification
    const deterministicResult = qualifyLead({ lead })

    // LLM qualification (will use fallback if not configured)
    const llmResult = await qualifyLeadLLM(lead)

    console.log(`  📍 Location: ${lead.location || 'N/A'}`)
    console.log(`  🏭 Industry: ${lead.industry || 'N/A'}`)
    console.log(`  👥 Size: ${lead.companySize || 'N/A'}`)

    console.log(`\n  Deterministic: Score ${deterministicResult.score} (${deterministicResult.category})`)
    console.log(`  Hybrid/LLM:    Score ${llmResult.score} (${llmResult.category})`)

    if ('reasoning' in llmResult && llmResult.reasoning) {
      console.log(`  💭 Reasoning: ${llmResult.reasoning}`)
    }

    if ('recommendations' in llmResult && llmResult.recommendations?.length) {
      console.log(`  💡 Recommendations:`)
      llmResult.recommendations.forEach((r: string) => console.log(`     - ${r}`))
    }

    // Show score difference
    const diff = llmResult.score - deterministicResult.score
    if (diff !== 0) {
      const sign = diff > 0 ? '+' : ''
      console.log(`  📈 Score difference: ${sign}${diff} points`)
    }
  }

  // Show token usage
  console.log('\n' + '=' .repeat(60))
  console.log('\n💰 Token Usage Summary:')
  const usage = getSessionUsage()
  console.log(`  Input tokens: ${usage.input}`)
  console.log(`  Output tokens: ${usage.output}`)
  console.log(`  Total tokens: ${usage.total}`)
  console.log(`  Estimated cost: ${formatCost(usage)}`)

  console.log('\n✅ Test complete!\n')
}

runTests().catch(console.error)
