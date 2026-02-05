/**
 * Email Service Test Script
 *
 * Tests the Resend email integration for lead notifications.
 * Run with: npx tsx scripts/test-email.ts
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Simple .env.local loader
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

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

// Load environment variables
loadEnvFile(resolve(process.cwd(), '.env.local'))

import {
  isEmailConfigured,
  testEmailConfiguration,
  sendHotLeadNotification,
  sendDailySummary,
} from '../src/lib/services/emailService'

async function testConfiguration() {
  console.log('\n=== Email Configuration Test ===\n')

  const configured = isEmailConfigured()
  console.log(`Email service configured: ${configured ? '✅ YES' : '❌ NO'}`)

  if (!configured) {
    console.log('\n⚠️  Set RESEND_API_KEY in .env.local to test email notifications')
    console.log('   Get your API key at: https://resend.com/api-keys')
    return false
  }

  console.log(`Recipients: ${process.env.LEAD_NOTIFICATION_EMAILS || 'Using default (COMPANY.email)'}`)

  return true
}

async function testSendEmail() {
  console.log('\n=== Test Email Send ===\n')

  console.log('Sending test email...')
  const result = await testEmailConfiguration()

  if (result.success) {
    console.log(`✅ Test email sent successfully!`)
    console.log(`   Message ID: ${result.messageId}`)
  } else {
    console.log(`❌ Failed to send test email: ${result.error}`)
  }

  return result.success
}

async function testHotLeadNotification() {
  console.log('\n=== Test HOT Lead Notification ===\n')

  const mockLead = {
    id: 'test-123',
    name: 'Juan Pérez',
    company: 'Grupo LALA (TEST)',
    email: 'jperez@test.com',
    phone: '+52 55 1234 5678',
    industry: 'Lácteos',
    location: 'Monterrey, México',
    website: 'https://www.grupolala.com',
    companySize: '1000+',
    score: 85,
    source: 'apollo_test',
    linkedinContacts: [
      { name: 'María García', title: 'Gerente de Mantenimiento', email: 'mgarcia@test.com' },
      { name: 'Carlos López', title: 'Director de Operaciones', email: 'clopez@test.com' },
    ],
  }

  console.log('Sending HOT lead notification for:', mockLead.company)
  console.log('Score:', mockLead.score)
  console.log('Contacts:', mockLead.linkedinContacts?.length || 0)

  const result = await sendHotLeadNotification(mockLead)

  if (result.success) {
    console.log(`\n✅ HOT lead notification sent!`)
    console.log(`   Message ID: ${result.messageId}`)
  } else {
    console.log(`\n❌ Failed to send notification: ${result.error}`)
  }

  return result.success
}

async function testDailySummary() {
  console.log('\n=== Test Daily Summary ===\n')

  const mockSummary = {
    date: new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    totalLeads: 15,
    hotLeads: 3,
    warmLeads: 7,
    coldLeads: 5,
    topLeads: [
      { company: 'Grupo LALA', score: 92, industry: 'Lácteos' },
      { company: 'Sigma Alimentos', score: 88, industry: 'Cárnicos' },
      { company: 'Grupo Bimbo', score: 85, industry: 'Alimentos' },
    ],
  }

  console.log('Sending daily summary...')
  console.log(`Total leads: ${mockSummary.totalLeads}`)
  console.log(`HOT: ${mockSummary.hotLeads}, WARM: ${mockSummary.warmLeads}, COLD: ${mockSummary.coldLeads}`)

  const result = await sendDailySummary(mockSummary)

  if (result.success) {
    console.log(`\n✅ Daily summary sent!`)
    console.log(`   Message ID: ${result.messageId}`)
  } else {
    console.log(`\n❌ Failed to send summary: ${result.error}`)
  }

  return result.success
}

async function main() {
  console.log('📧 Email Service Test')
  console.log('=' .repeat(50))

  const configured = await testConfiguration()

  if (!configured) {
    console.log('\n❌ Tests skipped - Email not configured')
    process.exit(1)
  }

  // Ask which test to run
  const testType = process.argv[2] || 'all'

  try {
    switch (testType) {
      case 'config':
        await testSendEmail()
        break
      case 'hot':
        await testHotLeadNotification()
        break
      case 'summary':
        await testDailySummary()
        break
      case 'all':
      default:
        await testSendEmail()
        await testHotLeadNotification()
        await testDailySummary()
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Email tests completed!')
    console.log('\nUsage:')
    console.log('  npx tsx scripts/test-email.ts         # Run all tests')
    console.log('  npx tsx scripts/test-email.ts config  # Test configuration only')
    console.log('  npx tsx scripts/test-email.ts hot     # Test HOT lead notification')
    console.log('  npx tsx scripts/test-email.ts summary # Test daily summary')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

main()
