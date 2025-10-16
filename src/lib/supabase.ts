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
    detectSessionInUrl: true,
    flowType: 'pkce' // Usar PKCE flow para OAuth con redirección
  }
})

// Para configurar correctamente Google OAuth, necesitas agregar estos redirect URIs en Google Cloud Console:
// 1. Ve a Google Cloud Console -> APIs & Services -> Credentials
// 2. Selecciona tu OAuth 2.0 Client ID: 805825876993-8qa112kai2i9v5hpl4r1m542g0kjrqf3.apps.googleusercontent.com
// 3. En la sección "Authorized redirect URIs", agrega las siguientes URLs:
//    - http://localhost:5175/auth/callback
//    - https://iaparaabogados.netlify.app/auth/callback
//    - https://rtdypqcoafrmvndbpqtm.supabase.co/auth/v1/callback
// 4. En la sección "Authorized JavaScript origins", asegúrate de tener:
//    - http://localhost:5175
//    - https://iaparaabogados.netlify.app
// 5. Guarda los cambios

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'An error occurred with the database')
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}