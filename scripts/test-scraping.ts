/**
 * Test script for SIEM and CANACINTRA data services
 * Run with: npx tsx scripts/test-scraping.ts
 */

import {
  searchSIEM,
  searchCANACINTRA,
  searchBusinessDirectories,
  getDataStats,
  isDENUEConfigured,
  isScrapingEnabled,
} from '../src/lib/services/scrapingService'

async function testSIEM() {
  console.log('\n' + '='.repeat(60))
  console.log('TESTING SIEM DATA SERVICE')
  console.log('='.repeat(60))

  console.log(`\nDENUE API configured: ${isDENUEConfigured() ? 'Yes' : 'No (using curated dataset)'}`)

  try {
    // Test with specific industries
    const results = await searchSIEM({
      industries: ['dairy', 'meat'],
      limit: 5,
    })

    console.log(`\nResults found: ${results.length}`)

    if (results.length > 0) {
      console.log('\nSample leads:')
      results.forEach((lead, i) => {
        console.log(`\n--- Lead ${i + 1} ---`)
        console.log(`  Company: ${lead.company}`)
        console.log(`  Name: ${lead.name}`)
        console.log(`  Industry: ${lead.industry}`)
        console.log(`  Location: ${lead.location}`)
        console.log(`  Phone: ${lead.phone || 'N/A'}`)
        console.log(`  Email: ${lead.email || 'N/A'}`)
        console.log(`  Website: ${lead.website || 'N/A'}`)
        console.log(`  Size: ${lead.companySize || 'N/A'}`)
        console.log(`  Source: ${lead.source}`)
      })
      return true
    } else {
      console.log('\n⚠️  No results from SIEM')
      return false
    }
  } catch (error) {
    console.error('\n❌ SIEM error:', error)
    return false
  }
}

async function testCANACINTRA() {
  console.log('\n' + '='.repeat(60))
  console.log('TESTING CANACINTRA DATA SERVICE')
  console.log('='.repeat(60))

  try {
    const results = await searchCANACINTRA({
      industries: ['beverages', 'cold_storage'],
      limit: 5,
    })

    console.log(`\nResults found: ${results.length}`)

    if (results.length > 0) {
      console.log('\nSample leads:')
      results.forEach((lead, i) => {
        console.log(`\n--- Lead ${i + 1} ---`)
        console.log(`  Company: ${lead.company}`)
        console.log(`  Name: ${lead.name}`)
        console.log(`  Industry: ${lead.industry}`)
        console.log(`  Location: ${lead.location}`)
        console.log(`  Phone: ${lead.phone || 'N/A'}`)
        console.log(`  Email: ${lead.email || 'N/A'}`)
        console.log(`  Website: ${lead.website || 'N/A'}`)
        console.log(`  Size: ${lead.companySize || 'N/A'}`)
        console.log(`  Source: ${lead.source}`)
      })
      return true
    } else {
      console.log('\n⚠️  No results from CANACINTRA')
      return false
    }
  } catch (error) {
    console.error('\n❌ CANACINTRA error:', error)
    return false
  }
}

async function testCombinedSearch() {
  console.log('\n' + '='.repeat(60))
  console.log('TESTING COMBINED SEARCH (ALL SOURCES)')
  console.log('='.repeat(60))

  try {
    const results = await searchBusinessDirectories({
      source: 'all',
      industries: ['food_processing'],
      limit: 10,
    })

    console.log(`\nResults found: ${results.length}`)
    console.log('\nCompanies found:')
    results.forEach((lead, i) => {
      console.log(`  ${i + 1}. ${lead.company} (${lead.industry}) - ${lead.source}`)
    })

    return results.length > 0
  } catch (error) {
    console.error('\n❌ Combined search error:', error)
    return false
  }
}

function showDataStats() {
  console.log('\n' + '='.repeat(60))
  console.log('CURATED DATASET STATISTICS')
  console.log('='.repeat(60))

  const stats = getDataStats()

  console.log(`\nTotal companies: ${stats.total}`)

  console.log('\nBy Industry:')
  for (const [industry, count] of Object.entries(stats.byIndustry)) {
    console.log(`  ${industry}: ${count}`)
  }

  console.log('\nBy Source:')
  for (const [source, count] of Object.entries(stats.bySource)) {
    console.log(`  ${source}: ${count}`)
  }
}

async function main() {
  console.log('🔍 Testing Business Directory Services\n')

  // Show configuration status
  console.log('Configuration:')
  console.log(`  Scraping enabled: ${isScrapingEnabled()}`)
  console.log(`  DENUE API token: ${isDENUEConfigured() ? 'Configured' : 'Not configured (will use curated data)'}`)

  // Show dataset statistics
  showDataStats()

  // Test SIEM
  const siemOk = await testSIEM()

  // Test CANACINTRA
  const canacintraOk = await testCANACINTRA()

  // Test combined search
  const combinedOk = await testCombinedSearch()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`  SIEM: ${siemOk ? '✅ Working' : '❌ Failed'}`)
  console.log(`  CANACINTRA: ${canacintraOk ? '✅ Working' : '❌ Failed'}`)
  console.log(`  Combined Search: ${combinedOk ? '✅ Working' : '❌ Failed'}`)

  if (!isDENUEConfigured()) {
    console.log('\n💡 To enable real-time data from INEGI:')
    console.log('   1. Get a free token at: https://www.inegi.org.mx/servicios/api_denue.html')
    console.log('   2. Add to .env.local: DENUE_API_TOKEN=your_token')
  }
}

main().catch(console.error)
