import { supabase, handleSupabaseError } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/database'

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  // Sign up new user
  async signUp({ email, password, fullName }: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      // Create profile if user was created successfully
      if (data.user) {
        await this.createProfile({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null
        })
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { user: null, error }
    }
  }

  // Sign in existing user
  async signIn({ email, password }: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { user: null, error }
    }
  }

  // Sign out user
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // First check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return null
      }
      
      // If there's a session, get the user
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        // Don't throw for certain errors, just return null
        if (error.message.includes('Auth session missing')) {
          return null
        }
        throw error
      }
      return session
    } catch (error) {
      console.error('Get current session error:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Create user profile
  async createProfile(profileData: ProfileInsert): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create profile error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update profile error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get user with profile
  async getUserWithProfile(): Promise<AuthUser | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const profile = await this.getProfile(user.id)
      
      return {
        id: user.id,
        email: user.email!,
        profile: profile || undefined
      }
    } catch (error) {
      console.error('Get user with profile error:', error)
      return null
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Reset password error:', error)
      return { error }
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Update password error:', error)
      return { error }
    }
  }
}

export const authService = new AuthService()
export default authService