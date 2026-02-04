import { createClient } from '@supabase/supabase-js'
import type { ExtendedLead, LeadCategory, LeadStatus } from '@/types/agents'

// Create untyped supabase client for leads with extended fields
function getLeadsSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseAnonKey)
}

function getLeadsServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get all leads
export async function getAllLeads(): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching leads:', error)
    return null
  }
}

// Get leads by category
export async function getLeadsByCategory(category: LeadCategory): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('category', category)
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching leads by category:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching leads by category:', error)
    return null
  }
}

// Get leads by status
export async function getLeadsByStatus(status: LeadStatus): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching leads by status:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching leads by status:', error)
    return null
  }
}

// Get lead by ID
export async function getLeadById(id: string): Promise<ExtendedLead | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lead:', error)
      return null
    }

    return data as ExtendedLead
  } catch (error) {
    console.error('Unexpected error fetching lead:', error)
    return null
  }
}

// Get filtered leads
export async function getFilteredLeads(filters: {
  category?: LeadCategory
  status?: LeadStatus
  industry?: string
  minScore?: number
  search?: string
}): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    let query = supabase.from('leads').select('*')

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters.minScore) {
      query = query.gte('score', filters.minScore)
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query.order('score', { ascending: false })

    if (error) {
      console.error('Error fetching filtered leads:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching filtered leads:', error)
    return null
  }
}

// Get lead statistics
export async function getLeadStats(): Promise<{
  total: number
  byCategory: Record<LeadCategory, number>
  byStatus: Record<LeadStatus, number>
  avgScore: number
} | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase.from('leads').select('category, status, score')

    if (error) {
      console.error('Error fetching lead stats:', error)
      return null
    }

    const byCategory: Record<LeadCategory, number> = {
      HOT: 0,
      WARM: 0,
      COLD: 0,
      DISCARD: 0,
    }

    const byStatus: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    }

    let totalScore = 0

    for (const lead of data || []) {
      if (lead.category && lead.category in byCategory) {
        byCategory[lead.category as LeadCategory]++
      }
      if (lead.status && lead.status in byStatus) {
        byStatus[lead.status as LeadStatus]++
      }
      totalScore += lead.score || 0
    }

    return {
      total: data?.length || 0,
      byCategory,
      byStatus,
      avgScore: data?.length ? Math.round(totalScore / data.length) : 0,
    }
  } catch (error) {
    console.error('Unexpected error fetching lead stats:', error)
    return null
  }
}

// Update lead status
export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<boolean> {
  try {
    const supabase = getLeadsServerSupabase()
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating lead status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating lead status:', error)
    return false
  }
}

// Update lead
export async function updateLead(
  id: string,
  updates: Partial<ExtendedLead>
): Promise<boolean> {
  try {
    const supabase = getLeadsServerSupabase()
    const { error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating lead:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating lead:', error)
    return false
  }
}

// Get HOT leads requiring action
export async function getHotLeadsForAction(): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('category', 'HOT')
      .in('status', ['new', 'contacted'])
      .neq('consent_status', 'denied')
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching HOT leads:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching HOT leads:', error)
    return null
  }
}

// Get recent leads
export async function getRecentLeads(limit: number = 10): Promise<ExtendedLead[] | null> {
  try {
    const supabase = getLeadsSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent leads:', error)
      return null
    }

    return data as ExtendedLead[]
  } catch (error) {
    console.error('Unexpected error fetching recent leads:', error)
    return null
  }
}
