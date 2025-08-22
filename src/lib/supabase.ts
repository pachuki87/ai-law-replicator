import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors (modified for no-auth mode)
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  // Don't throw auth errors in no-auth mode
  if (error.message?.includes('Auth session missing') || error.message?.includes('JWT')) {
    console.warn('Auth error ignored in no-auth mode:', error.message)
    return
  }
  throw new Error(error.message || 'An error occurred with the database')
}

// Helper function to get current user (disabled for no-auth mode)
export const getCurrentUser = async () => {
  // Return null in no-auth mode
  return null
}

// Helper function to check if user is authenticated (disabled for no-auth mode)
export const isAuthenticated = async () => {
  // Always return true in no-auth mode
  return true
}