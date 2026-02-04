/**
 * Test script for LinkedIn MCP integration
 *
 * Usage:
 *   npx tsx scripts/test-linkedin.ts
 *
 * Prerequisites:
 *   1. docker mcp server enable linkedin-mcp-server
 *   2. docker mcp secret set linkedin-mcp-server.cookie=<your_li_at_cookie>
 *   3. Set LINKEDIN_ENABLED=true in .env.local (or omit to use default)
 */

import {
  searchLinkedIn,
  isLinkedInConfigured,
  getCacheStats,
} from '../src/lib/services/linkedinService'

async function testLinkedIn() {
  console.log('='.repeat(60))
  console.log('LinkedIn MCP Integration Test')
  console.log('='.repeat(60))
  console.log()

  // Check if LinkedIn is configured
  const isConfigured = isLinkedInConfigured()
  console.log(`LinkedIn configured: ${isConfigured}`)

  if (!isConfigured) {
    console.log('\n⚠️  LinkedIn not configured. Set LINKEDIN_ENABLED=true in .env.local')
    console.log('   or ensure the linkedin-mcp-server is properly set up.')
    return
  }

  // Test companies relevant to refrigeration industry in Mexico
  const testCompanies = [
    'Grupo Lala',
    'Sigma Alimentos',
    'Grupo Bimbo',
    'Alpura',
    'Nestlé México',
  ]

  console.log('\nTesting LinkedIn search for companies...\n')

  for (const company of testCompanies) {
    console.log(`\n--- Searching: ${company} ---`)

    try {
      const result = await searchLinkedIn(company, {
        getEmployees: true,
        limit: 3,
      })

      if (result.company) {
        console.log(`\n✓ Company found:`)
        console.log(`  Name: ${result.company.name}`)
        console.log(`  URL: ${result.company.linkedinUrl}`)
        console.log(`  Industry: ${result.company.industry || 'N/A'}`)
        console.log(`  Size: ${result.company.size || 'N/A'}`)
        console.log(`  Website: ${result.company.website || 'N/A'}`)
      } else {
        console.log(`\n✗ Company not found`)
      }

      if (result.employees.length > 0) {
        console.log(`\n✓ Employees found (${result.employees.length}):`)
        for (const emp of result.employees) {
          console.log(`  - ${emp.name}`)
          console.log(`    Title: ${emp.title}`)
          console.log(`    URL: ${emp.linkedinUrl}`)
          if (emp.location) console.log(`    Location: ${emp.location}`)
        }
      } else {
        console.log(`\n- No relevant employees found`)
      }
    } catch (error) {
      console.error(`\n✗ Error searching ${company}:`, error)
    }

    // Rate limiting pause
    console.log('\nWaiting 3 seconds before next search...')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  // Show cache stats
  console.log('\n' + '='.repeat(60))
  console.log('Cache Statistics')
  console.log('='.repeat(60))
  const stats = getCacheStats()
  console.log(`Cache size: ${stats.size}`)
  console.log(`Cached entries: ${stats.entries.join(', ') || 'none'}`)

  console.log('\n✓ Test completed!')
}

// Run the test
testLinkedIn().catch(console.error)
