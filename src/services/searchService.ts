import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  SearchHistory,
  SearchHistoryInsert,
  SearchHistoryUpdate,
  SavedSearch,
  SavedSearchInsert,
  SavedSearchUpdate
} from '../types/database'

export interface SearchData {
  query: string
  searchType: string
  filters?: Record<string, any>
  results?: Record<string, any>
  resultsCount?: number
  caseId?: string
}

export interface SavedSearchData {
  name: string
  query: string
  searchType: string
  filters?: Record<string, any>
  description?: string
  caseId?: string
}

export interface SearchFilters {
  searchType?: string
  caseId?: string
  dateFrom?: string
  dateTo?: string
  hasResults?: boolean
}

class SearchService {
  // ============ SEARCH HISTORY OPERATIONS ============

  // Save search to history
  async saveSearchToHistory(searchData: SearchData): Promise<SearchHistory | null> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: 'anonymous',
          case_id: searchData.caseId || null,
          query: searchData.query,
          search_type: searchData.searchType,
          filters: searchData.filters || null,
          results: searchData.results || null,
          results_count: searchData.resultsCount || 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Save search to history error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get search history for current user
  async getSearchHistory(limit: number = 50): Promise<SearchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get search history error:', error)
      return []
    }
  }

  // Get search history by case
  async getSearchHistoryByCase(caseId: string, limit: number = 50): Promise<SearchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get search history by case error:', error)
      return []
    }
  }

  // Get search history by type
  async getSearchHistoryByType(searchType: string, limit: number = 50): Promise<SearchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('search_type', searchType)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get search history by type error:', error)
      return []
    }
  }

  // Get filtered search history
  async getFilteredSearchHistory(filters: SearchFilters, limit: number = 50): Promise<SearchHistory[]> {
    try {
      let query = supabase
        .from('search_history')
        .select('*')

      if (filters.searchType) {
        query = query.eq('search_type', filters.searchType)
      }

      if (filters.caseId) {
        query = query.eq('case_id', filters.caseId)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      if (filters.hasResults !== undefined) {
        if (filters.hasResults) {
          query = query.gt('results_count', 0)
        } else {
          query = query.eq('results_count', 0)
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get filtered search history error:', error)
      return []
    }
  }

  // Update search history entry
  async updateSearchHistory(searchId: string, updates: SearchHistoryUpdate): Promise<SearchHistory | null> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .update(updates)
        .eq('id', searchId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update search history error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete search history entry
  async deleteSearchHistory(searchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', searchId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete search history error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // Clear all search history
  async clearSearchHistory(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()

      if (error) throw error
      return true
    } catch (error) {
      console.error('Clear search history error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ SAVED SEARCHES OPERATIONS ============

  // Save search for later use
  async saveSearch(searchData: SavedSearchData): Promise<SavedSearch | null> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: 'anonymous',
          case_id: searchData.caseId || null,
          name: searchData.name,
          query: searchData.query,
          search_type: searchData.searchType,
          filters: searchData.filters || null,
          description: searchData.description || null
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Save search error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get saved searches for current user
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get saved searches error:', error)
      return []
    }
  }

  // Get saved searches by case
  async getSavedSearchesByCase(caseId: string): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('case_id', caseId)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get saved searches by case error:', error)
      return []
    }
  }

  // Get saved searches by type
  async getSavedSearchesByType(searchType: string): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('search_type', searchType)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get saved searches by type error:', error)
      return []
    }
  }

  // Get saved search by ID
  async getSavedSearch(searchId: string): Promise<SavedSearch | null> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('id', searchId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get saved search error:', error)
      return null
    }
  }

  // Update saved search
  async updateSavedSearch(searchId: string, updates: SavedSearchUpdate): Promise<SavedSearch | null> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', searchId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update saved search error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete saved search
  async deleteSavedSearch(searchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete saved search error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // Execute saved search
  async executeSavedSearch(searchId: string): Promise<SavedSearch | null> {
    try {
      const savedSearch = await this.getSavedSearch(searchId)
      if (!savedSearch) return null

      // Update last_used timestamp
      await this.updateSavedSearch(searchId, {
        last_used: new Date().toISOString()
      })

      return savedSearch
    } catch (error) {
      console.error('Execute saved search error:', error)
      return null
    }
  }

  // ============ SEARCH ANALYTICS AND UTILITIES ============

  // Search in search history
  async searchInHistory(query: string, limit: number = 20): Promise<SearchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .ilike('query', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search in history error:', error)
      return []
    }
  }

  // Get popular search queries
  async getPopularQueries(limit: number = 10): Promise<{ query: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query')

      if (error) throw error

      // Count query occurrences
      const queryCounts = (data || []).reduce((acc, item) => {
        const query = item.query.toLowerCase().trim()
        acc[query] = (acc[query] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Sort by count and return top queries
      return Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([query, count]) => ({ query, count }))
    } catch (error) {
      console.error('Get popular queries error:', error)
      return []
    }
  }

  // Get recent searches
  async getRecentSearches(limit: number = 10): Promise<SearchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get recent searches error:', error)
      return []
    }
  }

  // Get search statistics
  async getSearchStats(): Promise<{
    totalSearches: number
    searchesByType: Record<string, number>
    savedSearches: number
    recentSearches: number
    averageResultsPerSearch: number
  }> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('search_history')
        .select('search_type, results_count, created_at')

      if (searchError) throw searchError

      const { data: saved, error: savedError } = await supabase
        .from('saved_searches')
        .select('id')

      if (savedError) throw savedError

      const searchData = searches || []
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const searchesByType = searchData.reduce((acc, search) => {
        acc[search.search_type] = (acc[search.search_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const recentSearches = searchData.filter(
        search => new Date(search.created_at) > lastWeek
      ).length

      const totalResults = searchData.reduce((sum, search) => sum + (search.results_count || 0), 0)
      const averageResultsPerSearch = searchData.length > 0 ? totalResults / searchData.length : 0

      return {
        totalSearches: searchData.length,
        searchesByType,
        savedSearches: (saved || []).length,
        recentSearches,
        averageResultsPerSearch: Math.round(averageResultsPerSearch * 100) / 100
      }
    } catch (error) {
      console.error('Get search stats error:', error)
      return {
        totalSearches: 0,
        searchesByType: {},
        savedSearches: 0,
        recentSearches: 0,
        averageResultsPerSearch: 0
      }
    }
  }
}

export const searchService = new SearchService()
export default searchService