/**
 * Apollo.io Service Test Script
 *
 * Tests the Apollo.io API integration for lead enrichment.
 * Run with: npx tsx scripts/test-apollo.ts
 *
 * Make sure to set APOLLO_API_KEY environment variable:
 *   APOLLO_API_KEY=your_key npx tsx scripts/test-apollo.ts
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Simple .env.local loader (no external dependencies)
function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Only set if not already defined
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

// Load environment variables from .env.local
loadEnvFile(resolve(process.cwd(), '.env.local'))

import {
  isApolloConfigured,
  searchPeopleByCompany,
  enrichOrganization,
  getCompanySizeCategory,
  getCacheStats,
  getPlanCapabilities,
  resetPlanDetection,
} from '../src/lib/services/apolloService'

const TEST_COMPANIES = [
  'Grupo LALA',
  'Sigma Alimentos',
  'Grupo Bimbo',
  'Cervecería Cuauhtémoc Moctezuma',
]

const TEST_TITLES = [
  'Gerente de Mantenimiento',
  'Director de Operaciones',
  'Jefe de Compras',
  'Ingeniero de Planta',
]

async function testApolloConfiguration() {
  console.log('\n=== Apollo.io Configuration Test ===\n')

  const configured = isApolloConfigured()
  console.log(`Apollo.io configured: ${configured ? '✅ YES' : '❌ NO'}`)

  if (!configured) {
    console.log('\n⚠️  Set APOLLO_API_KEY in .env.local to test the API')
    console.log('   Get your API key at: https://app.apollo.io/#/settings/integrations/api')
    return false
  }

  // Reset detection to test fresh
  resetPlanDetection()

  return true
}

function showPlanCapabilities() {
  console.log('\n=== Plan Capabilities ===\n')

  const caps = getPlanCapabilities()

  console.log('Current plan features:')
  console.log(`  ✅ Organization enrichment: Always available`)
  console.log(`  ${caps.peopleSearch === true ? '✅' : caps.peopleSearch === false ? '❌' : '❓'} People/contact search: ${
    caps.peopleSearch === true ? 'Available' :
    caps.peopleSearch === false ? 'Requires paid plan' :
    'Not tested yet'
  }`)

  if (caps.peopleSearch === false) {
    console.log('\n📊 Free Plan Summary:')
    console.log('   - Can enrich company data (industry, size, website, LinkedIn)')
    console.log('   - Cannot search for contacts/employees')
    console.log('   - Cannot get verified emails')
    console.log('\n💡 To get contacts, upgrade at: https://app.apollo.io/settings/plans')
  }
}

async function testOrganizationEnrichment() {
  console.log('\n=== Organization Enrichment Test ===\n')

  // Test with a known domain
  const testDomain = 'grupolala.com'
  console.log(`Testing organization enrichment for: ${testDomain}`)

  const org = await enrichOrganization(testDomain)

  if (org) {
    console.log(`\n✅ Found organization:`)
    console.log(`   Name: ${org.name}`)
    console.log(`   Industry: ${org.industry || 'N/A'}`)
    console.log(`   Size: ${getCompanySizeCategory(org)}`)
    console.log(`   Employees: ${org.estimated_num_employees || 'N/A'}`)
    console.log(`   Website: ${org.website_url || 'N/A'}`)
    console.log(`   LinkedIn: ${org.linkedin_url || 'N/A'}`)
    console.log(`   Location: ${org.city}, ${org.country}`)
  } else {
    console.log(`❌ No organization found for domain: ${testDomain}`)
  }
}

async function testContactSearch() {
  console.log('\n=== Contact Search Test ===\n')
  console.log('Note: Contact search requires paid Apollo.io plan')
  console.log('On free plan, only company data will be returned\n')

  for (const company of TEST_COMPANIES.slice(0, 2)) {
    console.log(`\nSearching: ${company}`)

    const result = await searchPeopleByCompany(company, {
      titles: TEST_TITLES,
      limit: 5,
      emailStatus: ['verified', 'guessed'],
    })

    if (result.company) {
      console.log(`\n📊 Company Info (Free Plan):`)
      console.log(`   Name: ${result.company.name}`)
      console.log(`   Industry: ${result.company.industry || 'N/A'}`)
      console.log(`   Size: ${getCompanySizeCategory(result.company)}`)
      console.log(`   Website: ${result.company.website_url || 'N/A'}`)
      console.log(`   LinkedIn: ${result.company.linkedin_url || 'N/A'}`)
    } else {
      console.log(`   ⚠️  No company data found`)
    }

    if (result.contacts.length > 0) {
      console.log(`\n👥 Contacts (Paid Plan): ${result.contacts.length} found`)
      for (const contact of result.contacts.slice(0, 3)) {
        console.log(`   • ${contact.name} - ${contact.title || 'N/A'}`)
        console.log(`     Email: ${contact.email || 'N/A'} (${contact.email_status || 'N/A'})`)
      }
    } else {
      console.log(`\n👥 Contacts: None (requires paid plan)`)
    }

    console.log('\n' + '-'.repeat(50))
  }
}

async function testCaching() {
  console.log('\n=== Cache Test ===\n')

  // First call - should hit API
  console.log('First call (should hit API)...')
  const start1 = Date.now()
  await searchPeopleByCompany('Grupo LALA', { limit: 1 })
  console.log(`Time: ${Date.now() - start1}ms`)

  // Second call - should hit cache
  console.log('\nSecond call (should hit cache)...')
  const start2 = Date.now()
  await searchPeopleByCompany('Grupo LALA', { limit: 1 })
  console.log(`Time: ${Date.now() - start2}ms`)

  const cacheStats = getCacheStats()
  console.log(`\nCache stats: ${cacheStats.size} entries`)
  console.log(`Cached domains: ${cacheStats.entries.join(', ')}`)
}

async function main() {
  console.log('🚀 Apollo.io Integration Test')
  console.log('=' .repeat(50))

  const configured = await testApolloConfiguration()

  if (!configured) {
    console.log('\n❌ Tests skipped - Apollo.io not configured')
    process.exit(1)
  }

  try {
    await testOrganizationEnrichment()
    await testContactSearch()
    await testCaching()

    // Show plan capabilities summary
    showPlanCapabilities()

    console.log('\n' + '='.repeat(50))
    console.log('✅ All tests completed!')
    console.log('\nNext steps:')
    console.log('1. Run the prospector: curl -X POST http://localhost:3000/api/agents/prospector')
    console.log('2. Check leads dashboard: http://localhost:3000/dashboard/leads')

    const caps = getPlanCapabilities()
    if (caps.peopleSearch === false) {
      console.log('\n⚠️  Note: ProspectorAgent will use company enrichment only (free plan)')
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

main()
