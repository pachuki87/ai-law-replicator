import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  Client,
  ClientInsert,
  ClientUpdate,
  Case as CaseType,
  CaseInsert,
  CaseUpdate,
  CaseActivity,
  CaseActivityInsert,
  CaseActivityUpdate
} from '../types/database'

export interface CaseWithClient extends CaseType {
  client?: Client
}

export interface CaseWithActivities extends CaseType {
  activities: CaseActivity[]
  client?: Client
}

class CaseService {
  // ============ CLIENT OPERATIONS ============

  // Create new client
  async createClient(clientData: Omit<ClientInsert, 'user_id'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: null // No auth mode
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create client error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get all clients for current user
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get clients error:', error)
      return []
    }
  }

  // Get client by ID
  async getClient(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get client error:', error)
      return null
    }
  }

  // Update client
  async updateClient(clientId: string, updates: ClientUpdate): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update client error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete client
  async deleteClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete client error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ CASE OPERATIONS ============

  // Create new case
  async createCase(caseData: Omit<CaseInsert, 'user_id'>): Promise<CaseType | null> {
    try {
      // Generate automatic case number if not provided
      const caseNumber = caseData.case_number || `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      
      // Set open_date to current date if not provided
      const openDate = caseData.open_date || new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('cases')
        .insert({
          ...caseData,
          case_number: caseNumber,
          open_date: openDate,
          user_id: null // No auth mode
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create case error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get all cases for current user
  async getCases(): Promise<CaseWithClient[]> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get cases error:', error)
      return []
    }
  }

  // Get cases by status
  async getCasesByStatus(status: string): Promise<CaseWithClient[]> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get cases by status error:', error)
      return []
    }
  }

  // Get case by ID with client and activities
  async getCase(caseId: string): Promise<CaseWithActivities | null> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(*),
          activities:case_activities(*)
        `)
        .eq('id', caseId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get case error:', error)
      return null
    }
  }

  // Update case
  async updateCase(caseId: string, updates: CaseUpdate): Promise<CaseType | null> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', caseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update case error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete case
  async deleteCase(caseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete case error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ CASE ACTIVITY OPERATIONS ============

  // Create case activity
  async createActivity(activityData: Omit<CaseActivityInsert, 'user_id'>): Promise<CaseActivity | null> {
    try {
      const { data, error } = await supabase
        .from('case_activities')
        .insert({
          ...activityData,
          user_id: null // No auth mode
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create activity error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get activities for a case
  async getCaseActivities(caseId: string): Promise<CaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from('case_activities')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get case activities error:', error)
      return []
    }
  }

  // Update activity
  async updateActivity(activityId: string, updates: CaseActivityUpdate): Promise<CaseActivity | null> {
    try {
      const { data, error } = await supabase
        .from('case_activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', activityId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update activity error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Mark activity as completed
  async completeActivity(activityId: string): Promise<CaseActivity | null> {
    return this.updateActivity(activityId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  // Delete activity
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('case_activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete activity error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ SEARCH AND FILTER OPERATIONS ============

  // Search cases by title or description
  async searchCases(query: string): Promise<CaseWithClient[]> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(*)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search cases error:', error)
      return []
    }
  }

  // Get cases by client
  async getCasesByClient(clientId: string): Promise<CaseType[]> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get cases by client error:', error)
      return []
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<{
    totalCases: number
    activeCases: number
    completedCases: number
    totalClients: number
    pendingActivities: number
  }> {
    try {
      const [casesResult, clientsResult, activitiesResult] = await Promise.all([
        supabase
          .from('cases')
          .select('status'),
        supabase
          .from('clients')
          .select('id'),
        supabase
          .from('case_activities')
          .select('status')
          .eq('status', 'pending')
      ])

      const cases = casesResult.data || []
      const clients = clientsResult.data || []
      const pendingActivities = activitiesResult.data || []

      return {
        totalCases: cases.length,
        activeCases: cases.filter(c => c.status === 'active').length,
        completedCases: cases.filter(c => c.status === 'completed').length,
        totalClients: clients.length,
        pendingActivities: pendingActivities.length
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return {
        totalCases: 0,
        activeCases: 0,
        completedCases: 0,
        totalClients: 0,
        pendingActivities: 0
      }
    }
  }
}

export default new CaseService()